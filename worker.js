import APP_JS from "./app.js";
const BE="https://fastwebtools-admin.formyworkupwork.workers.dev";
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization"};
const SW="var C='fwt-v2511';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))));self.clients.claim();});self.addEventListener('fetch',e=>{});";

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
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0d0b1e;--bg2:linear-gradient(135deg,#0d0b1e 0%,#1a1535 50%,#0d1629 100%);--sf:rgba(255,255,255,.04);--sf2:rgba(255,255,255,.07);--bd:rgba(255,255,255,.09);--tx:#f0eeff;--dm:#8a86ab;--ac:#7c6bff;--ac2:#00d4b1;--dg:#ff6b6b;--wn:#ffb545;--mb:#13102b;color-scheme:dark}
html[data-theme=light]{--bg:#f0f0fa;--bg2:linear-gradient(135deg,#eef0fb,#e8eaf8);--sf:rgba(20,20,60,.04);--sf2:rgba(20,20,60,.07);--bd:rgba(20,20,60,.11);--tx:#1a1833;--dm:#5e5a78;--mb:#ffffff;color-scheme:light}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--tx);min-height:100vh;-webkit-font-smoothing:antialiased}
.hidden{display:none!important}
/* ---- LOGIN ---- */
.lv{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;background:var(--bg2)}
.lc{background:rgba(255,255,255,.05);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:40px 32px;width:100%;max-width:400px;box-shadow:0 24px 64px rgba(0,0,0,.55)}
.logo-wrap{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px}
.logo-icon{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#7c6bff,#00d4b1);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#0d0b1e;flex-shrink:0}
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
.btn:active:not(:disabled){transform:translateY(0)}
.btn:disabled{opacity:.55;cursor:wait}
.lfoot{text-align:center;font-size:11px;color:var(--dm);margin-top:18px;opacity:.7}
/* ---- APP SHELL ---- */
.app{display:flex;min-height:100vh}
.sb{width:228px;background:var(--sf);border-right:1px solid var(--bd);padding:18px 12px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0;z-index:40}
.sb-brand{display:flex;align-items:center;gap:10px;padding:4px 8px 16px;border-bottom:1px solid var(--bd);margin-bottom:12px}
.sb-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#7c6bff,#00d4b1);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#0d0b1e;flex-shrink:0}
.sb-name{font-size:15px;font-weight:700;letter-spacing:-.02em}
.ni{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:var(--dm);cursor:pointer;font-size:13.5px;font-weight:500;margin-bottom:2px;transition:all .15s;user-select:none}
.ni:hover{background:var(--sf2);color:var(--tx)}
.ni.active{background:rgba(124,107,255,.16);color:var(--ac)}
.ni i{width:16px;text-align:center;font-size:14px}
.sbot{margin-top:auto;padding-top:14px;border-top:1px solid var(--bd)}
.lpill{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dm);margin-bottom:10px;padding:0 4px}
.ldot{width:8px;height:8px;border-radius:50%;background:#00d4b1;box-shadow:0 0 0 0 rgba(0,212,177,.5);animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,212,177,.5)}70%{box-shadow:0 0 0 7px rgba(0,212,177,0)}100%{box-shadow:0 0 0 0 rgba(0,212,177,0)}}
.bg2{padding:8px 14px;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;color:var(--tx);cursor:pointer;font-size:13px;transition:all .15s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.bg2:hover{background:var(--sf);border-color:rgba(124,107,255,.4)}
.bg2:disabled{opacity:.4;cursor:not-allowed}
.bd2{padding:8px 16px;background:rgba(255,107,107,.10);border:1px solid rgba(255,107,107,.28);border-radius:10px;color:var(--dg);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;transition:all .15s}
.bd2:hover{background:rgba(255,107,107,.18)}
/* ---- MAIN AREA ---- */
.mw{flex:1;min-width:0;display:flex;flex-direction:column}
.tb{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--bd);background:rgba(255,255,255,.02);position:sticky;top:0;z-index:20;backdrop-filter:blur(12px)}
.tb .title{font-weight:600;font-size:16px;letter-spacing:-.01em}
.sw{display:flex;align-items:center;gap:8px;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:8px 14px;flex:1;max-width:320px}
.sw input{border:none;background:transparent;color:var(--tx);outline:none;flex:1;font-size:13px;min-width:0;width:100%;font-family:inherit}
.sw i{color:var(--dm);font-size:13px}
.tba{margin-left:auto;display:flex;gap:4px;align-items:center}
.ib{background:none;border:none;color:var(--dm);font-size:14px;cursor:pointer;padding:8px;border-radius:8px;transition:all .15s;width:34px;height:34px;display:flex;align-items:center;justify-content:center}
.ib:hover{background:var(--sf2);color:var(--tx)}
.cnt{padding:22px;max-width:1400px;width:100%;margin:0 auto}
/* ---- PAGES ---- */
.pg{display:none}
.pg.active{display:block;animation:fi .18s ease}
@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.ph{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:18px}
.ph h2{font-size:20px;font-weight:700;letter-spacing:-.02em}
.ph .subx{color:var(--dm);font-size:12px;margin-top:3px}
/* ---- STAT CARDS ---- */
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:14px;margin-bottom:18px}
.sc{background:var(--sf);border:1.5px solid var(--bd);border-radius:14px;padding:18px;transition:all .2s;position:relative;overflow:hidden}
.sc:hover{transform:translateY(-2px);border-color:rgba(124,107,255,.5);box-shadow:0 8px 24px rgba(0,0,0,.2)}
.sc::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,107,255,.06),transparent);pointer-events:none}
.sc .val{font-size:28px;font-weight:700;letter-spacing:-.02em;line-height:1}
.sc .lbl2{color:var(--dm);font-size:12px;margin-top:6px;font-weight:500}
.sc .ic{position:absolute;top:14px;right:14px;font-size:22px;opacity:.18}
/* ---- FILTER BAR ---- */
.fbr{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px;padding:12px 16px;background:var(--sf);border:1px solid var(--bd);border-radius:13px}
.fbs{display:flex;gap:6px;flex-wrap:wrap;flex:1}
.fb{padding:5px 13px;background:var(--sf2);border:1px solid var(--bd);border-radius:20px;color:var(--dm);cursor:pointer;font-size:12px;font-weight:500;font-family:inherit;transition:all .15s}
.fb:hover{color:var(--tx);border-color:rgba(124,107,255,.3)}
.fb.active{background:rgba(124,107,255,.16);border-color:var(--ac);color:var(--ac)}
.fc{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.fc input[type=date]{padding:5px 10px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-size:12px;outline:none;font-family:inherit;transition:border-color .15s}
.fc input[type=date]:focus{border-color:var(--ac)}
.fl{font-size:11px;color:var(--ac);font-weight:500;margin-left:4px}
/* ---- CARDS ---- */
.card{background:var(--sf);border:1.5px solid var(--bd);border-radius:14px;padding:20px;margin-bottom:16px}
.card h3{font-size:13.5px;font-weight:600;letter-spacing:-.01em}
.cb{position:relative;width:100%;height:240px}
.chr{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px}
/* ---- BARS ---- */
.bl{display:flex;flex-direction:column;gap:9px;max-height:540px;overflow-y:auto}
.br{display:flex;align-items:center;gap:10px;font-size:13px}
.rnk{width:22px;flex-shrink:0;text-align:center;font-size:11px;font-weight:700;color:var(--dm);background:var(--sf2);border-radius:6px;padding:2px 0}
.bn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx);text-decoration:none}
a.bn:hover{color:var(--ac);text-decoration:underline}
.bt{flex:1.5;height:18px;background:var(--sf2);border-radius:6px;overflow:hidden;min-width:60px}
.bf{display:block;height:100%;background:linear-gradient(90deg,#7c6bff,#00d4b1);border-radius:6px;transition:width .4s ease}
.bv{width:44px;flex-shrink:0;text-align:right;font-weight:700;font-size:12px}
/* ---- COMMENTS ---- */
.al{display:flex;flex-direction:column;gap:10px}
.ai{border:1.5px solid var(--bd);border-radius:13px;overflow:hidden;background:var(--sf)}
.ai.open{border-color:rgba(124,107,255,.3)}
.ah{display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer;user-select:none;transition:background .15s}
.ah:hover{background:var(--sf2)}
.achev{color:var(--dm);font-size:11px;transition:transform .2s;flex-shrink:0;width:14px;text-align:center}
.ai.open .achev{transform:rotate(90deg);color:var(--ac)}
.atw{flex:1;min-width:0}
.at{font-weight:600;color:var(--tx);font-size:13.5px;text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color .15s}
a.at:hover{color:var(--ac)}
.asub{font-size:11px;color:var(--dm);margin-top:3px}
.acnt{background:rgba(124,107,255,.14);color:var(--ac);font-weight:700;font-size:12px;padding:3px 11px;border-radius:20px;flex-shrink:0;min-width:28px;text-align:center}
.abdy{display:none;padding:0 14px 10px;border-top:1px solid var(--bd)}
.ai.open .abdy{display:block}
.cr{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--bd)}
.cr:last-child{border-bottom:none}
.cav{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c6bff,#00d4b1);color:#0d0b1e;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
.cm{flex:1;min-width:0}
.chr2{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.cu{font-size:13px;font-weight:600}
.cd{color:var(--dm);font-size:11px;margin-left:auto}
.ct{font-size:13px;line-height:1.6;margin-bottom:10px;word-wrap:break-word;white-space:pre-wrap;color:var(--tx)}
.ca{display:flex;gap:6px;flex-wrap:wrap}
.ca button{background:var(--sf2);border:1px solid var(--bd);color:var(--dm);cursor:pointer;padding:5px 10px;border-radius:7px;font-size:11px;font-family:inherit;display:inline-flex;align-items:center;gap:4px;transition:all .15s}
.ca button:hover{color:var(--tx);background:var(--sf)}
.ca button.danger:hover{color:var(--dg);border-color:rgba(255,107,107,.3)}
.sbd{display:inline-block;padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em}
.sbd.published{background:rgba(0,212,177,.14);color:#00d4b1}
.sbd.pending{background:rgba(255,181,69,.14);color:#ffb545}
.sbd.spam{background:rgba(255,107,107,.14);color:#ff6b6b}
.pag{display:flex;justify-content:space-between;align-items:center;margin-top:16px;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--dm)}
/* ---- MODAL ---- */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);z-index:100;display:none;align-items:center;justify-content:center;padding:20px}
.mo.show{display:flex}
.mbox{background:var(--mb);border:1px solid var(--bd);border-radius:18px;max-width:480px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,.6)}
.mh{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--bd)}
.mh h3{font-size:15px;font-weight:600}
.mbody{padding:20px}
.mf{display:flex;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid var(--bd)}
/* ---- TOAST ---- */
.ts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:200;max-width:340px}
.toast{padding:13px 16px;border-radius:12px;background:var(--mb);border:1px solid var(--bd);font-size:13px;color:var(--tx);display:flex;align-items:flex-start;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.35);animation:su .25s ease;transition:opacity .3s}
.toast.success{border-color:rgba(0,212,177,.4)}
.toast.success i{color:#00d4b1}
.toast.error{border-color:rgba(255,107,107,.4)}
.toast.error i{color:#ff6b6b}
.toast.info i{color:var(--ac)}
@keyframes su{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
/* ---- SETTINGS ---- */
.sfield{margin-bottom:16px}
.sfield label{display:block;font-size:11px;font-weight:600;color:var(--dm);margin-bottom:7px;text-transform:uppercase;letter-spacing:.07em}
/* ---- RESPONSIVE ---- */
@media(max-width:768px){
.sb{position:fixed;left:-240px;top:0;height:100vh;transition:left .22s cubic-bezier(.4,0,.2,1);z-index:100;box-shadow:4px 0 32px rgba(0,0,0,.6)}
.sb.open{left:0}
.sg{grid-template-columns:1fr 1fr}
.cnt{padding:14px}
.rnk{display:none}
.fb{padding:4px 10px;font-size:11px}
}
@media(max-width:480px){
.sg{grid-template-columns:1fr}
.tba .sw{display:none}
}
</style>
</head>
<body>
<div id="LV" class="lv">
  <div class="lc">
    <div class="logo-wrap"><div class="logo-icon">F</div><div class="logo-text">FastWebTools</div></div>
    <p class="sub">Admin Panel v2.5.11</p>
    <div id="LE" class="lerr"><i class="fa-solid fa-triangle-exclamation"></i><span id="LES">Invalid credentials</span></div>
    <div class="field"><label>Username</label><div class="iw"><input type="text" id="UN" placeholder="Enter username" autocomplete="username" autocapitalize="none" spellcheck="false"></div></div>
    <div class="field"><label>Password</label><div class="iw"><input type="password" id="PW" placeholder="Enter password" autocomplete="current-password"><button type="button" id="TP" title="Show/hide password"><i class="fa-regular fa-eye" id="EI"></i></button></div></div>
    <div class="lr"><label><input type="checkbox" id="REM"> Remember me</label></div>
    <button class="btn" id="LB" type="button"><i class="fa-solid fa-right-to-bracket"></i>&nbsp; Sign in</button>
    <div class="lfoot">&copy; 2026 FastWebTools &mdash; Secure Admin</div>
  </div>
</div>
<div id="AV" class="app hidden">
  <aside class="sb" id="SB">
    <div class="sb-brand"><div class="sb-icon">F</div><div class="sb-name">FastWebTools</div></div>
    <nav>
      <div class="ni active" data-page="overview"><i class="fa-solid fa-gauge-high"></i> Overview</div>
      <div class="ni" data-page="comments"><i class="fa-solid fa-comments"></i> Comments</div>
      <div class="ni" data-page="tool-likes"><i class="fa-solid fa-thumbs-up"></i> Tool Likes</div>
      <div class="ni" data-page="article-likes"><i class="fa-solid fa-heart"></i> Article Likes</div>
      <div class="ni" data-page="settings"><i class="fa-solid fa-gear"></i> Settings</div>
    </nav>
    <div class="sbot">
      <div class="lpill"><span class="ldot"></span><span id="LC">0</span>&nbsp;live now</div>
      <button class="bg2" style="width:100%;justify-content:center" id="LGOUT"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
    </div>
  </aside>
  <div class="mw">
    <header class="tb">
      <button class="ib" id="MT" title="Menu"><i class="fa-solid fa-bars"></i></button>
      <span class="title" id="PT">Overview</span>
      <div class="sw"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search workspace..."></div>
      <div class="tba">
        <button class="ib" id="RB" title="Refresh"><i class="fa-solid fa-rotate"></i></button>
        <button class="ib" id="TG" title="Toggle theme"><i class="fa-solid fa-moon"></i></button>
      </div>
    </header>
    <div class="cnt">
      <!-- OVERVIEW -->
      <div class="pg active" id="pg-overview">
        <div class="ph"><div><h2>Overview</h2><div class="subx">Analytics &amp; performance snapshot</div></div><label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dm)"><input type="checkbox" id="AR" checked> Auto-refresh</label></div>
        <div class="fbr">
          <div class="fbs" id="FBS">
            <button class="fb active" data-p="all">All time</button>
            <button class="fb" data-p="today">Today</button>
            <button class="fb" data-p="yesterday">Yesterday</button>
            <button class="fb" data-p="7d">Last 7 days</button>
            <button class="fb" data-p="30d">Last 30 days</button>
            <button class="fb" data-p="month">This month</button>
          </div>
          <div class="fc">
            <input type="date" id="FF" title="From date">
            <span style="color:var(--dm);font-size:12px">to</span>
            <input type="date" id="FT" title="To date">
            <button class="fb" id="AFC"><i class="fa-solid fa-filter"></i> Apply</button>
          </div>
          <span class="fl" id="FL"></span>
        </div>
        <div class="sg" id="STG"></div>
        <div class="card">
          <h3 style="margin-bottom:14px"><i class="fa-solid fa-chart-line" style="color:var(--ac);margin-right:6px"></i>Daily Activity</h3>
          <div class="cb" id="CHTW"><canvas id="CHT"></canvas></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="card">
            <div class="chr"><h3><i class="fa-solid fa-wrench" style="color:var(--ac);margin-right:6px"></i>Top Tools</h3><button class="bg2" data-nav="tool-likes" style="font-size:12px">View all <i class="fa-solid fa-arrow-right"></i></button></div>
            <div id="TUL" class="bl"></div>
          </div>
          <div class="card">
            <div class="chr"><h3><i class="fa-solid fa-newspaper" style="color:var(--ac);margin-right:6px"></i>Top Articles</h3><button class="bg2" data-nav="article-likes" style="font-size:12px">View all <i class="fa-solid fa-arrow-right"></i></button></div>
            <div id="AVL" class="bl"></div>
          </div>
        </div>
      </div>
      <!-- COMMENTS -->
      <div class="pg" id="pg-comments">
        <div class="ph"><div><h2>Comments</h2><div class="subx">Moderate user comments</div></div></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
          <div class="sw" style="max-width:280px"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="CS" placeholder="Search by name, content..."></div>
          <select id="SF" class="bg2" style="padding:8px 14px"><option value="all">All statuses</option><option value="published">Published</option><option value="pending">Pending</option><option value="spam">Spam</option></select>
          <button class="bg2" id="RC"><i class="fa-solid fa-rotate"></i> Refresh</button>
        </div>
        <div class="card" style="padding:14px" id="CL">Loading...</div>
        <div class="pag"><span id="PI">Page 1</span><div style="display:flex;gap:6px"><button class="bg2" id="PP"><i class="fa-solid fa-chevron-left"></i> Prev</button><button class="bg2" id="NPB">Next <i class="fa-solid fa-chevron-right"></i></button></div></div>
      </div>
      <!-- TOOL LIKES -->
      <div class="pg" id="pg-tool-likes">
        <div class="ph"><div><h2>Tool Likes</h2><div class="subx">Most liked tools by users</div></div><button class="bg2" id="RTL"><i class="fa-solid fa-rotate"></i> Refresh</button></div>
        <div class="card"><div id="TLL" class="bl">Loading...</div></div>
      </div>
      <!-- ARTICLE LIKES -->
      <div class="pg" id="pg-article-likes">
        <div class="ph"><div><h2>Article Likes</h2><div class="subx">Most liked blog articles</div></div><button class="bg2" id="RAL"><i class="fa-solid fa-rotate"></i> Refresh</button></div>
        <div class="card"><div id="ALL2" class="bl">Loading...</div></div>
      </div>
      <!-- SETTINGS -->
      <div class="pg" id="pg-settings">
        <div class="ph"><div><h2>Settings</h2><div class="subx">Account &amp; data management</div></div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,500px));gap:16px">
          <div class="card">
            <h3 style="margin-bottom:16px"><i class="fa-solid fa-lock" style="color:var(--ac);margin-right:6px"></i>Change Password</h3>
            <div class="sfield"><label>Current Password</label><div class="iw"><input type="password" id="CP" placeholder="Current password"></div></div>
            <div class="sfield"><label>New Password</label><div class="iw"><input type="password" id="NP2" placeholder="New password (min 6 chars)"></div></div>
            <div class="sfield"><label>Confirm New Password</label><div class="iw"><input type="password" id="CPX" placeholder="Confirm new password"></div></div>
            <button class="btn" style="width:auto;padding:11px 28px" id="CPB">Update Password</button>
          </div>
          <div class="card" style="border-color:rgba(255,107,107,.28)">
            <h3 style="color:var(--dg);margin-bottom:8px"><i class="fa-solid fa-triangle-exclamation"></i>&nbsp;Danger Zone</h3>
            <p style="color:var(--dm);font-size:13px;margin-bottom:16px;line-height:1.6">Permanently delete all analytics data including visits, article views, tool usage, comments, and likes. This action cannot be undone.</p>
            <button class="bd2" id="CAB"><i class="fa-solid fa-trash"></i>&nbsp; Clear All Data</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="mo" id="MO"><div class="mbox"><div class="mh"><h3 id="MTT">Confirm</h3><button class="ib" id="MC"><i class="fa-solid fa-xmark"></i></button></div><div class="mbody" id="MB"></div><div class="mf" id="MF"></div></div></div>
<div class="ts" id="TS"></div>
<script src="/app.js" defer></script>
</body></html>`;

function jR(o,s){return new Response(JSON.stringify(o),{status:s||200,headers:Object.assign({'Content-Type':'application/json;charset=UTF-8'},CORS)});}

async function proxy(req,path,env){
  const h={};
  const a=req.headers.get('Authorization');if(a)h['Authorization']=a;
  const ct=req.headers.get('Content-Type');if(ct)h['Content-Type']=ct;
  let body;
  if(!['GET','HEAD'].includes(req.method)){try{body=await req.arrayBuffer();}catch(e){return jR({success:false,message:'Bad request body'},400);}}
  try{
    let r;
    if(env&&env.BACKEND&&typeof env.BACKEND.fetch==='function'){r=await env.BACKEND.fetch('https://internal'+path,{method:req.method,headers:h,body});}
    else{r=await fetch(BE+path,{method:req.method,headers:h,body});}
    const raw=await r.text();
    let p=null;try{p=raw?JSON.parse(raw):null;}catch(e){}
    if(p!==null)return jR(p,r.status);
    return new Response(raw,{status:r.status,headers:Object.assign({'Content-Type':r.headers.get('Content-Type')||'text/plain'},CORS)});
  }catch(e){return jR({success:false,message:'Backend error: '+(e&&e.message||String(e))},502);}
}

export default {
  async fetch(req,env,ctx){
    try{
      const url=new URL(req.url);
      if(req.method==='OPTIONS')return new Response(null,{headers:CORS});
      if(url.pathname==='/sw.js')return new Response(SW,{headers:{'content-type':'text/javascript','cache-control':'no-store'}});
      if(url.pathname==='/app.js')return new Response(APP_JS,{headers:{'content-type':'text/javascript;charset=UTF-8','cache-control':'no-store,no-cache,must-revalidate','x-content-type-options':'nosniff'}});
      if(url.pathname==='/api/login')return proxy(req,'/admin/login'+url.search,env);
      if(url.pathname.startsWith('/api/'))return proxy(req,url.pathname.replace(/^\/api/,'/admin')+url.search,env);
      return new Response(HTML,{headers:{'Content-Type':'text/html;charset=UTF-8','Cache-Control':'no-store,no-cache,must-revalidate'}});
    }catch(err){
      return new Response('Server error: '+(err&&err.message||String(err)),{status:500});
    }
  }
};
