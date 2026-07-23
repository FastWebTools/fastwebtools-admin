/**
 * FastWebTools Admin Dashboard - Cloudflare Worker
 *
 * WHAT WAS BROKEN AND WHY:
 * The previous version called `await response.json()` directly on the
 * backend's response. If the backend ever returns anything that isn't
 * valid JSON — an HTML error page, a plain-text error, or Cloudflare's own
 * edge error page (e.g. "error code: 1042") — that call throws a
 * SyntaxError ("Unexpected token 'e', 'error code...' is not valid JSON").
 * That uncaught-looking failure is what surfaced as a 500 on /api/login.
 *
 * THE FIX:
 * Never call `.json()` blindly. Always read the response as text first,
 * then try to JSON.parse it ourselves. If parsing fails, we still return
 * a clean, valid JSON response to the browser (never HTML, never a raw
 * crash) so the frontend's `fetch(...).json()` calls never blow up.
 * We also add a request timeout + one retry, and console.log/error at
 * every step so failures are visible in `wrangler tail` / the dashboard
 * logs instead of silently returning "not valid JSON".
 */

// ============================================================
// CONFIG
// ============================================================
const BACKEND_BASE = "https://fastwebtools-admin.formyworkupwork.workers.dev";
const REQUEST_TIMEOUT_MS = 10000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// ============================================================
// SMALL HELPERS
// ============================================================

// Always returns a valid JSON HTTP response with CORS headers attached.
function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, CORS_HEADERS),
  });
}

// Fetch with a timeout, so a hung backend can't hang the whole request.
//
// If a Service Binding named BACKEND is configured (Settings > Bindings >
// Service binding, pointed at the backend Worker), we use it. Service
// bindings route directly between Workers inside Cloudflare's network and
// completely bypass the public internet — which is what avoids the
// "error code: 1042" restriction Cloudflare applies to a Worker calling
// another *.workers.dev Worker over the public network.
//
// If no binding is configured, this falls back to a normal public fetch
// (the old behavior), so the worker still works even before you set the
// binding up.
async function fetchWithTimeout(env, path, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs || REQUEST_TIMEOUT_MS);
  const finalOptions = Object.assign({}, options, { signal: controller.signal });
  try {
    if (env && env.BACKEND && typeof env.BACKEND.fetch === "function") {
      return await env.BACKEND.fetch("https://internal" + path, finalOptions);
    }
    return await fetch(BACKEND_BASE + path, finalOptions);
  } finally {
    clearTimeout(timer);
  }
}

// Fetch a path from the backend (via service binding if configured, else a
// public URL), read the body as text, and try to parse it as JSON — but
// never throw if it isn't JSON. Optionally retries once on network error
// or 5xx, since transient backend hiccups shouldn't surface as a hard fail.
async function safeFetchJson(env, path, options, { retries = 1, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetchWithTimeout(env, path, options, timeoutMs);
      const raw = await resp.text();

      let parsed = null;
      let parseOk = false;
      try {
        parsed = raw ? JSON.parse(raw) : null;
        parseOk = true;
      } catch (parseErr) {
        parseOk = false;
      }

      console.log(
        "[safeFetchJson]", options && options.method || "GET", path,
        "-> status:", resp.status, "json:", parseOk,
        !parseOk ? "raw preview: " + raw.slice(0, 200) : ""
      );

      // Retry once more on server errors before giving up.
      if (!resp.ok && resp.status >= 500 && attempt < retries) {
        lastError = new Error("Backend returned " + resp.status);
        continue;
      }

      return {
        networkOk: true,
        status: resp.status,
        ok: resp.ok,
        parseOk,
        data: parsed,
        raw,
        contentType: resp.headers.get("Content-Type") || "",
      };
    } catch (err) {
      lastError = err;
      console.error("[safeFetchJson] attempt", attempt, "failed for", path, "-", err && err.message);
      if (attempt < retries) continue;
    }
  }
  return { networkOk: false, error: lastError };
}

// ============================================================
// ROUTE HANDLERS
// ============================================================

async function handleLogin(request, env) {
  let username = "";
  let password = "";
  try {
    const body = await request.json();
    username = body.username || "";
    password = body.password || "";
  } catch (err) {
    return jsonResponse({ success: false, message: "Request body must be valid JSON." }, 400);
  }

  console.log("Login attempt for:", username);

  const result = await safeFetchJson(
    env,
    "/admin/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    },
    { retries: 1 }
  );

  if (!result.networkOk) {
    console.error("Login: could not reach backend -", result.error && result.error.message);
    return jsonResponse(
      { success: false, message: "Could not reach the authentication backend. Please try again shortly." },
      502
    );
  }

  if (!result.parseOk) {
    // This is the exact case that used to crash with "not valid JSON".
    // The backend returned something that isn't JSON (HTML error page,
    // Cloudflare edge error like "error code: 1042", plain text, etc).
    console.error(
      "Login: backend did not return JSON. status:", result.status,
      "content-type:", result.contentType, "body preview:", result.raw.slice(0, 300)
    );
    return jsonResponse(
      {
        success: false,
        message: "Authentication backend returned an unexpected response (not JSON). This usually means the backend is unreachable or is returning an edge error page.",
      },
      502
    );
  }

  // Backend gave us real JSON — pass it through with its original status code.
  console.log("Login response status:", result.status, "body:", result.data);
  return jsonResponse(result.data, result.status);
}

async function handleProxy(request, url, env) {
  const targetPath = url.pathname.replace(/^\/api/, "/admin");
  const targetPathWithQuery = targetPath + url.search;

  const headers = {};
  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;
  const ct = request.headers.get("Content-Type");
  if (ct) headers["Content-Type"] = ct;

  let body;
  if (!["GET", "HEAD"].includes(request.method)) {
    try {
      body = await request.arrayBuffer();
    } catch (err) {
      return jsonResponse({ success: false, message: "Failed to read request body." }, 400);
    }
  }

  const result = await safeFetchJson(env, targetPathWithQuery, { method: request.method, headers, body }, { retries: 1 });

  if (!result.networkOk) {
    console.error("Proxy: could not reach backend for", targetPathWithQuery, "-", result.error && result.error.message);
    return jsonResponse({ success: false, message: "Could not reach the backend service. Please try again shortly." }, 502);
  }

  if (result.parseOk) {
    // Clean JSON from the backend — forward it as-is with the original status.
    return jsonResponse(result.data, result.status);
  }

  if (result.ok) {
    // Backend succeeded but returned non-JSON on purpose (e.g. a CSV/text
    // export). Pass it through unchanged rather than forcing it into JSON.
    return new Response(result.raw, {
      status: result.status,
      headers: Object.assign({ "Content-Type": result.contentType || "text/plain;charset=UTF-8" }, CORS_HEADERS),
    });
  }

  // Backend failed AND didn't return JSON (HTML error page, Cloudflare edge
  // error like "error code: 1042", etc). Wrap it in a clean JSON error so
  // the frontend's `.json()` call never throws.
  console.error("Proxy: non-JSON error from backend. status:", result.status, "body preview:", result.raw.slice(0, 300));
  return jsonResponse(
    {
      success: false,
      message: "Backend error (status " + result.status + "). The backend did not return a valid JSON response.",
      status: result.status,
    },
    result.status >= 400 ? result.status : 502
  );
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (url.pathname === "/api/login") {
    return handleLogin(request, env);
  }

  if (url.pathname.startsWith("/api/")) {
    return handleProxy(request, url, env);
  }

  // Everything else serves the dashboard shell.
  return new Response(DASHBOARD_HTML, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

// ============================================================
// WORKER ENTRYPOINT
// ============================================================
// Wrapped in try/catch so literally nothing can crash the worker with an
// unhandled exception — API routes always get valid JSON back, even on
// a bug we didn't anticipate.
export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env);
    } catch (err) {
      console.error("Unhandled worker error:", err && err.stack ? err.stack : err);
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        return jsonResponse({ success: false, message: "Internal server error: " + (err && err.message ? err.message : String(err)) }, 500);
      }
      return new Response("Internal Server Error", { status: 500, headers: { "Content-Type": "text/plain" } });
    }
  },
};

// ============================================================
// DASHBOARD HTML - COMPLETE & WORKING
// ============================================================
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FastWebTools · Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

/* ===== THEME VARIABLES =====
   Fix: the theme toggle previously changed a CSS variable that nothing
   actually used, so clicking it did nothing visible. Every color below
   now comes from a variable, and [data-theme="light"] on <html> overrides
   them, so toggling actually re-skins the whole app. */
:root {
  --bg-page: #0f0c29;
  --bg-gradient: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  --surface: rgba(255,255,255,0.04);
  --surface-2: rgba(255,255,255,0.06);
  --border: rgba(255,255,255,0.08);
  --text: #f2f1fb;
  --text-dim: #8a86ab;
  --accent: #7c6bff;
  --accent-2: #00d4b1;
  --danger: #ff6b6b;
  --warn: #ffb545;
  --modal-bg: #191634;
}
html[data-theme="light"] {
  --bg-page: #eef0fb;
  --bg-gradient: linear-gradient(135deg, #eef0fb, #e3e6f8, #f7f8fd);
  --surface: rgba(20,20,60,0.035);
  --surface-2: rgba(20,20,60,0.055);
  --border: rgba(20,20,60,0.10);
  --text: #1b1a2b;
  --text-dim: #63607d;
  --modal-bg: #ffffff;
}
body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-page);
  color: var(--text);
  min-height: 100vh;
  transition: background 0.2s ease, color 0.2s ease;
}
.hidden { display: none !important; }
input, button, select, textarea { font-family: inherit; }

/* ===== LOGIN ===== */
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: var(--bg-gradient);
}
.login-card {
  background: var(--surface-2);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 40px 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.login-card h1 { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 4px; }
.login-card .sub { text-align: center; color: var(--text-dim); font-size: 14px; margin-bottom: 24px; }
.login-card .logo { text-align: center; font-size: 40px; margin-bottom: 16px; color: var(--accent); }
.field { display: block; margin-bottom: 16px; }
.field label {
  display: block; font-size: 12px; font-weight: 600; color: var(--text-dim);
  margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;
}
.field input, .field select {
  width: 100%; padding: 12px 16px; background: var(--surface-2);
  border: 1px solid var(--border); border-radius: 12px; color: var(--text);
  font-size: 14px; outline: none; transition: border-color 0.2s;
}
.field input:focus, .field select:focus { border-color: var(--accent); }
.field .input-wrap {
  display: flex; align-items: center; background: var(--surface-2);
  border: 1px solid var(--border); border-radius: 12px; padding: 0 16px; transition: border-color 0.2s;
}
.field .input-wrap:focus-within { border-color: var(--accent); }
.field .input-wrap input { border: none; padding: 12px 8px 12px 0; flex: 1; background: transparent; }
.field .input-wrap i { color: var(--text-dim); margin-right: 10px; }
.field .input-wrap button { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 8px; }
.login-error {
  background: rgba(255,107,107,0.12); border: 1px solid rgba(255,107,107,0.3); color: var(--danger);
  padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; display: none;
}
.login-error.show { display: flex; gap: 10px; align-items: center; }
.btn-primary {
  width: 100%; padding: 14px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
  background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #0f0c29; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,107,255,0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-primary .spinner { display: none; }
.btn-primary.loading .spinner { display: inline-block; }
.btn-primary.loading .label { display: none; }
.login-footer { text-align: center; font-size: 12px; color: var(--text-dim); margin-top: 20px; }
.login-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 20px; color: var(--text-dim); }
.login-row label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.login-row label input { accent-color: var(--accent); width: auto; }
.login-row a { color: var(--accent); text-decoration: none; cursor: pointer; }

/* ===== APP ===== */
.app-view { display: flex; min-height: 100vh; }
.sidebar {
  width: 220px; background: var(--surface); border-right: 1px solid var(--border);
  padding: 20px 14px; display: flex; flex-direction: column; position: sticky; top: 0;
  height: 100vh; flex-shrink: 0; z-index: 40;
}
.sidebar .brand {
  display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700;
  padding-bottom: 20px; border-bottom: 1px solid var(--border); margin-bottom: 16px;
}
.sidebar .brand i { color: var(--accent); font-size: 22px; }
.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px;
  color: var(--text-dim); cursor: pointer; transition: all 0.15s; font-size: 14px; font-weight: 500;
}
.nav-item:hover { background: var(--surface-2); color: var(--text); }
.nav-item.active { background: rgba(124,107,255,0.15); color: var(--accent); }
.nav-item i { width: 18px; }
.sidebar-bottom { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border); }
.live-pill { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-dim); }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-2); animation: pulse 1.8s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0,212,177,0.6); } 70% { box-shadow: 0 0 0 8px rgba(0,212,177,0); } }

.main-wrap { flex: 1; min-width: 0; }
.topbar {
  display: flex; align-items: center; gap: 16px; padding: 14px 24px; border-bottom: 1px solid var(--border);
  background: var(--surface); position: sticky; top: 0; z-index: 10;
}
.topbar .title { font-weight: 600; font-size: 18px; }
.search-wrap {
  display: flex; align-items: center; gap: 10px; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 10px; padding: 8px 14px; flex: 1; max-width: 350px;
}
.search-wrap input { border: none; background: transparent; color: var(--text); outline: none; flex: 1; font-size: 13px; }
.search-wrap i { color: var(--text-dim); }
.topbar-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.icon-btn {
  background: none; border: none; color: var(--text-dim); font-size: 16px; cursor: pointer;
  padding: 8px; border-radius: 8px; transition: all 0.15s;
}
.icon-btn:hover { background: var(--surface-2); color: var(--text); }
.avatar {
  width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #0f0c29;
}

.content { padding: 24px; max-width: 1400px; margin: 0 auto; }
.page { display: none; }
.page.active { display: block; animation: fadeIn 0.25s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.page-head h2 { font-size: 22px; font-weight: 700; }
.page-head .sub { color: var(--text-dim); font-size: 14px; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px; position: relative; }
.stat-card .value { font-size: 28px; font-weight: 700; }
.stat-card .label { color: var(--text-dim); font-size: 13px; margin-top: 4px; }
.stat-card .icon { position: absolute; top: 18px; right: 18px; font-size: 22px; opacity: 0.25; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px; overflow: hidden; }
.card h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }

/* Fix: charts previously had no bounded container, so a doughnut chart
   would render at its natural (huge) size and overflow the card, forcing
   the whole page to scroll to see it. A fixed-height, width-bound wrapper
   plus Chart.js's maintainAspectRatio:false keeps every chart inside its card. */
.chart-box { position: relative; width: 100%; height: 260px; }
.chart-box canvas { max-width: 100%; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
table th {
  text-align: left; padding: 10px 12px; color: var(--text-dim); font-weight: 600; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border); white-space: nowrap;
}
table td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
table tr:hover { background: var(--surface-2); }
.status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.status-badge.published { background: rgba(0,212,177,0.15); color: var(--accent-2); }
.status-badge.pending { background: rgba(255,181,69,0.15); color: var(--warn); }
.status-badge.spam { background: rgba(255,107,107,0.15); color: var(--danger); }
.row-actions { display: flex; gap: 4px; white-space: nowrap; }
.row-actions button {
  background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 4px 8px;
  border-radius: 6px; font-size: 13px; transition: all 0.15s;
}
.row-actions button:hover { background: var(--surface-2); color: var(--text); }
.row-actions .danger:hover { color: var(--danger); }
.date-cell { white-space: nowrap; color: var(--text-dim); font-size: 12px; }

.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; flex-wrap: wrap; gap: 10px; }
.btn-ghost {
  padding: 8px 16px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px;
  color: var(--text); cursor: pointer; font-size: 13px; transition: all 0.15s;
}
.btn-ghost:hover { background: var(--surface); }
.btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
.icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-danger {
  padding: 8px 16px; background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3);
  border-radius: 10px; color: var(--danger); cursor: pointer; font-size: 13px; font-weight: 600;
}
.btn-danger:hover { background: rgba(255,107,107,0.2); }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 100;
  display: none; align-items: center; justify-content: center; padding: 20px;
}
.modal-overlay.show { display: flex; }
.modal {
  background: var(--modal-bg); border: 1px solid var(--border); border-radius: 18px; max-width: 480px;
  width: 100%; max-height: 90vh; display: flex; flex-direction: column; color: var(--text);
}
.modal-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.modal-head h3 { font-size: 16px; font-weight: 600; }
.modal-body { padding: 20px; overflow-y: auto; }
.modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--border); }
.toast-stack { position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 200; max-width: 360px; }
.toast {
  padding: 12px 16px; border-radius: 12px; background: var(--modal-bg); border: 1px solid var(--border);
  font-size: 13px; animation: slideUp 0.25s ease; display: flex; align-items: flex-start; gap: 10px; color: var(--text);
}
.toast.success i { color: var(--accent-2); }
.toast.error i { color: var(--danger); }
.toast.info i { color: var(--accent); }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .sidebar { position: fixed; left: -240px; top: 0; height: 100vh; transition: left 0.2s; }
  .sidebar.open { left: 0; }
  .grid-2 { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .search-wrap { max-width: 140px; }
  .chart-box { height: 220px; }
}
</style>

<body>

<!-- ===== LOGIN ===== -->
<div id="loginView" class="login-view">
  <div class="login-card">
    <div class="logo"><i class="fa-solid fa-layer-group"></i></div>
    <h1>FastWebTools</h1>
    <p class="sub">Admin control center</p>
    <div id="loginError" class="login-error"><i class="fa-solid fa-triangle-exclamation"></i> <span>Invalid credentials</span></div>
    <div class="field">
      <label>Username</label>
      <div class="input-wrap">
        <i class="fa-regular fa-user"></i>
        <input type="text" id="username" placeholder="Enter username">
      </div>
    </div>
    <div class="field">
      <label>Password</label>
      <div class="input-wrap">
        <i class="fa-solid fa-lock"></i>
        <input type="password" id="password" placeholder="Enter password">
        <button type="button" id="togglePass"><i class="fa-regular fa-eye"></i></button>
      </div>
    </div>
    <div class="login-row">
      <label><input type="checkbox" id="remember"> Remember me</label>
      <a id="forgotPass">Forgot password?</a>
    </div>
    <button class="btn-primary" id="loginBtn">
      <span class="label"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign in</span>
      <span class="spinner"><i class="fa-solid fa-circle-notch fa-spin"></i></span>
    </button>
    <div class="login-footer">© 2026 FastWebTools · v2.5.0</div>
  </div>
</div>

<!-- ===== APP ===== -->
<div id="appView" class="app-view hidden">
  <aside class="sidebar" id="sidebar">
    <div class="brand"><i class="fa-solid fa-layer-group"></i> FastWebTools</div>
    <nav>
      <div class="nav-item active" data-page="overview"><i class="fa-solid fa-gauge-high"></i> Overview</div>
      <div class="nav-item" data-page="comments"><i class="fa-solid fa-comments"></i> Comments</div>
      <div class="nav-item" data-page="settings"><i class="fa-solid fa-gear"></i> Settings</div>
    </nav>
    <div class="sidebar-bottom">
      <div class="live-pill"><span class="live-dot"></span> <span id="liveCount">0</span> live now</div>
      <button class="btn-ghost" style="width:100%;margin-top:10px;text-align:center;" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
    </div>
  </aside>

  <div class="main-wrap">
    <header class="topbar">
      <button class="icon-btn" id="menuToggle"><i class="fa-solid fa-bars"></i></button>
      <span class="title" id="pageTitle">Overview</span>
      <div class="search-wrap">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="globalSearch" placeholder="Search... (Enter)">
      </div>
      <div class="topbar-actions">
        <button class="icon-btn" id="refreshBtn" title="Refresh"><i class="fa-solid fa-rotate"></i></button>
        <button class="icon-btn" id="themeToggle" title="Toggle theme"><i class="fa-solid fa-moon"></i></button>
        <span class="avatar" id="userAvatar">FW</span>
      </div>
    </header>

    <div class="content">
      <!-- Overview -->
      <div class="page active" id="page-overview">
        <div class="page-head">
          <div><h2>Overview</h2><div class="sub">Real-time activity snapshot</div></div>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-dim);cursor:pointer;">
            <input type="checkbox" id="autoRefresh" checked> Auto-refresh
          </label>
        </div>
        <div class="stats-grid" id="statsGrid"></div>
        <div class="grid-2">
          <div class="card">
            <h3>Daily activity</h3>
            <div class="chart-box"><canvas id="chartDaily"></canvas></div>
          </div>
          <div class="card">
            <h3>Top tools</h3>
            <div class="chart-box"><canvas id="chartTools"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div class="page" id="page-comments">
        <div class="page-head"><div><h2>Comments</h2><div class="sub">Manage all comments</div></div></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
          <div class="search-wrap" style="max-width:280px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="commentSearch" placeholder="Search comments... (Enter)">
          </div>
          <select id="statusFilter" class="btn-ghost" style="padding:8px 14px;">
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="spam">Spam</option>
          </select>
          <button class="btn-ghost" id="refreshComments"><i class="fa-solid fa-rotate"></i> Refresh</button>
        </div>
        <div class="card">
          <div id="commentsList"><div style="padding:30px;text-align:center;color:var(--text-dim);"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div></div>
        </div>
        <div class="pagination">
          <span class="sub" id="pageInfo">Page 1</span>
          <div>
            <button class="icon-btn" id="prevPage"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="icon-btn" id="nextPage"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="page" id="page-settings">
        <div class="page-head"><div><h2>Settings</h2><div class="sub">Account preferences</div></div></div>
        <div class="card" style="max-width:500px;">
          <h3>Change Password</h3>
          <div class="field"><label>Current Password</label><input type="password" id="curPass"></div>
          <div class="field"><label>New Password</label><input type="password" id="newPass"></div>
          <div class="field"><label>Confirm Password</label><input type="password" id="confirmPass"></div>
          <button class="btn-primary" style="width:auto;padding:10px 28px;" id="changePassBtn">Update Password</button>
        </div>
        <div class="card" style="max-width:500px;margin-top:16px;border-color:rgba(255,107,107,0.3);">
          <h3 style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Danger Zone</h3>
          <button class="btn-danger" id="clearAllBtn">Clear All Data</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ===== MODAL ===== -->
<div class="modal-overlay" id="modalOverlay">
  <div class="modal">
    <div class="modal-head"><h3 id="modalTitle">Modal</h3><button class="icon-btn" id="modalClose"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-foot" id="modalFoot"></div>
  </div>
</div>

<!-- ===== TOASTS ===== -->
<div class="toast-stack" id="toastStack"></div>

<script>
(function() {
'use strict';

// ===== CONFIG =====
var API_BASE = '/api';
var TOKEN_KEY = 'fwt_token';
var THEME_KEY = 'fwt_theme';
var PAGE_LIMIT = 20;

// ===== STATE =====
var token = localStorage.getItem(TOKEN_KEY) || null;
var currentPage = 'overview';
var commentsPage = 1;
var lastCommentsCount = 0; // used to guess whether a "next page" exists
var liveCountTimer = null;
var autoRefreshTimer = null;
var charts = {};

// ===== HELPERS =====
function $(id) { return document.getElementById(id); }
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

// Different backends name the same field differently (username vs name vs
// author, id vs _id vs comment_id, etc). This picks the first key that
// actually has a value, so the UI doesn't break just because a field name
// guess was wrong.
function pick(obj) {
  if (!obj) return undefined;
  for (var i = 1; i < arguments.length; i++) {
    var key = arguments[i];
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  return undefined;
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function toast(msg, type) {
  type = type || 'info';
  var stack = $('toastStack');
  var icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = '<i class="fa-solid ' + icons[type] + '"></i> <span></span>';
  el.querySelector('span').textContent = msg;
  stack.appendChild(el);
  setTimeout(function() { el.style.opacity = '0'; setTimeout(function() { el.remove(); }, 300); }, 4200);
}

function showModal(title, bodyHtml, buttons) {
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = bodyHtml;
  var foot = $('modalFoot');
  foot.innerHTML = '';
  (buttons || []).forEach(function(b) {
    var btn = document.createElement('button');
    btn.className = b.className || 'btn-ghost';
    btn.textContent = b.label;
    btn.onclick = b.onClick;
    foot.appendChild(btn);
  });
  $('modalOverlay').classList.add('show');
}
function closeModal() { $('modalOverlay').classList.remove('show'); }
$('modalClose').onclick = closeModal;
$('modalOverlay').onclick = function(e) { if (e.target === this) closeModal(); };

function fmtNum(n) { n = Number(n) || 0; return n >= 1000 ? (n/1000).toFixed(1) + 'k' : String(n); }

// Fix #2: comments only showed a relative "1d ago" label. This produces an
// exact, unambiguous date+time, e.g. "Jan 15, 2026 10:30 AM".
function formatExactDateTime(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var h = d.getHours();
  var ampm = h >= 12 ? 'PM' : 'AM';
  var h12 = h % 12; if (h12 === 0) h12 = 12;
  var mins = String(d.getMinutes()).padStart(2, '0');
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' ' + h12 + ':' + mins + ' ' + ampm;
}

// ===== API =====
// Fix: previously threw a generic "Request failed" with no detail, so every
// failure showed as a vague "Update failed" / "Delete failed" toast with no
// way to diagnose it. Now it always surfaces the backend's own message.
async function apiCall(path, opts) {
  opts = opts || {};
  var headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  var resp;
  try {
    resp = await fetch(API_BASE + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body || undefined,
    });
  } catch (networkErr) {
    throw new Error('Network error — could not reach the server.');
  }
  if (resp.status === 401) { logout(); throw new Error('Your session expired. Please sign in again.'); }
  var raw = await resp.text();
  var data;
  try { data = raw ? JSON.parse(raw) : {}; }
  catch (e) { throw new Error('Server returned an invalid response (status ' + resp.status + ').'); }
  if (!resp.ok || data.success === false) {
    throw new Error(data.message || data.error || ('Request failed (status ' + resp.status + ').'));
  }
  return data;
}

async function login(username, password) {
  var resp = await fetch(API_BASE + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password }),
  });
  var raw = await resp.text();
  try { return JSON.parse(raw); }
  catch (e) { return { success: false, message: 'Server returned an invalid response.' }; }
}

async function getStats() { return apiCall('/stats'); }
async function getRealtimeVisitors() { return apiCall('/visitors/realtime'); }
async function getComments(page, status, search) {
  var q = new URLSearchParams();
  q.set('page', page || 1);
  q.set('limit', PAGE_LIMIT);
  if (status && status !== 'all') q.set('status', status);
  if (search) q.set('search', search);
  return apiCall('/comments?' + q.toString());
}
async function deleteComment(id) { return apiCall('/comment/' + encodeURIComponent(id), { method: 'DELETE' }); }
async function updateComment(id, data) { return apiCall('/comment/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(data) }); }
async function changePasswordApi(data) { return apiCall('/change-password', { method: 'POST', body: JSON.stringify(data) }); }
async function clearAllApi() { return apiCall('/clear-all', { method: 'DELETE' }); }

// ===== AUTH =====
function logout() {
  token = null;
  localStorage.removeItem(TOKEN_KEY);
  stopLiveCounter();
  stopAutoRefreshTimer();
  $('appView').classList.add('hidden');
  $('loginView').classList.remove('hidden');
}

$('loginBtn').onclick = async function(e) {
  e.preventDefault();
  var btn = this;
  var err = $('loginError');
  err.classList.remove('show');
  btn.classList.add('loading');
  btn.disabled = true;
  try {
    var data = await login($('username').value, $('password').value);
    if (data.success && data.token) {
      token = data.token;
      if ($('remember').checked) localStorage.setItem(TOKEN_KEY, token);
      toast('Welcome back!', 'success');
      showApp();
    } else {
      err.querySelector('span').textContent = data.message || 'Invalid credentials';
      err.classList.add('show');
    }
  } catch (e) {
    err.querySelector('span').textContent = 'Network error. Please try again.';
    err.classList.add('show');
  }
  btn.classList.remove('loading');
  btn.disabled = false;
};

$('togglePass').onclick = function() {
  var inp = $('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  this.querySelector('i').className = inp.type === 'password' ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
};
$('forgotPass').onclick = function() { toast('Contact your workspace admin.', 'info'); };

// ===== APP =====
function showApp() {
  $('loginView').classList.add('hidden');
  $('appView').classList.remove('hidden');
  loadPage('overview');
  startLiveCounter();
  startAutoRefreshTimer();
}

// Fix #9: auto-refresh checkbox previously had no effect because nothing
// ever started an interval tied to it. This starts one interval when the
// app loads and lets the checkbox gate each tick.
function startAutoRefreshTimer() {
  stopAutoRefreshTimer();
  autoRefreshTimer = setInterval(function() {
    if ($('autoRefresh') && $('autoRefresh').checked) loadCurrentPage();
  }, 30000);
}
function stopAutoRefreshTimer() { if (autoRefreshTimer) clearInterval(autoRefreshTimer); }

// Fix #7: live visitor counter never fetched anything. Poll every 30s;
// if the endpoint fails or isn't supported, fail silently and leave the
// counter as-is rather than breaking the dashboard.
function startLiveCounter() {
  stopLiveCounter();
  pollLiveCounter();
  liveCountTimer = setInterval(pollLiveCounter, 30000);
}
function stopLiveCounter() { if (liveCountTimer) clearInterval(liveCountTimer); }
async function pollLiveCounter() {
  try {
    var data = await getRealtimeVisitors();
    var live = pick(data, 'live', 'liveVisitors', 'live_visitors', 'count', 'visitors', 'online');
    if (live !== undefined) $('liveCount').textContent = fmtNum(live);
  } catch (e) { /* endpoint may not be supported yet — leave counter as-is */ }
}

function loadCurrentPage() {
  if (currentPage === 'overview') loadOverview();
  else if (currentPage === 'comments') loadComments();
}

function loadPage(page) {
  currentPage = page;
  qsa('.nav-item').forEach(function(n) { n.classList.toggle('active', n.dataset.page === page); });
  qsa('.page').forEach(function(p) { p.classList.toggle('active', p.id === 'page-' + page); });
  $('pageTitle').textContent = page.charAt(0).toUpperCase() + page.slice(1);
  loadCurrentPage();
}

qsa('.nav-item').forEach(function(n) { n.onclick = function() { loadPage(n.dataset.page); if (window.innerWidth <= 768) $('sidebar').classList.remove('open'); }; });
$('menuToggle').onclick = function() { $('sidebar').classList.toggle('open'); };
$('refreshBtn').onclick = function() { loadCurrentPage(); toast('Refreshed', 'success'); };
$('logoutBtn').onclick = logout;

// ===== OVERVIEW =====
// Fix #1: stats always showed 0 because the code only checked one exact
// key name (e.g. stats.totalVisitors). Backends commonly use snake_case,
// nested under "data", or slightly different names — pick() tries all of
// the common variants, and also unwraps a {data: {...}} envelope.
async function loadOverview() {
  try {
    var raw = await getStats();
    var stats = raw && raw.data ? raw.data : raw;
    var grid = $('statsGrid');
    var items = [
      { label: 'Total Visitors', value: pick(stats, 'totalVisitors', 'total_visitors', 'visitors', 'visitorCount') || 0, icon: 'fa-eye' },
      { label: 'Total Comments', value: pick(stats, 'totalComments', 'total_comments', 'comments', 'commentCount') || 0, icon: 'fa-comments' },
      { label: 'Total Likes', value: pick(stats, 'totalLikes', 'total_likes', 'likes', 'likeCount') || 0, icon: 'fa-heart' },
      { label: 'Tool Usage', value: pick(stats, 'toolUsage', 'tool_usage', 'toolUsageCount', 'usage') || 0, icon: 'fa-toolbox' },
    ];
    grid.innerHTML = items.map(function(s) {
      return '<div class="stat-card"><span class="icon"><i class="fa-solid ' + s.icon + '"></i></span><div class="value">' + fmtNum(s.value) + '</div><div class="label">' + s.label + '</div></div>';
    }).join('');
  } catch (e) { toast('Failed to load stats: ' + e.message, 'error'); }

  renderDailyChart();
  renderToolsChart();
}

// Fix #5: charts overflowed their cards and needed scrolling. Every chart
// now renders into a fixed-height .chart-box with maintainAspectRatio:false
// so it always fills the card exactly, and is destroyed/recreated on each
// refresh instead of stacking duplicate canvases.
function renderDailyChart() {
  try {
    if (charts.daily) charts.daily.destroy();
    var ctx = document.getElementById('chartDaily').getContext('2d');
    charts.daily = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [
          { label: 'Visitors', data: [0,0,0,0,0,0,0], borderColor: '#7c6bff', tension: 0.3, fill: true, backgroundColor: 'rgba(124,107,255,0.1)' },
          { label: 'Comments', data: [0,0,0,0,0,0,0], borderColor: '#00d4b1', tension: 0.3, fill: true, backgroundColor: 'rgba(0,212,177,0.1)' },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#8a86ab' } } },
        scales: { y: { beginAtZero: true, ticks: { color: '#8a86ab' } }, x: { ticks: { color: '#8a86ab' } } }
      }
    });
  } catch (e) {}
}
function renderToolsChart() {
  try {
    if (charts.tools) charts.tools.destroy();
    var ctx = document.getElementById('chartTools').getContext('2d');
    charts.tools = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['PDF Tool', 'Image Tool', 'Video Tool', 'Other'], datasets: [{ data: [10,8,5,3], backgroundColor: ['#7c6bff','#00d4b1','#ff6bd6','#ffb545'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8a86ab' } } } }
    });
  } catch (e) {}
}

// ===== COMMENTS =====
// Fix #2/#3/#4: normalize whatever shape a comment object comes in as, so
// the table, edit modal, and update payload all agree on the same values
// (this is also why the edit modal's username field showed blank before —
// it was reading a key the API doesn't use).
function normalizeComment(c) {
  return {
    raw: c,
    id: pick(c, 'id', '_id', 'comment_id', 'commentId'),
    username: pick(c, 'username', 'name', 'author', 'user', 'user_name'),
    text: pick(c, 'text', 'comment', 'body', 'content', 'message') || '',
    article: pick(c, 'article', 'article_id', 'articleId', 'article_slug', 'slug', 'tool') || '-',
    status: (pick(c, 'status', 'state') || 'published').toString().toLowerCase(),
    dateRaw: pick(c, 'created_at', 'createdAt', 'date', 'timestamp', 'created'),
  };
}

var currentComments = [];

async function loadComments() {
  var list = $('commentsList');
  list.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text-dim);"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
  var status = $('statusFilter').value;
  var search = $('commentSearch').value.trim();
  try {
    var data = await getComments(commentsPage, status, search);
    var rawItems = data.comments || data.items || data.data || [];
    if (!Array.isArray(rawItems)) rawItems = [];
    var items = rawItems.map(normalizeComment);

    // Fix #10: client-side fallback filter, in case the backend doesn't
    // actually apply the search query param.
    if (search) {
      var needle = search.toLowerCase();
      items = items.filter(function(c) {
        return (c.username || '').toLowerCase().indexOf(needle) !== -1 ||
               (c.text || '').toLowerCase().indexOf(needle) !== -1 ||
               (c.article || '').toLowerCase().indexOf(needle) !== -1;
      });
    }

    currentComments = items;
    lastCommentsCount = rawItems.length;

    var total = data.total || data.totalCount;
    $('pageInfo').textContent = 'Page ' + commentsPage + (total ? ' of ' + Math.max(1, Math.ceil(total / PAGE_LIMIT)) : '');

    // Fix #11: guard pagination buttons at the edges instead of letting
    // the user click into empty pages forever.
    $('prevPage').disabled = commentsPage <= 1;
    $('nextPage').disabled = total ? (commentsPage * PAGE_LIMIT >= total) : (rawItems.length < PAGE_LIMIT);

    if (!items.length) {
      list.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text-dim);">No comments found</div>';
      return;
    }

    var html = '<div class="table-wrap"><table><thead><tr><th>User</th><th>Comment</th><th>Article</th><th>Status</th><th>Date &amp; time</th><th>Actions</th></tr></thead><tbody>';
    items.forEach(function(c) {
      var displayName = c.username || 'Anonymous';
      html += '<tr>' +
        '<td><strong>' + escapeHtml(displayName) + '</strong></td>' +
        '<td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + escapeHtml(c.text) + '">' + escapeHtml(c.text) + '</td>' +
        '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + escapeHtml(c.article) + '">' + escapeHtml(c.article) + '</td>' +
        '<td><span class="status-badge ' + escapeHtml(c.status) + '">' + escapeHtml(c.status) + '</span></td>' +
        '<td class="date-cell">' + formatExactDateTime(c.dateRaw) + '</td>' +
        '<td><div class="row-actions"><button data-id="' + escapeHtml(c.id) + '" class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button><button data-id="' + escapeHtml(c.id) + '" class="delete-btn danger" title="Delete"><i class="fa-solid fa-trash"></i></button></div></td>' +
      '</tr>';
    });
    html += '</tbody></table></div>';
    list.innerHTML = html;

    // Delete
    qsa('.delete-btn').forEach(function(btn) {
      btn.onclick = async function() {
        if (!confirm('Delete this comment?')) return;
        try {
          await deleteComment(btn.dataset.id);
          toast('Comment deleted', 'success');
          loadComments();
          loadOverview(); // Fix #1: keep stats in sync after a delete
        } catch (e) { toast('Delete failed: ' + e.message, 'error'); }
      };
    });

    // Edit
    qsa('.edit-btn').forEach(function(btn) {
      btn.onclick = function() {
        var c = currentComments.find(function(x) { return String(x.id) === String(btn.dataset.id); });
        if (!c) return;
        var statusOptions = ['published', 'pending', 'spam'];
        var optionsHtml = statusOptions.map(function(s) {
          return '<option value="' + s + '" ' + (c.status === s ? 'selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
        }).join('');
        showModal('Edit Comment',
          '<div class="field"><label>Username</label><input type="text" id="editUser" value="' + escapeHtml(c.username || '') + '"></div>' +
          '<div class="field"><label>Comment</label><textarea id="editText" rows="3" style="width:100%;padding:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;color:var(--text);resize:vertical;font-size:13px;">' + escapeHtml(c.text) + '</textarea></div>' +
          '<div class="field"><label>Status</label><select id="editStatus" style="width:100%;padding:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;">' + optionsHtml + '</select></div>',
          [
            { label: 'Cancel', onClick: closeModal },
            { label: 'Save', className: 'btn-primary', onClick: async function() {
              var newUsername = document.getElementById('editUser').value;
              var newText = document.getElementById('editText').value;
              var newStatus = document.getElementById('editStatus').value;
              try {
                // Fix #3: send common aliases for each field so this works
                // regardless of which exact key name the backend expects.
                await updateComment(c.id, {
                  username: newUsername, name: newUsername, author: newUsername,
                  text: newText, comment: newText, body: newText,
                  status: newStatus, state: newStatus,
                });
                toast('Comment updated', 'success');
                closeModal();
                loadComments();
              } catch (e) { toast('Update failed: ' + e.message, 'error'); }
            }}
          ]
        );
      };
    });
  } catch (e) {
    list.innerHTML = '<div style="padding:30px;text-align:center;color:var(--danger);">Failed to load comments: ' + escapeHtml(e.message) + '</div>';
  }
}

var commentSearchDebounce = null;
$('commentSearch').oninput = function() {
  clearTimeout(commentSearchDebounce);
  commentSearchDebounce = setTimeout(function() { commentsPage = 1; loadComments(); }, 300);
};
$('commentSearch').onkeydown = function(e) {
  if (e.key === 'Enter') { clearTimeout(commentSearchDebounce); commentsPage = 1; loadComments(); }
};
$('statusFilter').onchange = function() { commentsPage = 1; loadComments(); };
$('refreshComments').onclick = function() { loadComments(); toast('Comments refreshed', 'success'); };
$('prevPage').onclick = function() { if (commentsPage > 1) { commentsPage--; loadComments(); } };
$('nextPage').onclick = function() { commentsPage++; loadComments(); };

// ===== SETTINGS =====
$('changePassBtn').onclick = async function() {
  var cur = $('curPass').value;
  var newP = $('newPass').value;
  var confirmVal = $('confirmPass').value;
  if (!cur || !newP || !confirmVal) return toast('Fill all fields', 'error');
  if (newP !== confirmVal) return toast('Passwords do not match', 'error');
  if (newP.length < 6) return toast('New password should be at least 6 characters', 'error');
  try {
    // Fix #12: send common field-name aliases for compatibility.
    await changePasswordApi({
      currentPassword: cur, current_password: cur, oldPassword: cur, old_password: cur,
      newPassword: newP, new_password: newP,
    });
    toast('Password updated!', 'success');
    $('curPass').value = $('newPass').value = $('confirmPass').value = '';
  } catch (e) { toast('Failed to update password: ' + e.message, 'error'); }
};

$('clearAllBtn').onclick = function() {
  if (!confirm('Are you sure? This will delete ALL data!')) return;
  if (!confirm('This is permanent! Continue?')) return;
  clearAllApi()
    .then(function() { toast('All data cleared', 'success'); loadOverview(); })
    .catch(function(e) { toast('Clear failed: ' + e.message, 'error'); });
};

// ===== SEARCH ===== (Fix #14: global search now supports Enter and any length >= 1)
function runGlobalSearch() {
  var q = $('globalSearch').value.trim();
  if (!q) return;
  loadPage('comments');
  $('commentSearch').value = q;
  commentsPage = 1;
  loadComments();
}
$('globalSearch').oninput = function() {
  var q = this.value.trim();
  if (q.length >= 1) runGlobalSearch();
};
$('globalSearch').onkeydown = function(e) { if (e.key === 'Enter') runGlobalSearch(); };

// ===== THEME =====
// Fix #6: previously set a CSS variable nothing referenced. Now toggles a
// data-theme attribute on <html>, which every color in the stylesheet
// derives from, so the whole UI actually re-skins.
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  var icon = $('themeToggle').querySelector('i');
  icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  localStorage.setItem(THEME_KEY, theme);
}
$('themeToggle').onclick = function() {
  var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(cur);
};

// ===== RESPONSIVE ===== (Fix #15: close mobile sidebar on outside click)
document.addEventListener('click', function(e) {
  if (window.innerWidth > 768) return;
  var sidebar = $('sidebar');
  if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== $('menuToggle') && !$('menuToggle').contains(e.target)) {
    sidebar.classList.remove('open');
  }
});
window.addEventListener('resize', function() {
  if (charts.daily) charts.daily.resize();
  if (charts.tools) charts.tools.resize();
});

// ===== INIT =====
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
if (token) { showApp(); } else { $('appView').classList.add('hidden'); }

})();
</script>
</body>
</html>`;
