import APP_JS from "./app.js";
const BE="https://fastwebtools-admin.formyworkupwork.workers.dev";
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization"};
const SW="var C='fwt-v2510';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))));self.clients.claim();});self.addEventListener('fetch',e=>{});";

const HTML=`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>FastWebTools Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0f0c29;--bg2:linear-gradient(135deg,#0f0c29,#302b63,#24243e);--sf:rgba(255,255,255,.04);--sf2:rgba(255,255,255,.06);--bd:rgba(255,255,255,.08);--tx:#f2f1fb;--dm:#8a86ab;--ac:#7c6bff;--ac2:#00d4b1;--dg:#ff6b6b;--wn:#ffb545;--mb:#191634;color-scheme:dark}
html[data-theme=light]{--bg:#eef0fb;--bg2:linear-gradient(135deg,#eef0fb,#e3e6f8);--sf:rgba(20,20,60,.035);--sf2:rgba(20,20,60,.055);--bd:rgba(20,20,60,.10);--tx:#1b1a2b;--dm:#63607d;--mb:#fff;color-scheme:light}
body{font-family:Inter,-apple-system,sans-serif;background:var(--bg);color:var(--tx);min-height:100vh}
.hidden{display:none!important}
.lv{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;background:var(--bg2)}
.lc{background:var(--sf2);backdrop-filter:blur(20px);border:1px solid var(--bd);border-radius:18px;padding:36px 30px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.lc h1{font-size:24px;font-weight:700;text-align:center;margin-bottom:6px;letter-spacing:-.02em}
.sub{text-align:center;color:var(--dm);font-size:13px;margin-bottom:26px}
.field{margin-bottom:14px}
.field label{display:block;font-size:11px;font-weight:600;color:var(--dm);margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em}
.iw{display:flex;align-items:center;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:0 14px}
.iw:focus-within{border-color:var(--ac)}
.iw input{border:none;padding:12px 4px;flex:1;background:transparent;color:var(--tx);font-size:14px;outline:none;min-width:0;width:100%}
.iw button{background:none;border:none;color:var(--dm);cursor:pointer;padding:8px;font-size:15px}
.iw button:hover{color:var(--tx)}
.lerr{background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3);color:var(--dg);padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:14px;display:none;gap:10px;align-items:center}
.lerr.show{display:flex}
.lr{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:18px;color:var(--dm)}
.lr label{display:flex;align-items:center;gap:6px;cursor:pointer}
.btn{width:100%;padding:13px;border:none;border-radius:10px;font-size:14px;font-weight:600;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#0f0c29;cursor:pointer;transition:all .15s}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(124,107,255,.35)}
.btn:disabled{opacity:.6;cursor:wait}
.lfoot{text-align:center;font-size:11px;color:var(--dm);margin-top:16px}
.app{display:flex;min-height:100vh}
.sb{width:220px;background:var(--sf);border-right:1px solid var(--bd);padding:20px 14px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0;z-index:40}
.brand{font-size:16px;font-weight:700;padding-bottom:16px;border-bottom:1px solid var(--bd);margin-bottom:14px;letter-spacing:-.01em}
.ni{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;color:var(--dm);cursor:pointer;font-size:14px;font-weight:500;margin-bottom:2px;transition:all .15s}
.ni:hover{background:var(--sf2);color:var(--tx)}
.ni.active{background:rgba(124,107,255,.15);color:var(--ac)}
.ni i{width:18px}
.sbot{margin-top:auto;padding-top:14px;border-top:1px solid var(--bd)}
.lpill{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dm);margin-bottom:10px}
.ldot{width:8px;height:8px;border-radius:50%;background:var(--ac2);animation:pulse 1.8s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,212,177,.6)}70%{box-shadow:0 0 0 8px rgba(0,212,177,0)}}
.bg2{padding:8px 16px;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;color:var(--tx);cursor:pointer;font-size:13px;transition:all .15s;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
.bg2:hover{background:var(--sf)}
.bg2:disabled{opacity:.4;cursor:not-allowed}
.bd2{padding:8px 16px;background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3);border-radius:10px;color:var(--dg);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit}
.bd2:hover{background:rgba(255,107,107,.2)}
.mw{flex:1;min-width:0}
.tb{display:flex;align-items:center;gap:14px;padding:14px 22px;border-bottom:1px solid var(--bd);background:var(--sf);position:sticky;top:0;z-index:10}
.tb .title{font-weight:600;font-size:17px}
.sw{display:flex;align-items:center;gap:10px;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:8px 14px;flex:1;max-width:340px}
.sw input{border:none;background:transparent;color:var(--tx);outline:none;flex:1;font-size:13px;min-width:0;width:100%}
.sw i{color:var(--dm)}
.tba{margin-left:auto;display:flex;gap:6px;align-items:center}
.ib{background:none;border:none;color:var(--dm);font-size:15px;cursor:pointer;padding:8px;border-radius:8px;transition:all .15s}
.ib:hover{background:var(--sf2);color:var(--tx)}
.cnt{padding:22px;max-width:1400px;margin:0 auto}
.pg{display:none}
.pg.active{display:block;animation:fi .2s ease}
@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.ph{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px}
.ph h2{font-size:20px;font-weight:700;letter-spacing:-.01em}
.ph .subx{color:var(--dm);font-size:12px;margin-top:2px}
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:18px}
.sc{background:var(--sf);border:1px solid var(--bd);border-radius:14px;padding:16px;cursor:pointer;transition:all .15s;position:relative}
.sc:hover{transform:translateY(-2px);border-color:var(--ac)}
.sc .val{font-size:26px;font-weight:700}
.sc .lbl2{color:var(--dm);font-size:12px;margin-top:4px}
.sc .ic{position:absolute;top:14px;right:14px;font-size:20px;opacity:.25}
.card{background:var(--sf);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-bottom:16px}
.card h3{font-size:14px;font-weight:600}
.cb{position:relative;width:100%;height:240px}
.chr{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px}
.bl{display:flex;flex-direction:column;gap:8px;max-height:520px;overflow-y:auto}
.br{display:flex;align-items:center;gap:10px;font-size:13px}
.bn{width:200px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx);text-decoration:none}
a.bn{color:var(--tx)}
a.bn:hover{color:var(--ac);text-decoration:underline}
.bt{flex:1;height:18px;background:var(--sf2);border-radius:6px;overflow:hidden;min-width:60px}
.bf{display:block;height:100%;background:linear-gradient(90deg,#7c6bff,#00d4b1);border-radius:6px}
.bv{width:48px;flex-shrink:0;text-align:right;font-weight:700}
.fbr{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px;padding:10px 14px;background:var(--sf);border:1px solid var(--bd);border-radius:12px}
.fbs{display:flex;gap:6px;flex-wrap:wrap;flex:1}
.fb{padding:5px 12px;background:var(--sf2);border:1px solid var(--bd);border-radius:20px;color:var(--dm);cursor:pointer;font-size:12px;font-weight:500;font-family:inherit;transition:all .15s}
.fb:hover{color:var(--tx)}
.fb.active{background:rgba(124,107,255,.18);border-color:var(--ac);color:var(--ac)}
.fc{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.fc input[type=date]{padding:5px 10px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-size:12px;outline:none;font-family:inherit}
.fl{font-size:11px;color:var(--dm);margin-left:4px}
.al{display:flex;flex-direction:column;gap:10px}
.ai{border:1px solid var(--bd);border-radius:12px;overflow:hidden;background:var(--sf)}
.ah{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;user-select:none}
.ah:hover{background:var(--sf2)}
.achev{color:var(--dm);font-size:12px;transition:transform .2s;flex-shrink:0;width:14px;text-align:center}
.ai.open .achev{transform:rotate(90deg);color:var(--ac)}
.atw{flex:1;min-width:0}
.at{font-weight:600;color:var(--tx);font-size:14px;text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
a.at:hover{color:var(--ac)}
.asub{font-size:11px;color:var(--dm);margin-top:3px}
.acnt{background:rgba(124,107,255,.15);color:var(--tx);font-weight:700;font-size:12px;padding:4px 12px;border-radius:20px;flex-shrink:0}
.abdy{display:none;padding:0 14px 8px;border-top:1px solid var(--bd)}
.ai.open .abdy{display:block}
.cr{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--bd)}
.cr:last-child{border-bottom:none}
.cav{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#0f0c29;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
.cm{flex:1;min-width:0}
.chr2{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.cu{font-size:13px;font-weight:600}
.cd{color:var(--dm);font-size:11px;margin-left:auto}
.ct{font-size:13px;line-height:1.5;margin-bottom:8px;word-wrap:break-word;white-space:pre-wrap}
.ca{display:flex;gap:6px;flex-wrap:wrap}
.ca button{background:var(--sf2);border:1px solid var(--bd);color:var(--dm);cursor:pointer;padding:5px 10px;border-radius:6px;font-size:11px;font-family:inherit;display:inline-flex;align-items:center;gap:4px;transition:all .15s}
.ca button:hover{color:var(--tx)}
.ca button.danger:hover{color:var(--dg);border-color:rgba(255,107,107,.3)}
.sbd{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:capitalize}
.sbd.published{background:rgba(0,212,177,.15);color:var(--ac2)}
.sbd.pending{background:rgba(255,181,69,.15);color:var(--wn)}
.sbd.spam{background:rgba(255,107,107,.15);color:var(--dg)}
.pag{display:flex;justify-content:space-between;align-items:center;margin-top:14px;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--dm)}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:100;display:none;align-items:center;justify-content:center;padding:20px}
.mo.show{display:flex}
.mbox{background:var(--mb);border:1px solid var(--bd);border-radius:16px;max-width:480px;width:100%;display:flex;flex-direction:column;color:var(--tx)}
.mh{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--bd)}
.mh h3{font-size:15px;font-weight:600}
.mbody{padding:18px}
.mf{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--bd)}
.ts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:200;max-width:340px}
.toast{padding:12px 16px;border-radius:12px;background:var(--mb);border:1px solid var(--bd);font-size:13px;color:var(--tx);display:flex;align-items:flex-start;gap:10px;animation:su .25s ease}
.toast.success{border-color:rgba(0,212,177,.4)}
.toast.success i{color:var(--ac2)}
.toast.error{border-color:rgba(255,107,107,.4)}
.toast.error i{color:var(--dg)}
.toast.info i{color:var(--ac)}
@keyframes su{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){.sb{position:fixed;left:-240px;top:0;height:100vh;transition:left .2s;z-index:100;box-shadow:4px 0 24px rgba(0,0,0,.5)}.sb.open{left:0}.sg{grid-template-columns:1fr 1fr}.cnt{padding:14px}.bn{width:130px}}
</style>
</head>
<body>
<div id="LV" class="lv"><div class="lc"><h1>FastWebTools</h1><p class="sub">Admin control center</p><div id="LE" class="lerr"><i class="fa-solid fa-triangle-exclamation"></i><span id="LES">Invalid credentials</span></div><div class="field"><label>Username</label><div class="iw"><input type="text" id="UN" placeholder="Enter username" autocomplete="username" autocapitalize="none" spellcheck="false"></div></div><div class="field"><label>Password</label><div class="iw"><input type="password" id="PW" placeholder="Enter password" autocomplete="current-password"><button type="button" id="TP"><i class="fa-regular fa-eye" id="EI"></i></button></div></div><div class="lr"><label><input type="checkbox" id="REM"> Remember me</label></div><button class="btn" id="LB" type="button">Sign in</button><div class="lfoot">&copy; 2026 FastWebTools v2.5.10</div></div></div>
<div id="AV" class="app hidden">
<aside class="sb" id="SB"><div class="brand">FastWebTools</div><nav><div class="ni active" data-page="overview"><i class="fa-solid fa-gauge-high"></i> Overview</div><div class="ni" data-page="comments"><i class="fa-solid fa-comments"></i> Comments</div><div class="ni" data-page="tool-likes"><i class="fa-solid fa-thumbs-up"></i> Tool Likes</div><div class="ni" data-page="article-likes"><i class="fa-solid fa-heart"></i> Article Likes</div><div class="ni" data-page="settings"><i class="fa-solid fa-gear"></i> Settings</div></nav><div class="sbot"><div class="lpill"><span class="ldot"></span><span id="LC">0</span> live now</div><button class="bg2" style="width:100%;justify-content:center" id="LGOUT"><i class="fa-solid fa-right-from-bracket"></i> Logout</button></div></aside>
<div class="mw">
<header class="tb"><button class="ib" id="MT"><i class="fa-solid fa-bars"></i></button><span class="title" id="PT">Overview</span><div class="sw"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search..."></div><div class="tba"><button class="ib" id="RB" title="Refresh"><i class="fa-solid fa-rotate"></i></button><button class="ib" id="TG" title="Toggle theme"><i class="fa-solid fa-moon"></i></button></div></header>
<div class="cnt">
<div class="pg active" id="pg-overview"><div class="ph"><div><h2>Overview</h2><div class="subx">Real-time snapshot</div></div><label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--dm)"><input type="checkbox" id="AR" checked> Auto-refresh</label></div><div class="fbr"><div class="fbs" id="FBS"><button class="fb active" data-p="all">All-time</button><button class="fb" data-p="today">Today</button><button class="fb" data-p="yesterday">Yesterday</button><button class="fb" data-p="7d">Last 7 days</button><button class="fb" data-p="30d">Last 30 days</button><button class="fb" data-p="month">This month</button></div><div class="fc"><input type="date" id="FF"><span style="color:var(--dm)">to</span><input type="date" id="FT"><button class="fb" id="AFC">Apply</button></div><span class="fl" id="FL"></span></div><div class="sg" id="STG"></div><div class="card"><h3 style="margin-bottom:12px">Daily activity</h3><div class="cb" id="CHTW"><canvas id="CHT"></canvas></div></div><div class="card"><div class="chr"><h3>Top Tools</h3><button class="bg2" data-nav="tool-likes">View all <i class="fa-solid fa-arrow-right"></i></button></div><div id="TUL" class="bl"></div></div><div class="card"><div class="chr"><h3>Top Articles</h3><button class="bg2" data-nav="article-likes">View all <i class="fa-solid fa-arrow-right"></i></button></div><div id="AVL" class="bl"></div></div></div>
<div class="pg" id="pg-comments"><div class="ph"><div><h2>Comments</h2><div class="subx">Moderate user comments</div></div></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;align-items:center"><div class="sw" style="max-width:280px"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="CS" placeholder="Search comments..."></div><select id="SF" class="bg2" style="padding:8px 14px"><option value="all">All statuses</option><option value="published">Published</option><option value="pending">Pending</option><option value="spam">Spam</option></select><button class="bg2" id="RC"><i class="fa-solid fa-rotate"></i> Refresh</button></div><div class="card" style="padding:14px" id="CL">Loading...</div><div class="pag"><span id="PI">Page 1</span><div style="display:flex;gap:6px"><button class="bg2" id="PP"><i class="fa-solid fa-chevron-left"></i> Prev</button><button class="bg2" id="NPB">Next <i class="fa-solid fa-chevron-right"></i></button></div></div></div>
<div class="pg" id="pg-tool-likes"><div class="ph"><div><h2>Tool Likes</h2><div class="subx">Most liked tools</div></div><button class="bg2" id="RTL"><i class="fa-solid fa-rotate"></i> Refresh</button></div><div class="card"><div id="TLL" class="bl">Loading...</div></div></div>
<div class="pg" id="pg-article-likes"><div class="ph"><div><h2>Article Likes</h2><div class="subx">Most liked articles</div></div><button class="bg2" id="RAL"><i class="fa-solid fa-rotate"></i> Refresh</button></div><div class="card"><div id="ALL2" class="bl">Loading...</div></div></div>
<div class="pg" id="pg-settings"><div class="ph"><div><h2>Settings</h2></div></div><div class="card" style="max-width:500px"><h3 style="margin-bottom:12px">Change Password</h3><div class="field"><label>Current Password</label><div class="iw"><input type="password" id="CP"></div></div><div class="field"><label>New Password</label><div class="iw"><input type="password" id="NP2"></div></div><div class="field"><label>Confirm New Password</label><div class="iw"><input type="password" id="CPX"></div></div><button class="btn" style="width:auto;padding:11px 28px" id="CPB">Update Password</button></div><div class="card" style="max-width:500px;border-color:rgba(255,107,107,.3)"><h3 style="color:var(--dg);margin-bottom:8px"><i class="fa-solid fa-triangle-exclamation"></i> Danger Zone</h3><p style="color:var(--dm);font-size:13px;margin-bottom:12px">Clear all analytics data. This cannot be undone.</p><button class="bd2" id="CAB">Clear All Data</button></div></div>
</div></div></div>
<div class="mo" id="MO"><div class="mbox"><div class="mh"><h3 id="MTT">Confirm</h3><button class="ib" id="MC"><i class="fa-solid fa-xmark"></i></button></div><div class="mbody" id="MB"></div><div class="mf" id="MF"></div></div></div>
<div class="ts" id="TS"></div>
<script src="/app.js" defer></script>
</body></html>`;

function jR(o,s){return new Response(JSON.stringify(o),{status:s||200,headers:Object.assign({"Content-Type":"application/json;charset=UTF-8"},CORS)});}

async function proxy(req,path,env){
  const h={};
  const a=req.headers.get("Authorization");if(a)h["Authorization"]=a;
  const ct=req.headers.get("Content-Type");if(ct)h["Content-Type"]=ct;
  let body;
  if(!["GET","HEAD"].includes(req.method)){try{body=await req.arrayBuffer();}catch(e){return jR({success:false,message:"Bad body"},400);}}
  try{
    let r;
    if(env&&env.BACKEND&&typeof env.BACKEND.fetch==="function"){r=await env.BACKEND.fetch("https://internal"+path,{method:req.method,headers:h,body});}
    else{r=await fetch(BE+path,{method:req.method,headers:h,body});}
    const raw=await r.text();
    let p=null;try{p=raw?JSON.parse(raw):null;}catch(e){}
    if(p!==null)return jR(p,r.status);
    return new Response(raw,{status:r.status,headers:Object.assign({"Content-Type":r.headers.get("Content-Type")||"text/plain"},CORS)});
  }catch(e){return jR({success:false,message:"Backend error: "+(e&&e.message||String(e))},502);}
}

export default {
  async fetch(req,env,ctx){
    try{
      const url=new URL(req.url);
      if(req.method==="OPTIONS")return new Response(null,{headers:CORS});
      if(url.pathname==="/sw.js")return new Response(SW,{headers:{"content-type":"text/javascript","cache-control":"no-store"}});
      if(url.pathname==="/app.js")return new Response(APP_JS,{headers:{"content-type":"text/javascript;charset=UTF-8","cache-control":"no-store,no-cache,must-revalidate"}});
      if(url.pathname==="/api/login")return proxy(req,"/admin/login"+url.search,env);
      if(url.pathname.startsWith("/api/"))return proxy(req,url.pathname.replace(/^\/api/,"/admin")+url.search,env);
      return new Response(HTML,{headers:{"Content-Type":"text/html;charset=UTF-8","Cache-Control":"no-store,no-cache,must-revalidate"}});
    }catch(err){
      return new Response("Server error: "+(err&&err.message||String(err)),{status:500});
    }
  }
};
