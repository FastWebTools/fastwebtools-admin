/** * FastWebTools Admin Dashboard - Cloudflare Worker
 *
 * v2.5.6: Comments tab redesigned as grouped accordion
 *  - Each blog article gets its own collapsible drop-down instead of one
 *    big mixed table. Header shows article title (clickable link), latest
 *    activity time, and comment count badge.
 *  - Comment cards now use avatar + user + status badge + timestamp
 *    + inline edit/delete buttons for a cleaner, more professional look.
 *  - Groups are sorted by newest activity; the top group opens by default.
 *  - Fetches up to 500 comments in one shot so all groups render together;
 *    pagination controls are hidden in grouped view.
 *
 * v2.5.5: Restored Fast Web Tools logo on login card, sidebar brand, and
 *          top-bar avatar (embedded as base64 in DASHBOARD_HTML).
 *
 * v2.5.4: 4 dashboard bug fixes (comment article links, article likes
 *          links, daily-activity chart, mobile sidebar bg).
 */

import DASHBOARD_A from "./da.js";
import DASHBOARD_B from "./db.js";
const BACKEND_BASE = "https://fastwebtools-admin.formyworkupwork.workers.dev";
const PWA_MANIFEST_JSON = "{\"name\":\"FastWebTools Admin\",\"short_name\":\"FWT Admin\",\"start_url\":\"/\",\"scope\":\"/\",\"display\":\"standalone\",\"background_color\":\"#0f0c29\",\"theme_color\":\"#7c6bff\",\"icons\":[{\"src\":\"/icon-192.png\",\"sizes\":\"192x192\",\"type\":\"image/png\"},{\"src\":\"/icon-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\"}]}";
const PWA_ICON_192_B64 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAAB6ElEQVR4nO3SQQkAIADAQPtawe7awT1EOLgAe2ysueHaeF7A1wxEYiASA5EYiMRAJAYiMRCJgUgMRGIgEgORGIjEQCQGIjEQiYFIDERiIBIDkRiIxEAkBiIxEImBSAxEYiASA5EYiMRAJAYiMRCJgUgMRGIgEgORGIjEQCQGIjEQiYFIDERiIBIDkRiIxEAkBiIxEImBSAxEYiASA5EYiMRAJAYiMRCJgUgMRGIgEgORGIjEQCQGIjEQiYFIDERiIBIDkRiIxEAkBiIxEImBSAxEYiASA5EYiMRAJAYiMRCJgUgMRGIgEgORGIjEQCQGIjEQiYFIDERiIBIDkRiIxEAkBiIxEImBSAxEYiASA5EYiMRAJAYiMRCJgUgMRGIgEgORGIjEQCQGIjEQiYFIDERiIBIDkRiIxEAkBiI5sFpwAEh1SW4AAAAASUVORK5CYII=";
const PWA_ICON_512_B64 = "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAHHklEQVR4nO3VMQ0AMAzAsPIdhXHfYPSIJQPIl7nnARA06wUArDAAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiDIAgCgDAIgyAIAoAwCIMgCAKAMAiPrgh3HpqSXD1wAAAABJRU5ErkJggg==";
const SW_JS_CODE = "var C='fwt-v259';self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(['/']);}));self.skipWaiting();});self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==C)return caches.delete(k);}));}));self.clients.claim();});self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request).then(function(r){return r||caches.match('/');});}));});";
const REQUEST_TIMEOUT_MS = 10000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign(
      { "Content-Type": "application/json;charset=UTF-8" },
      CORS_HEADERS
    ),
  });
}

async function fetchWithTimeout(env, path, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs || REQUEST_TIMEOUT_MS
  );
  const finalOptions = Object.assign({}, options, {
    signal: controller.signal,
  });
  try {
    if (env && env.BACKEND && typeof env.BACKEND.fetch === "function") {
      return await env.BACKEND.fetch("https://internal" + path, finalOptions);
    }
    return await fetch(BACKEND_BASE + path, finalOptions);
  } finally {
    clearTimeout(timer);
  }
}

async function safeFetchJson(env, path, options, { retries = 1, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetchWithTimeout(env, path, options, timeoutMs);
      const raw = await resp.text();
      let parsed = null;
      let parseOk = false;
      try { parsed = raw ? JSON.parse(raw) : null; parseOk = true; }
      catch (parseErr) { parseOk = false; }
      if (!resp.ok && resp.status >= 500 && attempt < retries) {
        lastError = new Error("Backend returned " + resp.status);
        continue;
      }
      return {
        networkOk: true, status: resp.status, ok: resp.ok, parseOk,
        data: parsed, raw, contentType: resp.headers.get("Content-Type") || "",
      };
    } catch (err) {
      lastError = err;
      if (attempt < retries) continue;
    }
  }
  return { networkOk: false, error: lastError };
}

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
  const result = await safeFetchJson(env, "/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }, { retries: 1 });
  if (!result.networkOk) {
    return jsonResponse({ success: false, message: "Could not reach the authentication backend. Please try again shortly." }, 502);
  }
  if (!result.parseOk) {
    return jsonResponse({ success: false, message: "Authentication backend returned an unexpected response (not JSON). This usually means the backend is unreachable or is returning an edge error page." }, 502);
  }
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
    try { body = await request.arrayBuffer(); }
    catch (err) { return jsonResponse({ success: false, message: "Failed to read request body." }, 400); }
  }
  const result = await safeFetchJson(env, targetPathWithQuery, { method: request.method, headers, body }, { retries: 1 });
  if (!result.networkOk) {
    return jsonResponse({ success: false, message: "Could not reach the backend service. Please try again shortly." }, 502);
  }
  if (result.parseOk) return jsonResponse(result.data, result.status);
  if (result.ok) {
    return new Response(result.raw, {
      status: result.status,
      headers: Object.assign({ "Content-Type": result.contentType || "text/plain;charset=UTF-8" }, CORS_HEADERS),
    });
  }
  return jsonResponse({
    success: false,
    message: "Backend error (status " + result.status + "). The backend did not return a valid JSON response.",
    status: result.status,
  }, result.status >= 400 ? result.status : 502);
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (url.pathname === "/manifest.webmanifest") return new Response(PWA_MANIFEST_JSON, { headers: { "content-type": "application/manifest+json", "cache-control": "public, max-age=3600" } });
  if (url.pathname === "/sw.js") return new Response(SW_JS_CODE, { headers: { "content-type": "text/javascript", "cache-control": "public, max-age=3600" } });
  if (url.pathname === "/icon-192.png") { var _b1=Uint8Array.from(atob(PWA_ICON_192_B64),function(c){return c.charCodeAt(0);}); return new Response(_b1, { headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" } }); }
  if (url.pathname === "/icon-512.png") { var _b2=Uint8Array.from(atob(PWA_ICON_512_B64),function(c){return c.charCodeAt(0);}); return new Response(_b2, { headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" } }); }
  if (url.pathname === "/api/login") return handleLogin(request, env);
  if (url.pathname.startsWith("/api/")) return handleProxy(request, url, env);
  return new Response(DASHBOARD_HTML, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    try { return await handleRequest(request, env); }
    catch (err) {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        return jsonResponse({
          success: false,
          message: "Internal server error: " + (err && err.message ? err.message : String(err)),
        }, 500);
      }
      return new Response("Internal Server Error", { status: 500, headers: { "Content-Type": "text/plain" } });
    }
  },
};

const DASHBOARD_HTML = DASHBOARD_A + DASHBOARD_B;

