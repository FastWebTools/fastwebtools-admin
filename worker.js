/** * FastWebTools Admin Dashboard - Cloudflare Worker
 *
 * v2.5.8: Interactive overview cards + improved global search.
 *          - Stat cards on Overview are clickable and open the
 *            matching tab (Comments/Tool Likes/Article Likes) or
 *            scroll to the matching Overview section.
 *          - Global search bar is debounced and clearly targets
 *            the Comments tab with a cleaner placeholder.
 *
 * v2.5.7: PWA (Progressive Web App) support - installable as FWT Admin app
 *          with home screen icon, standalone display (no URL bar), offline
 *          fallback, and service worker. Icons from website logo.
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

const BACKEND_BASE = "https://fastwebtools-admin.formyworkupwork.workers.dev";
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

// --- PWA (Progressive Web App) support -----------------------------------
const MANIFEST_JSON = "{\"name\": \"FWT Admin\", \"short_name\": \"FWT\", \"description\": \"FastWebTools Admin Dashboard\", \"start_url\": \"/\", \"scope\": \"/\", \"id\": \"/\", \"display\": \"standalone\", \"display_override\": [\"standalone\", \"fullscreen\", \"minimal-ui\"], \"orientation\": \"any\", \"theme_color\": \"#0f0c29\", \"background_color\": \"#0f0c29\", \"icons\": [{\"src\": \"/icon-192.png\", \"sizes\": \"192x192\", \"type\": \"image/png\", \"purpose\": \"any\"}, {\"src\": \"/icon-192.png\", \"sizes\": \"192x192\", \"type\": \"image/png\", \"purpose\": \"maskable\"}, {\"src\": \"/icon-512.png\", \"sizes\": \"512x512\", \"type\": \"image/png\", \"purpose\": \"any\"}, {\"src\": \"/icon-512.png\", \"sizes\": \"512x512\", \"type\": \"image/png\", \"purpose\": \"maskable\"}], \"categories\": [\"productivity\", \"business\"], \"lang\": \"en\", \"dir\": \"ltr\"}";
const SW_JS = "var C='fwt-v258';self.addEventListener('install',function(e){self.skipWaiting();});self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});self.addEventListener('fetch',function(e){var u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;if(u.pathname.indexOf('/api/')===0)return;if(/\\/(icon-\\d+\\.png|manifest\\.json|favicon\\.ico)$/.test(u.pathname)){e.respondWith(caches.open(C).then(function(c){return c.match(e.request).then(function(r){return r||fetch(e.request).then(function(resp){if(resp&&resp.status===200)c.put(e.request,resp.clone());return resp;});});}));return;}if(u.pathname==='/'||e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(function(resp){if(resp&&resp.status===200){var cl=resp.clone();caches.open(C).then(function(c){c.put(e.request,cl);});}return resp;}).catch(function(){return caches.match(e.request);}));}});";
const ICON_192_B64 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAAwFBMVEUUX+6MrPBCfvJgju6h5//Bz/Rewf8AWPb9/f4CVe0ASupoxP4VaPMrhfcATfEmaOomefU1ivbH1/hkuvy2y/dbtvxJpPoLYvRWiOx2yf0bdPaU2v1VqvqI1f07lvnl6/pDmvg4dey80fna4/mYtvSHqvMVW+hEe+urw/akvPTR3fg1d/EaY+xJhvJmlfJ7ovJzmuyb4f1Xi/Ija/F60f7t8ftok+15oO4APuVLgu1Wl/V0nPF1u/mEzPsxbOdlrPg/Rs9oAAAM7ElEQVR42u2cCXebuhKAk7b3gYQsNmMgxTa2Ae9L7CTNnv//r94IEKvz0jSQuPdJ5zQGgfF8mtFoRhI9k/7yciYABIAAEAACQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAECfghAAAgAASAABIAAEAACQAAIEAECQAAIAAEA//8UN7uITSDVFwAAAABJRU5ErkJggg==";
const ICON_512_B64 = "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAAAAAAA";
function b64ToBytes(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
