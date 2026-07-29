/** FastWebTools Admin v2.5.9 - Standalone */
const BB = "https://www.fastwebtools.online";
const BE = "https://fastwebtools-admin.formyworkupwork.workers.dev";
const H = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>FastWebTools Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}:root{--bg:#0f0c29;--bg2:linear-gradient(135deg,#0f0c29,#302b63,#24243e);--sf:rgba(255,255,255,.04);--sf2:rgba(255,255,255,.06);--bd:rgba(255,255,255,.08);--tx:#f2f1fb;--dm:#8a86ab;--ac:#7c6bff;--ac2:#00d4b1;--dg:#ff6b6b;--wn:#ffb545;--mb:#191634;color-scheme:dark}html[data-theme=light]{--bg:#eef0fb;--bg2:linear-gradient(135deg,#eef0fb,#e3e6f8);--sf:rgba(20,20,60,.035);--sf2:rgba(20,20,60,.055);--bd:rgba(20,20,60,.10);--tx:#1b1a2b;--dm:#63607d;--mb:#fff;color-scheme:light}
body{font-family:Inter,sans-serif;background:var(--bg);color:var(--tx);min-height:100vh;transition:background .2s,color .2s}
.hidden{display:none!important}
.lv{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;background:var(--bg2)}
.lc{background:var(--sf2);backdrop-filter:blur(20px);border:1px solid var(--bd);border-radius:24px;padding:40px 32px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.lc h1{font-size:24px;font-weight:700;text-align:center;margin-bottom:4px}
.logo{text-align:center;font-size:48px;margin-bottom:16px;color:var(--ac)}
.sub{text-align:center;color:var(--dm);font-size:14px;margin-bottom:24px}
.field{margin-bottom:16px}.field label{display:block;font-size:12px;font-weight:600;color:var(--dm);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em}
.iw{display:flex;align-items:center;background:var(--sf2);border:1px solid var(--bd);border-radius:12px;padding:0 16px;transition:border-color .2s}
.iw:focus-within{border-color:var(--ac)}
.iw input{border:none;padding:12px 8px 12px 0;flex:1;background:transparent;color:var(--tx);font-size:14px;outline:none}
.iw i{color:var(--dm);margin-right:10px}
.iw button{background:none;border:none;color:var(--dm);cursor:pointer;padding:8px;font-size:16px;line-height:1}
.lerr{background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3);color:var(--dg);padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:16px;display:none;gap:10px;align-items:center}
.lerr.show{display:flex}
.lr{display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:20px;color:var(--dm)}
.lr label{display:flex;align-items:center;gap:6px;cursor:pointer}
.lr label input{accent-color:var(--ac);width:auto}
.lr a{color:var(--ac);text-decoration:none;cursor:pointer}
.btn{width:100%;padding:14px;border:none;border-radius:12px;font-size:14px;font-weight:600;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#0f0c29;cursor:pointer;transition:transform .2s,box-shadow .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(124,107,255,.4)}
.btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.sp{display:none}.loading .sp{display:inline-block}.loading .lbl{display:none}
.lfoot{text-align:center;font-size:12px;color:var(--dm);margin-top:20px}
.app{display:flex;min-height:100vh}
.sb{width:220px;background:var(--sf);border-right:1px solid var(--bd);padding:20px 14px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0;z-index:40}
.brand{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:700;padding-bottom:20px;border-bottom:1px solid var(--bd);margin-bottom:16px}
.brand i{color:var(--ac);font-size:22px}
.ni{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;color:var(--dm);cursor:pointer;transition:all .15s;font-size:14px;font-weight:500}
.ni:hover{background:var(--sf2);color:var(--tx)}
.ni.active{background:rgba(124,107,255,.15);color:var(--ac)}
.ni i{width:18px}
.sbot{margin-top:auto;padding-top:16px;border-top:1px solid var(--bd)}
.lpill{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dm)}
.ldot{width:8px;height:8px;border-radius:50%;background:var(--ac2);animation:pulse 1.8s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,212,177,.6)}70%{box-shadow:0 0 0 8px rgba(0,212,177,0)}}
.mw{flex:1;min-width:0}
.tb{display:flex;align-items:center;gap:16px;padding:14px 24px;border-bottom:1px solid var(--bd);background:var(--sf);position:sticky;top:0;z-index:10}
.tb .title{font-weight:600;font-size:18px}
.sw{display:flex;align-items:center;gap:10px;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:8px 14px;flex:1;max-width:350px}
.sw input{border:none;background:transparent;color:var(--tx);outline:none;flex:1;font-size:13px}
.sw i{color:var(--dm)}
.tba{display:flex;align-items:center;gap:8px;margin-left:auto}
.ib{background:none;border:none;color:var(--dm);font-size:16px;cursor:pointer;padding:8px;border-radius:8px;transition:all .15s}
.ib:hover{background:var(--sf2);color:var(--tx)}
.av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--ac),var(--ac2));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#0f0c29}
.cnt{padding:24px;max-width:1400px;margin:0 auto}
.pg{display:none}.pg.active{display:block;animation:fi .25s ease}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ph{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px}
.ph h2{font-size:22px;font-weight:700}
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:20px}
.sc{background:var(--sf);border:1px solid var(--bd);border-radius:16px;padding:18px;position:relative;cursor:pointer;transition:transform .15s,border-color .15s}
.sc:hover{transform:translateY(-2px);border-color:var(--ac)}
.sc .val{font-size:28px;font-weight:700}
.sc .lbl2{color:var(--dm);font-size:13px;margin-top:4px}
.sc .ic{position:absolute;top:18px;right:18px;font-size:22px;opacity:.25}
.card{background:var(--sf);border:1px solid var(--bd);border-radius:16px;padding:18px;overflow:hidden;margin-bottom:20px}
.card h3{font-size:15px;font-weight:600;margin-bottom:12px}
.cb{position:relative;width:100%;height:260px}
.chr{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.bl{display:flex;flex-direction:column;gap:10px;max-height:420px;overflow-y:auto}
.br{display:flex;align-items:center;gap:10px;font-size:13px}
.bn{width:150px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--tx)}
a.bn{text-decoration:none}a.bn:hover{color:var(--ac)}
.bt{flex:1;height:20px;background:var(--sf2);border-radius:6px;overflow:hidden}
.bf{display:block;height:100%;background:linear-gradient(90deg,#7c6bff,#00d4b1);border-radius:6px}
.bv{width:44px;flex-shrink:0;text-align:right;font-weight:700}
.fbr{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px;padding:12px 16px;background:var(--sf);border:1px solid var(--bd);border-radius:12px}
.fbs{display:flex;gap:6px;flex-wrap:wrap;flex:1}
.fb{padding:5px 12px;background:var(--sf2);border:1px solid var(--bd);border-radius:20px;color:var(--dm);cursor:pointer;font-size:12px;font-weight:500}
.fb:hover{color:var(--tx)}
.fb.active{background:rgba(124,107,255,.18);border-color:var(--ac);color:var(--ac)}
.fc{display:flex;align-items:center;gap:6px}
.fc input[type=date]{padding:5px 10px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-size:12px;outline:none}
.bg2{padding:8px 16px;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;color:var(--tx);cursor:pointer;font-size:13px}
.bg2:hover{background:var(--sf)}.bg2:disabled{opacity:.4;cursor:not-allowed}
.bd2{padding:8px 16px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);border-radius:10px;color:var(--dg);cursor:pointer;font-size:13px;font-weight:600}
.bd2:hover{background:rgba(255,107,107,.2)}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:100;display:none;align-items:center;justify-content:center;padding:20px}
.mo.show{display:flex}
.mbox{background:var(--mb);border:1px solid var(--bd);border-radius:18px;max-width:480px;width:100%;display:flex;flex-direction:column}
.mh{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--bd)}
.mh h3{font-size:16px;font-weight:600}
.mbody{padding:20px;overflow-y:auto}
.mf{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid var(--bd)}
.ts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:10px;z-index:200}
.toast{padding:12px 16px;border-radius:12px;background:var(--mb);border:1px solid var(--bd);font-size:13px;display:flex;align-items:flex-start;gap:10px}
.toast.success i{color:var(--ac2)}.toast.error i{color:var(--dg)}.toast.info i{color:var(--ac)}
.al{display:flex;flex-direction:column;gap:10px}
.ai{border:1px solid var(--bd);border-radius:12px;overflow:hidden;background:var(--sf)}
.ah{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;user-select:none}
.ah:hover{background:var(--sf2)}
.achev{color:var(--dm);font-size:12px;transition:transform .2s;flex-shrink:0}
.ai.open .achev{transform:rotate(90deg);color:var(--ac)}
.atw{flex:1;min-width:0}
.at{font-weight:600;color:var(--tx);font-size:14px;text-decoration:none}
a.at:hover{color:var(--ac)}
.asub{font-size:11px;color:var(--dm);margin-top:3px}
.acnt{background:rgba(124,107,255,.15);color:var(--tx);font-weight:700;font-size:12px;padding:4px 12px;border-radius:20px}
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
.ca button{background:var(--sf2);border:1px solid var(--bd);color:var(--dm);cursor:pointer;padding:5px 10px;border-radius:6px;font-size:11px;transition:all .15s;display:inline-flex;align-items:center;gap:4px}
.ca button:hover{color:var(--tx)}.ca button.danger:hover{color:var(--dg)}
.sbd{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:capitalize}
.sbd.published{background:rgba(0,212,177,.15);color:var(--ac2)}
.sbd.pending{background:rgba(255,181,69,.15);color:var(--wn)}
.sbd.spam{background:rgba(255,107,107,.15);color:var(--dg)}
.pag{display:flex;justify-content:space-between;align-items:center;margin-top:14px}
@media(max-width:768px){.sb{position:fixed;left:-240px;top:0;height:100vh;width:240px;background:#171432;transition:left .2s;z-index:100}.sb.open{left:0}.sg{grid-template-columns:1fr 1fr}}
</style></head>
<body>
<div id="LV" class="lv"><div class="lc">
<div class="logo"><i class="fa-solid fa-wrench"></i></div>
<h1>FastWebTools</h1><p class="sub">Admin control center</p>
<div id="LE" class="lerr"><i class="fa-solid fa-triangle-exclamation"></i><span id="LES">Invalid credentials</span></div>
<div class="field"><label>Username</label><div class="iw"><i class="fa-regular fa-user"></i><input type="text" id="UN" placeholder="Enter username" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></div></div>
<div class="field"><label>Password</label><div class="iw"><i class="fa-solid fa-lock"></i><input type="password" id="PW" placeholder="Enter password" autocomplete="current-password"><button type="button" id="TP"><i class="fa-regular fa-eye" id="EI"></i></button></div></div>
<div class="lr"><label><input type="checkbox" id="REM"> Remember me</label><a onclick="toast2('Contact admin.','info')">Forgot password?</a></div>
<button class="btn" id="LB"><span class="lbl"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign in</span><span class="sp"><i class="fa-solid fa-circle-notch fa-spin"></i></span></button>
<div class="lfoot">&copy; 2026 FastWebTools v2.5.9</div>
</div></div>
<div id="AV" class="app hidden">
<aside class="sb" id="SB">
<div class="brand"><i class="fa-solid fa-wrench"></i> FastWebTools</div>
<nav>
<div class="ni active" data-page="overview"><i class="fa-solid fa-gauge-high"></i> Overview</div>
<div class="ni" data-page="comments"><i class="fa-solid fa-comments"></i> Comments</div>
<div class="ni" data-page="tool-likes"><i class="fa-solid fa-thumbs-up"></i> Tool Likes</div>
<div class="ni" data-page="article-likes"><i class="fa-solid fa-heart"></i> Article Likes</div>
<div class="ni" data-page="settings"><i class="fa-solid fa-gear"></i> Settings</div>
</nav>
<div class="sbot">
<div class="lpill"><span class="ldot"></span><span id="LC">0</span> live now</div>
<button class="bg2" style="width:100%;margin-top:10px" id="LGOUT"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
</div></aside>
<div class="mw">
<header class="tb">
<button class="ib" id="MT"><i class="fa-solid fa-bars"></i></button>
<span class="title" id="PT">Overview</span>
<div class="sw"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Search..."></div>
<div class="tba">
<button class="ib" id="RB"><i class="fa-solid fa-rotate"></i></button>
<button class="ib" id="TG"><i class="fa-solid fa-moon"></i></button>
<span class="av"><i class="fa-solid fa-user"></i></span>
</div></header>
<div class="cnt">
<div class="pg active" id="pg-overview">
<div class="ph"><div><h2>Overview</h2><div class="sub">Real-time snapshot</div></div><label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--dm)"><input type="checkbox" id="AR" checked> Auto-refresh</label></div>
<div class="fbr"><div class="fbs" id="FBS"><button class="fb active" data-p="all">All-time</button><button class="fb" data-p="today">Today</button><button class="fb" data-p="yesterday">Yesterday</button><button class="fb" data-p="7d">Last 7 days</button><button class="fb" data-p="30d">Last 30 days</button><button class="fb" data-p="month">This month</button></div><div class="fc"><input type="date" id="FF"><span style="color:var(--dm)">&mdash;</span><input type="date" id="FT"><button class="fb" id="AFC">Apply</button></div><span id="FL" style="font-size:11px;color:var(--dm);margin-left:4px"></span></div>
<div class="sg" id="STG"></div>
<div class="card"><h3>Daily activity</h3><div class="cb"><canvas id="CHT"></canvas></div></div>
<div class="card"><div class="chr"><h3>Tool usage</h3><button class="bg2" id="TAT">View all</button></div><div id="TUL" class="bl"></div></div>
<div class="card"><div class="chr"><h3>Blog views</h3><button class="bg2" id="TAA">View all</button></div><div id="AVL" class="bl"></div></div>
</div>
<div class="pg" id="pg-comments">
<div class="ph"><div><h2>Comments</h2></div></div>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px"><div class="sw" style="max-width:280px"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="CS" placeholder="Search..."></div><select id="SF" class="bg2" style="padding:8px 14px"><option value="all">All</option><option value="published">Published</option><option value="pending">Pending</option><option value="spam">Spam</option></select><button class="bg2" id="RC"><i class="fa-solid fa-rotate"></i> Refresh</button></div>
<div class="card" style="padding:0"><div id="CL"></div></div>
<div class="pag"><span id="PI">Page 1</span><div><button class="ib" id="PP"><i class="fa-solid fa-chevron-left"></i></button><button class="ib" id="NP"><i class="fa-solid fa-chevron-right"></i></button></div></div>
</div>
<div class="pg" id="pg-tool-likes"><div class="ph"><div><h2>Tool Likes</h2></div><button class="bg2" id="RTL"><i class="fa-solid fa-rotate"></i></button></div><div class="card"><div id="TLL" class="bl"></div></div></div>
<div class="pg" id="pg-article-likes"><div class="ph"><div><h2>Article Likes</h2></div><button class="bg2" id="RAL"><i class="fa-solid fa-rotate"></i></button></div><div class="card"><div id="ALL2" class="bl"></div></div></div>
<div class="pg" id="pg-settings"><div class="ph"><div><h2>Settings</h2></div></div>
<div class="card" style="max-width:500px">
<h3>Change Password</h3>
<div class="field"><label>Current Password</label><input type="password" id="CP" style="width:100%;padding:12px;background:var(--sf2);border:1px solid var(--bd);border-radius:12px;color:var(--tx);font-size:14px;outline:none"></div>
<div class="field"><label>New Password</label><input type="password" id="NP" style="width:100%;padding:12px;background:var(--sf2);border:1px solid var(--bd);border-radius:12px;color:var(--tx);font-size:14px;outline:none"></div>
<div class="field"><label>Confirm</label><input type="password" id="CPX" style="width:100%;padding:12px;background:var(--sf2);border:1px solid var(--bd);border-radius:12px;color:var(--tx);font-size:14px;outline:none"></div>
<button class="btn" style="width:auto;padding:10px 28px" id="CPB">Update Password</button>
</div>
<div class="card" style="max-width:500px;margin-top:16px;border-color:rgba(255,107,107,.3)"><h3 style="color:var(--dg)"><i class="fa-solid fa-triangle-exclamation"></i> Danger Zone</h3><button class="bd2" id="CAB">Clear All Data</button></div>
</div>
</div></div></div>
</div>
<div class="mo" id="MO"><div class="mbox"><div class="mh"><h3 id="MTT">Confirm</h3><button class="ib" id="MC"><i class="fa-solid fa-xmark"></i></button></div><div class="mbody" id="MB"></div><div class="mf" id="MF"></div></div></div>
<div class="ts" id="TS"></div>
<script>
(function(){
"use strict";
var API="/api",TK="fwt_token",TH="fwt_theme",PL=20;
var token=null,curP="overview",cPg=1,lastC=0,liveT=null,arT=null,charts={},rng=null;
function G(id){return document.getElementById(id);}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\'":"\'&quot;\'":""}[c]||c;});}
function esc2(s){var d=document.createElement("div");d.textContent=String(s==null?"":s);return d.innerHTML;}
function ymd(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function fmt(n){n=Number(n)||0;return n>=1000?(n/1000).toFixed(1)+"k":String(n);}
function fdt(iso){if(!iso)return"\u2014";var d=new Date(iso);if(isNaN(d))return"\u2014";var mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var h=d.getHours(),ap=h>=12?"PM":"AM",h12=h%12||12;return mo[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear()+" "+h12+":"+String(d.getMinutes()).padStart(2,"0")+" "+ap;}
function toast2(m,t){t=t||"info";var ic={success:"fa-circle-check",error:"fa-circle-exclamation",info:"fa-circle-info"};var el=document.createElement("div");el.className="toast "+t;el.innerHTML="<i class=\"fa-solid "+ic[t]+"\"></i> <span></span>";el.querySelector("span").textContent=m;G("TS").appendChild(el);setTimeout(function(){el.style.opacity="0";setTimeout(function(){el.remove();},300);},4200);}
function showMod(title,body,btns){G("MTT").textContent=title;G("MB").innerHTML=body;var mf=G("MF");mf.innerHTML="";(btns||[]).forEach(function(b){var btn=document.createElement("button");btn.className=b.cls||"bg2";btn.textContent=b.label;btn.onclick=b.fn;mf.appendChild(btn);});G("MO").classList.add("show");}
function closeMod(){G("MO").classList.remove("show");}
G("MC").onclick=closeMod;
G("MO").onclick=function(e){if(e.target===this)closeMod();};
function wr(path){if(!rng)return path;var s=path.indexOf("?")===-1?"?":"&";return path+s+"from="+rng.from+"&to="+rng.to;}
function setRng(from,to){rng=from?{from:from,to:to||from}:null;var fl=G("FL");if(fl)fl.textContent=rng?("Showing: "+rng.from+(rng.from!==rng.to?" to "+rng.to:"")):"";loadOV();}
function presetRng(p){var now=new Date(),to=ymd(now),from;if(p==="all"){setRng(null);return;}if(p==="today"){from=ymd(now);}else if(p==="yesterday"){var y1=new Date(now-864e5);from=to=ymd(y1);}else if(p==="7d"){from=ymd(new Date(now-6*864e5));}else if(p==="30d"){from=ymd(new Date(now-29*864e5));}else if(p==="month"){from=ymd(new Date(now.getFullYear(),now.getMonth(),1));}setRng(from,to);}
async function api(path,opts){opts=opts||{};var h={"Content-Type":"application/json"};if(token)h["Authorization"]="Bearer "+token;var r;try{r=await fetch(API+path,{method:opts.method||"GET",headers:h,body:opts.body});}catch(e){throw new Error("Network error");}if(r.status===401){logout();throw new Error("Session expired");}var raw=await r.text();var d;try{d=raw?JSON.parse(raw):{};}catch(e){throw new Error("Bad response ("+r.status+")");}if(!r.ok||d.success===false)throw new Error(d.message||d.error||"Error "+r.status);return d;}
async function doLogin(u,p){var r=await fetch(API+"/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,password:p})});var raw=await r.text();try{return JSON.parse(raw);}catch(e){return{success:false,message:"Invalid response"};}}
function logout(){token=null;localStorage.removeItem(TK);if(liveT)clearInterval(liveT);if(arT)clearInterval(arT);G("AV").classList.add("hidden");G("LV").classList.remove("hidden");}
function showApp(){G("LV").classList.add("hidden");G("AV").classList.remove("hidden");loadPage("overview");if(arT)clearInterval(arT);arT=setInterval(function(){if(G("AR").checked)loadCur();},15000);startLive();}
// LOGIN BUTTON
G("LB").addEventListener("click",async function(){
var le=G("LE"),les=G("LES");le.classList.remove("show");this.classList.add("loading");this.disabled=true;
try{var uv=G("UN").value.trim(),pv=G("PW").value;
var data=await doLogin(uv,pv);
if(data&&data.success&&data.token){token=data.token;if(G("REM").checked)localStorage.setItem(TK,token);toast2("Welcome back!","success");showApp();}else{les.textContent=(data&&data.message)||"Invalid credentials";le.classList.add("show");}}
catch(ex){les.textContent=ex.message||"Network error";le.classList.add("show");}
this.classList.remove("loading");this.disabled=false;});
// EYE TOGGLE
G("TP").addEventListener("click",function(){var pw=G("PW");pw.type=(pw.type==="password")?"text":"password";G("EI").className=(pw.type==="password")?"fa-regular fa-eye":"fa-regular fa-eye-slash";});
// KEYBOARD
G("UN").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();G("PW").focus();}});
G("PW").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();G("LB").click();}});
function startLive(){if(liveT)clearInterval(liveT);pollLive();liveT=setInterval(pollLive,3000);}
async function pollLive(){try{var d=await api("/visitors/realtime");var el=G("LC");if(el)el.textContent=fmt(d.live||d.liveVisitors||d.count||0);}catch(e){}}
function applyTheme(t){document.documentElement.setAttribute("data-theme",t);var i=G("TG").querySelector("i");if(i)i.className=t==="dark"?"fa-solid fa-moon":"fa-solid fa-sun";}
function loadPage(name){curP=name;document.querySelectorAll(".pg").forEach(function(p){p.classList.remove("active");});var pg=G("pg-"+name);if(pg)pg.classList.add("active");document.querySelectorAll(".ni").forEach(function(n){n.classList.toggle("active",n.dataset.page===name);});G("PT").textContent=name.charAt(0).toUpperCase()+name.slice(1).replace(/-/g," ");G("SB").classList.remove("open");if(name==="overview")loadOV();else if(name==="comments")loadCmts(1);else if(name==="tool-likes")loadTL();else if(name==="article-likes")loadAL();}
function loadCur(){if(curP==="overview")loadOV();else if(curP==="comments")loadCmts(cPg);else if(curP==="tool-likes")loadTL();else if(curP==="article-likes")loadAL();}
var _ov=false;
async function loadOV(){if(_ov)return;_ov=true;
try{var s=await api(wr("/stats"));var st=s.stats||s;var cards=[{k:"totalVisits",l:"Total Visits",ic:"fa-eye"},{k:"uniqueVisitors",l:"Unique Visitors",ic:"fa-users"},{k:"toolUses",l:"Tool Uses",ic:"fa-wrench"},{k:"comments",l:"Comments",ic:"fa-comments",pg:"comments"},{k:"toolLikes",l:"Tool Likes",ic:"fa-thumbs-up",pg:"tool-likes"},{k:"articleLikes",l:"Article Likes",ic:"fa-heart",pg:"article-likes"}];G("STG").innerHTML=cards.map(function(c){var v=st[c.k]||0;return"<div class=\"sc\" data-pg=\""+(c.pg||"")+"\"><div class=\"val\">"+fmt(v)+"</div><div class=\"lbl2\">"+c.l+"</div><i class=\"fa-solid "+c.ic+" ic\"></i></div>";}).join("");document.querySelectorAll(".sc[data-pg]").forEach(function(el){if(el.dataset.pg)el.onclick=function(){loadPage(this.dataset.pg);};});}catch(e){toast2("Stats: "+e.message,"error");}
try{var dd=await api(wr("/daily-activity?days=7"));var days=dd.days||dd.data||dd;if(Array.isArray(days)&&days.length){if(charts.d)charts.d.destroy();var ctx=G("CHT");if(ctx)charts.d=new Chart(ctx.getContext("2d"),{type:"line",data:{labels:days.map(function(d){return d.date||d.day||"";});
,datasets:[{label:"Visits",data:days.map(function(d){return d.visits||d.count||0;}),borderColor:"#7c6bff",backgroundColor:"rgba(124,107,255,0.12)",fill:true,tension:0.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:"#8a86ab"},grid:{color:"rgba(255,255,255,0.04)"}},y:{ticks:{color:"#8a86ab"},grid:{color:"rgba(255,255,255,0.04)"},beginAtZero:true}}}});}}catch(e){}
try{var td=await api("/popular-tools?limit=100");var tls=td.tools||td.data||td;if(!Array.isArray(tls))tls=[];var mx=tls[0]?(tls[0].count||tls[0].uses||1):1;G("TUL").innerHTML=tls.slice(0,10).map(function(t){var n=t.toolName||t.name||t.tool||"Unknown";var c=t.count||t.uses||0;var p=Math.round((c/mx)*100);return"<div class=\"br\"><span class=\"bn\">"+esc2(n)+"</span><span class=\"bt\"><span class=\"bf\" style=\"width:"+p+"%\"></span></span><span class=\"bv\">"+fmt(c)+"</span></div>";}).join("");}catch(e){}
try{var ad=await api(wr("/popular-articles?limit=100"));var arts=ad.articles||ad.data||ad;if(!Array.isArray(arts))arts=[];var mx2=arts[0]?(arts[0].count||arts[0].views||1):1;G("AVL").innerHTML=arts.slice(0,10).map(function(a){var slug=a.slug||a.articleSlug||a.article||"";var c=a.count||a.views||0;var p=Math.round((c/mx2)*100);return"<div class=\"br\"><a class=\"bn\" href=\"https://www.fastwebtools.online/blog/"+slug+"\" target=\"_blank\">"+esc2(slug)+"</a><span class=\"bt\"><span class=\"bf\" style=\"width:"+p+"%\"></span></span><span class=\"bv\">"+fmt(c)+"</span></div>";}).join("");}catch(e){}_ov=false;}
var _lc=false;
async function loadCmts(page){if(_lc)return;_lc=true;cPg=page||1;var sq=G("CS")?G("CS").value.trim():"",st2=G("SF")?G("SF").value:"all";
try{var q=new URLSearchParams();q.set("offset",(cPg-1)*PL);q.set("limit",PL);if(st2&&st2!=="all")q.set("status",st2);if(sq)q.set("search",sq);if(rng){q.set("from",rng.from);q.set("to",rng.to);}var data=await api("/comments?"+q.toString());var cmts=data.comments||data.data||data;if(!Array.isArray(cmts))cmts=[];lastC=cmts.length;
var grp={};cmts.forEach(function(c){var k=c.articleSlug||c.article_slug||c.slug||"";if(!grp[k])grp[k]={list:[],latest:null};grp[k].list.push(c);var dt=c.createdAt||c.created_at||c.date;if(!grp[k].latest||dt>grp[k].latest)grp[k].latest=dt;});
var keys=Object.keys(grp).sort(function(a,b){return(grp[b].latest||"")>(grp[a].latest||"")?1:-1;});
var cl=G("CL");if(!keys.length){cl.innerHTML="<div style=\"padding:30px;text-align:center;color:var(--dm)\">No comments found.</div>";}else{cl.innerHTML="<div class=\"al\">"+keys.map(function(slug,idx){var g2=grp[slug];var au="https://www.fastwebtools.online/blog/"+slug;var hd="<div class=\"ah\" onclick=\"this.parentElement.classList.toggle(\\\"open\\\")\"><i class=\"fa-solid fa-chevron-right achev\"></i><div class=\"atw\"><a class=\"at\" href=\""+au+"\" target=\"_blank\" onclick=\"event.stopPropagation()\">"+esc2(slug||"(no article)")+"</a><div class=\"asub\">"+fdt(g2.latest)+"</div></div><span class=\"acnt\">"+g2.list.length+"</span></div>";var bd="<div class=\"abdy\">"+g2.list.map(function(c){var init=(c.username||c.user||c.name||"?").charAt(0).toUpperCase();var badge="<span class=\"sbd "+(c.status||"published")+"\">"+(c.status||"published")+"</span>";var acts="<div class=\"ca\"><button onclick=\"apvC("+c.id+",\\\"published\\\")\"><i class=\"fa-solid fa-check\"></i> Approve</button><button onclick=\"apvC("+c.id+",\\\"pending\\\")\"><i class=\"fa-solid fa-clock\"></i> Pending</button><button onclick=\"apvC("+c.id+",\\\"spam\\\")\"><i class=\"fa-solid fa-ban\"></i> Spam</button><button class=\"danger\" onclick=\"delC("+c.id+")\"><i class=\"fa-solid fa-trash\"></i> Delete</button></div>";return"<div class=\"cr\"><div class=\"cav\">"+esc2(init)+"</div><div class=\"cm\"><div class=\"chr2\"><span class=\"cu\">"+esc2(c.username||c.user||c.name||"Anonymous")+"</span>"+badge+"<span class=\"cd\">"+fdt(c.createdAt||c.created_at||c.date)+"</span></div><div class=\"ct\">"+esc2(c.content||c.text||c.body||"")+"</div>"+acts+"</div></div>";}).join("")+"</div>";return"<div class=\"ai"+(idx===0?" open":"")+"\">"+hd+bd+"</div>";}).join("")+"</div>";}
G("PI").textContent="Page "+cPg;G("PP").disabled=cPg<=1;G("NP").disabled=cmts.length<PL;}catch(e){toast2("Comments: "+e.message,"error");}_lc=false;}
window.apvC=async function(id,s){try{await api("/comment/"+id,{method:"PUT",body:JSON.stringify({status:s})});toast2("Comment "+s,"success");loadCmts(cPg);}catch(e){toast2(e.message,"error");};};
window.delC=function(id){showMod("Delete comment?","<p style=\"color:var(--dm)\">Cannot be undone.</p>",[{label:"Cancel",fn:closeMod},{label:"Delete",cls:"bd2",fn:async function(){closeMod();try{await api("/comment/"+id,{method:"DELETE"});toast2("Deleted","success");loadCmts(cPg);}catch(e){toast2(e.message,"error");}}}]);};
async function loadTL(){try{var d=await api("/tool-likes?limit=100");var lks=d.likes||d.data||d;if(!Array.isArray(lks))lks=[];var mx=lks[0]?(lks[0].count||lks[0].likes||1):1;G("TLL").innerHTML=lks.map(function(t){var n=t.toolName||t.name||t.tool||"Unknown";var c=t.count||t.likes||0;return"<div class=\"br\"><span class=\"bn\">"+esc2(n)+"</span><span class=\"bt\"><span class=\"bf\" style=\"width:"+Math.round((c/mx)*100)+"%\"></span></span><span class=\"bv\">"+fmt(c)+"</span></div>";}).join("");}catch(e){toast2("Tool likes: "+e.message,"error");}}
async function loadAL(){try{var d=await api("/article-likes?limit=100");var lks=d.likes||d.data||d;if(!Array.isArray(lks))lks=[];var mx=lks[0]?(lks[0].count||lks[0].likes||1):1;G("ALL2").innerHTML=lks.map(function(a){var slug=a.slug||a.articleSlug||a.article||"Unknown";var c=a.count||a.likes||0;return"<div class=\"br\"><a class=\"bn\" href=\"https://www.fastwebtools.online/blog/"+slug+"\" target=\"_blank\">"+esc2(slug)+"</a><span class=\"bt\"><span class=\"bf\" style=\"width:"+Math.round((c/mx)*100)+"%\"></span></span><span class=\"bv\">"+fmt(c)+"</span></div>";}).join("");}catch(e){toast2("Article likes: "+e.message,"error");}}
document.querySelectorAll(".ni").forEach(function(item){item.onclick=function(){loadPage(this.dataset.page);};});
G("MT").onclick=function(){G("SB").classList.toggle("open");};
document.addEventListener("click",function(e){var sb=G("SB");if(sb&&sb.classList.contains("open")&&!sb.contains(e.target)&&e.target!==G("MT"))sb.classList.remove("open");});
G("RB").onclick=loadCur;
G("LGOUT").onclick=logout;
G("PP").onclick=function(){if(cPg>1)loadCmts(cPg-1);};
G("NP").onclick=function(){if(lastC>=PL)loadCmts(cPg+1);};
G("RC").onclick=function(){loadCmts(cPg);};
G("CS").addEventListener("keydown",function(e){if(e.key==="Enter"){cPg=1;loadCmts(1);}});
G("SF").onchange=function(){cPg=1;loadCmts(1);};
G("RTL").onclick=loadTL;
G("RAL").onclick=loadAL;
G("CPB").onclick=async function(){var c=G("CP"),n=G("NP"),cx=G("CPX");if(!c.value||!n.value){toast2("Fill all fields","error");return;}if(n.value!==cx.value){toast2("Passwords do not match","error");return;}try{await api("/change-password",{method:"POST",body:JSON.stringify({currentPassword:c.value,newPassword:n.value})});toast2("Password updated!","success");c.value=n.value=cx.value="";}catch(e){toast2(e.message,"error");};};
G("CAB").onclick=function(){showMod("Clear all data?","<p style=\"color:var(--dg)\">Delete ALL data. Cannot be undone.</p>",[{label:"Cancel",fn:closeMod},{label:"Yes, clear all",cls:"bd2",fn:async function(){closeMod();try{await api("/clear-all",{method:"DELETE"});toast2("All data cleared","success");loadOV();}catch(e){toast2(e.message,"error");}}}]);};
G("TG").onclick=function(){var cur=document.documentElement.getAttribute("data-theme")||"dark";var next=cur==="dark"?"light":"dark";applyTheme(next);localStorage.setItem(TH,next);};
G("FBS").addEventListener("click",function(e){var btn=e.target.closest(".fb[data-p]");if(!btn)return;document.querySelectorAll(".fb").forEach(function(b){b.classList.remove("active");});btn.classList.add("active");presetRng(btn.dataset.p);});
G("AFC").onclick=function(){var f=G("FF"),t=G("FT");if(!f.value)return;document.querySelectorAll(".fb").forEach(function(b){b.classList.remove("active");});setRng(f.value,t.value||f.value);};
applyTheme(localStorage.getItem(TH)||"dark");
var saved=localStorage.getItem(TK);
if(saved){token=saved;showApp();}else{G("LV").classList.remove("hidden");}
})();
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){});});
</script></body></html>`;

const SW = "var C='fwt-v259g';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))));self.clients.claim();});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;var u=new URL(e.request.url);if(u.pathname==='/'||u.pathname.endsWith('.html'))return;e.respondWith(fetch(e.request));});";
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization"};
function jR(o,s){return new Response(JSON.stringify(o),{status:s||200,headers:Object.assign({"Content-Type":"application/json;charset=UTF-8"},CORS)});}
async function proxy(req,path,env){
  const h={};
  const a=req.headers.get("Authorization");if(a)h["Authorization"]=a;
  const ct=req.headers.get("Content-Type");if(ct)h["Content-Type"]=ct;
  let body;
  if(!["GET","HEAD"].includes(req.method)){try{body=await req.arrayBuffer();}catch(e){return jR({success:false,message:"Bad body"},400);}}
  try{
    let r;
    if(env&&env.BACKEND&&typeof env.BACKEND.fetch==="function"){r=await env.BACKEND.fetch("https://internal"+path,{method:req.method,headers:h,body});}else{r=await fetch(BE+path,{method:req.method,headers:h,body});}
    const raw=await r.text();let p=null;try{p=raw?JSON.parse(raw):null;}catch(e){}
    if(p!==null)return jR(p,r.status);
    return new Response(raw,{status:r.status,headers:Object.assign({"Content-Type":r.headers.get("Content-Type")||"text/plain"},CORS)});
  }catch(e){return jR({success:false,message:"Backend error: "+(e&&e.message||String(e))},502);}
}
async function handleReq(req,env){
  const url=new URL(req.url);
  if(req.method==="OPTIONS")return new Response(null,{headers:CORS});
  if(url.pathname==="/sw.js")return new Response(SW,{headers:{"content-type":"text/javascript","cache-control":"no-store"}});
  if(url.pathname==="/manifest.webmanifest")return new Response(JSON.stringify({name:"FastWebTools Admin",short_name:"FWT Admin",start_url:"/",scope:"/",display:"standalone",background_color:"#0f0c29",theme_color:"#7c6bff"}),{headers:{"content-type":"application/manifest+json"}});
  if(url.pathname==="/api/login")return proxy(req,"/admin/login"+url.search,env);
  if(url.pathname.startsWith("/api/"))return proxy(req,url.pathname.replace(/^\/api/,"/admin")+url.search,env);
  return new Response(H,{headers:{"Content-Type":"text/html;charset=UTF-8","Cache-Control":"no-store,no-cache,must-revalidate","Pragma":"no-cache"}});
}
export default{
  async fetch(req,env,ctx){
    try{return await handleReq(req,env);}catch(err){
      if(new URL(req.url).pathname.startsWith("/api/"))return jR({success:false,message:"Error: "+(err&&err.message||String(err))},500);
      return new Response("Error",{status:500});
    }
  }
};
