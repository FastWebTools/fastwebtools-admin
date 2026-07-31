import APP_JS from "./app.js";
const BE="https://fastwebtools-admin.formyworkupwork.workers.dev";
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization"};
const SW="var C='fwt-v2514';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))));self.clients.claim();});self.addEventListener('fetch',e=>{});";

const FAVICON=`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%237c6bff'/><text x='16' y='22' text-anchor='middle' font-family='Inter,sans-serif' font-size='18' font-weight='700' fill='white'>F</text></svg>`;

const HTML=`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>FastWebTools Admin</title>
<link rel="icon" href="data:image/svg+xml,${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0d0b1e;--bg2:linear-gradient(135deg,#0d0b1e 0%,#1a1535 50%,#0d1629 100%);--sf:rgba(255,255,255,.04);--sf2:rgba(255,255,255,.07);--bd:rgba(255,255,255,.09);--tx:#f0eeff;--dm:#a5a1c7;--ac:#7c6bff;--ac2:#00d4b1;--dg:#ff6b6b;--wn:#ffb545;--mb:#13102b;--sbbg:#12102a;color-scheme:dark}
html[data-theme=light]{--bg:#f0f0fa;--bg2:linear-gradient(135deg,#eef0fb,#e8eaf8);--sf:rgba(20,20,60,.04);--sf2:rgba(20,20,60,.07);--bd:rgba(20,20,60,.11);--tx:#1a1833;--dm:#5e5a78;--mb:#ffffff;--sbbg:#ffffff;color-scheme:light}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--tx);min-height:100vh;-webkit-font-smoothing:antialiased}
.hidden{display:none!important}
.lv{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;background:var(--bg2)}
.lc{background:rgba(255,255,255,.05);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:40px 32px;width:100%;max-width:400px;box-shadow:0 24px 64px rgba(0,0,0,.55)}
.logo-wrap{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:6px}
.logo-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#7c6bff,#00d4b1);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#0d0b1e;flex-shrink:0}
.logo-text{font-size:22px;font-weight:700;letter-spacing:-.03em}
.lc .sub{text-align:center;color:var(--dm);font-size:13px;margin-bottom:28px}
.field{margin-bottom:15px}
.field label{display:block;font-size:11px;font-weight:600;color:var(--dm);margin-bottom:6px;text-transform:uppercase;letter-spacing:.07em}
.iw{display:flex;align-items:center;background:var(--sf2);border:1.5px solid var(--bd);border-radius:11px;padding:0 14px;transition:border-color .15s}
.iw:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px rgba(124,107,255,.15)}
.iw input{border:none;padding:13px 4px;flex:1;background:transparent;color:var(--tx);font-size:14px;outline:none;min-width:0;width:100%;font-family:inherit}
.iw button{background:none;border:none;color:var(--dm);cursor:pointer;padding:8px 4px;font-size:15px;transition:color .15s}
.iw button:hover{color:var(--tx)}
.lerr{background:rgba(255,107,107,.10);border:1px solid rgba(255,107,107,.28);color:var(--dg);padding:11px 14px;border-radius:11px;font-size:13px;margin-bottom:14px;display:none;gap:10px;align-items:flex-start}
.lerr.show{display:flex}
.lr{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:20px;color:var(--dm)}
.lr label{display:flex;align-items:center;gap:6px;cursor:pointer}
.btn{width:100%;padding:14px;border:none;border-radius:11px;font-size:14px;font-weight:600;background:linear-gradient(135deg,#7c6bff,#5b4be0);color:#fff;cursor:pointer;transition:all .2s;letter-spacing:.01em}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 28px rgba(124,107,255,.4)}
.btn:disabled{opacity:.55;cursor:wait}
.lfoot{text-align:center;font-size:11px;color:var(--dm);margin-top:18px;opacity:.7}
.app{display:flex;min-height:100vh}
.sb{width:236px;background:var(--sbbg);border-right:1px solid var(--bd);padding:16px 10px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0;z-index:40}
.sb-bd{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:99}
.sb-bd.show{display:block}
.sb-brand{display:flex;align-items:center;gap:10px;padding:6px 10px 14px;border-bottom:1px solid var(--bd);margin-bottom:12px}
.sb-icon{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#7c6bff,#00d4b1);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#0d0b1e;flex-shrink:0}
.sb-name{font-size:15px;font-weight:700;letter-spacing:-.02em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ni{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:10px;color:var(--dm);cursor:pointer;font-size:13.5px;font-weight:500;margin-bottom:3px;transition:background .15s,color .15s;user-select:none;line-height:1.2;white-space:nowrap;overflow:hidden}
.ni:hover{background:var(--sf2);color:var(--tx)}
.ni.active{background:rgba(124,107,255,.16);color:var(--ac)}
.ni .ni-ic{width:20px;text-align:center;font-size:14px;flex-shrink:0;display:inline-flex;justify-content:center}
.ni .ni-tx{flex:1;overflow:hidden;text-overflow:ellipsis}
.sbot{margin-top:auto;padding-top:14px;border-top:1px solid var(--bd)}
.lpill{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dm);margin-bottom:10px;padding:0 4px}
.ldot{width:8px;height:8px;border-radius:50%;background:#00d4b1;box-shadow:0 0 0 0 rgba(0,212,177,.5);animation:pulse 2s infinite;flex-shrink:0}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,212,177,.5)}70%{box-shadow:0 0 0 7px rgba(0,212,177,0)}100%{box-shadow:0 0 0 0 rgba(0,212,177,0)}}
.bg2{padding:8px 14px;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;color:var(--tx);cursor:pointer;font-size:13px;transition:all .15s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.bg2:hover{background:var(--sf);border-color:rgba(124,107,255,.4)}
.bg2:disabled{opacity:.4;cursor:not-allowed}
.bd2{padding:8px 16px;background:rgba(255,107,107,.10);border:1px solid rgba(255,107,107,