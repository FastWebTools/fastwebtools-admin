const BE="https://fastwebtools-admin.formyworkupwork.workers.dev";
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization"};
const SW="var C='fwt-v259e';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))));self.clients.claim();});self.addEventListener('fetch',e=>{});";

const HTML=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>FastWebTools Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,-apple-system,sans-serif;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:#f2f1fb;min-height:100vh}
.hidden{display:none!important}
.lv{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.lc{background:rgba(255,255,255,.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:36px 30px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.lc h1{font-size:24px;font-weight:700;text-align:center;margin-bottom:6px;letter-spacing:-.02em}
.sub{text-align:center;color:#8a86ab;font-size:13px;margin-bottom:26px}
.field{margin-bottom:14px}
.field label{display:block;font-size:11px;font-weight:600;color:#8a86ab;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em}
.iw{display:flex;align-items:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:0 14px}
.iw:focus-within{border-color:#7c6bff}
.iw input{border:none;padding:12px 4px;flex:1;background:transparent;color:#f2f1fb;font-size:14px;outline:none;min-width:0}
.iw button{background:none;border:none;color:#8a86ab;cursor:pointer;padding:8px;font-size:15px}
.iw button:hover{color:#f2f1fb}
.lerr{background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3);color:#ff6b6b;padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:14px;display:none;gap:10px;align-items:center}
.lerr.show{display:flex}
.lr{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:18px;color:#8a86ab}
.lr label{display:flex;align-items:center;gap:6px;cursor:pointer}
.lr a{color:#7c6bff;cursor:pointer;text-decoration:none}
.btn{width:100%;padding:13px;border:none;border-radius:10px;font-size:14px;font-weight:600;background:linear-gradient(135deg,#7c6bff,#00d4b1);color:#0f0c29;cursor:pointer;transition:all .15s}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(124,107,255,.35)}
.btn:disabled{opacity:.6;cursor:wait}
.lfoot{text-align:center;font-size:11px;color:#8a86ab;margin-top:16px}
.app{display:flex;min-height:100vh;background:#0f0c29}
.sb{width:220px;background:rgba(255,255,255,.03);border-right:1px solid rgba(255,255,255,.08);padding:20px 14px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0}
.brand{font-size:16px;font-weight:700;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:14px}
.ni{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;color:#8a86ab;cursor:pointer;font-size:14px;font-weight:500;margin-bottom:2px}
.ni:hover{background:rgba(255,255,255,.05);color:#f2f1fb}
.ni.active{background:rgba(124,107,255,.15);color:#7c6bff}
.ni i{width:18px}
.sbot{margin-top:auto;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)}
.bg2{padding:8px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#f2f1fb;cursor:pointer;font-size:13px}
.bg2:hover{background:rgba(255,255,255,.08)}
.mw{flex:1;min-width:0}
.tb{display:flex;align-items:center;gap:14px;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);position:sticky;top:0;z-index:10}
.tb .title{font-weight:600;font-size:17px}
.tba{margin-left:auto;display:flex;gap:8px}
.ib{background:none;border:none;color:#8a86ab;font-size:15px;cursor:pointer;padding:8px;border-radius:8px}
.ib:hover{background:rgba(255,255,255,.06);color:#f2f1fb}
.cnt{padding:22px;max-width:1400px;margin:0 auto}
.pg{display:none}
.pg.active{display:block}
.ph{margin-bottom:18px}
.ph h2{font-size:20px;font-weight:700}
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:20px}
.sc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px}
.sc .val{font-size:26px;font-weight:700}
.sc .lbl2{color:#8a86ab;font-size:12px;margin-top:4px}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:18px;margin-bottom:16px}
.card h3{font-size:14px;font-weight:600;margin-bottom:12px}
.ts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:10px;z-index:200;max-width:340px}
.toast{padding:12px 16px;border-radius:12px;background:#191634;border:1px solid rgba(255,255,255,.08);font-size:13px;color:#f2f1fb;animation:su .25s ease}
.toast.success{border-color:rgba(0,212,177,.4)}
.toast.error{border-color:rgba(255,107,107,.4)}
@keyframes su{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){.sb{position:fixed;left:-240px;transition:left .2s;z-index:100}.sb.open{left:0}}
</style>
</head>
<body>

<div id="LV" class="lv">
<div class="lc">
<h1>FastWebTools</h1>
<p class="sub">Admin control center</p>
<div id="LE" class="lerr"><i class="fa-solid fa-triangle-exclamation"></i><span id="LES">Invalid credentials</span></div>
<div class="field"><label>Username</label><div class="iw"><input type="text" id="UN" placeholder="Enter username" autocomplete="username" autocapitalize="none" spellcheck="false"></div></div>
<div class="field"><label>Password</label><div class="iw"><input type="password" id="PW" placeholder="Enter password" autocomplete="current-password"><button type="button" id="TP" title="Show password"><i class="fa-regular fa-eye" id="EI"></i></button></div></div>
<div class="lr"><label><input type="checkbox" id="REM"> Remember me</label></div>
<button class="btn" id="LB" type="button">Sign in</button>
<div class="lfoot">&copy; 2026 FastWebTools v2.5.9</div>
</div>
</div>

<div id="AV" class="app hidden">
<aside class="sb" id="SB">
<div class="brand">FastWebTools</div>
<nav>
<div class="ni active" data-page="overview"><i class="fa-solid fa-gauge-high"></i> Overview</div>
<div class="ni" data-page="comments"><i class="fa-solid fa-comments"></i> Comments</div>
<div class="ni" data-page="tool-likes"><i class="fa-solid fa-thumbs-up"></i> Tool Likes</div>
<div class="ni" data-page="article-likes"><i class="fa-solid fa-heart"></i> Article Likes</div>
<div class="ni" data-page="settings"><i class="fa-solid fa-gear"></i> Settings</div>
</nav>
<div class="sbot">
<button class="bg2" style="width:100%" id="LGOUT"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
</div>
</aside>
<div class="mw">
<header class="tb">
<button class="ib" id="MT"><i class="fa-solid fa-bars"></i></button>
<span class="title" id="PT">Overview</span>
<div class="tba"><button class="ib" id="RB" title="Refresh"><i class="fa-solid fa-rotate"></i></button></div>
</header>
<div class="cnt">

<div class="pg active" id="pg-overview">
<div class="ph"><h2>Overview</h2></div>
<div class="sg" id="STG"></div>
<div class="card"><h3>Top Tools</h3><div id="TUL"></div></div>
<div class="card"><h3>Top Articles</h3><div id="AVL"></div></div>
</div>

<div class="pg" id="pg-comments"><div class="ph"><h2>Comments</h2></div><div class="card" id="CL">Loading...</div></div>
<div class="pg" id="pg-tool-likes"><div class="ph"><h2>Tool Likes</h2></div><div class="card" id="TLL">Loading...</div></div>
<div class="pg" id="pg-article-likes"><div class="ph"><h2>Article Likes</h2></div><div class="card" id="ALL2">Loading...</div></div>
<div class="pg" id="pg-settings"><div class="ph"><h2>Settings</h2></div><div class="card"><h3>Change Password</h3><div class="field"><label>Current</label><div class="iw"><input type="password" id="CP"></div></div><div class="field"><label>New</label><div class="iw"><input type="password" id="NP2"></div></div><div class="field"><label>Confirm</label><div class="iw"><input type="password" id="CPX"></div></div><button class="btn" style="width:auto;padding:10px 24px" id="CPB">Update Password</button></div></div>

</div>
</div>
</div>

<div class="ts" id="TS"></div>

<script>
(function(){
"use strict";
var API="/api";
var TK="fwt_token";
var token=null;
var curP="overview";

function G(id){return document.getElementById(id);}

function esc(s){var d=document.createElement("div");d.textContent=String(s==null?"":s);return d.innerHTML;}

function fmt(n){n=Number(n)||0;return n>=1000?(n/1000).toFixed(1)+"k":String(n);}

function toast(msg,type){
  type=type||"info";
  var el=document.createElement("div");
  el.className="toast "+type;
  el.textContent=msg;
  var ts=G("TS");
  ts.appendChild(el);
  setTimeout(function(){el.style.opacity="0";setTimeout(function(){el.remove();},300);},4000);
}

function showLogin(){G("AV").classList.add("hidden");G("LV").classList.remove("hidden");}
function showApp(){G("LV").classList.add("hidden");G("AV").classList.remove("hidden");loadPage("overview");}

function logout(){token=null;try{localStorage.removeItem(TK);}catch(e){}showLogin();}

function apiCall(path,opts){
  opts=opts||{};
  var h={"Content-Type":"application/json"};
  if(token)h["Authorization"]="Bearer "+token;
  return fetch(API+path,{method:opts.method||"GET",headers:h,body:opts.body}).then(function(r){
    if(r.status===401){logout();throw new Error("Session expired");}
    return r.text().then(function(raw){
      var d;try{d=raw?JSON.parse(raw):{};}catch(e){throw new Error("Bad response");}
      if(!r.ok||d.success===false)throw new Error(d.message||d.error||("Error "+r.status));
      return d;
    });
  });
}

// LOGIN
function doLogin(){
  var u=G("UN").value.trim();
  var p=G("PW").value;
  var btn=G("LB");
  var le=G("LE");
  var les=G("LES");
  le.classList.remove("show");
  if(!u||!p){les.textContent="Enter username and password";le.classList.add("show");return;}
  btn.disabled=true;
  btn.textContent="Signing in...";
  fetch(API+"/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,password:p})}).then(function(r){
    return r.text().then(function(raw){
      var d;try{d=raw?JSON.parse(raw):{};}catch(e){throw new Error("Bad response from server");}
      if(!r.ok||!d.success||!d.token){throw new Error(d.message||d.error||("Login failed ("+r.status+")"));}
      token=d.token;
      try{if(G("REM").checked)localStorage.setItem(TK,token);}catch(e){}
      toast("Welcome back!","success");
      showApp();
    });
  }).catch(function(e){
    les.textContent=e.message||"Network error";
    le.classList.add("show");
  }).then(function(){
    btn.disabled=false;
    btn.textContent="Sign in";
  });
}

// PAGE NAV
function loadPage(name){
  curP=name;
  var pgs=document.querySelectorAll(".pg");
  for(var i=0;i<pgs.length;i++)pgs[i].classList.remove("active");
  var pg=G("pg-"+name);
  if(pg)pg.classList.add("active");
  var nis=document.querySelectorAll(".ni");
  for(var j=0;j<nis.length;j++){nis[j].classList.toggle("active",nis[j].getAttribute("data-page")===name);}
  G("PT").textContent=name.charAt(0).toUpperCase()+name.slice(1).replace(/-/g," ");
  G("SB").classList.remove("open");
  if(name==="overview")loadOverview();
  else if(name==="comments")loadComments();
  else if(name==="tool-likes")loadToolLikes();
  else if(name==="article-likes")loadArticleLikes();
}

function loadOverview(){
  apiCall("/stats").then(function(s){
    var st=s.stats||s;
    var cards=[["totalVisits","Total Visits"],["uniqueVisitors","Unique Visitors"],["toolUses","Tool Uses"],["comments","Comments"],["toolLikes","Tool Likes"],["articleLikes","Article Likes"]];
    var h="";
    for(var i=0;i<cards.length;i++){var k=cards[i][0];var l=cards[i][1];h+='<div class="sc"><div class="val">'+fmt(st[k]||0)+'</div><div class="lbl2">'+l+'</div></div>';}
    G("STG").innerHTML=h;
  }).catch(function(e){toast("Stats: "+e.message,"error");});
  apiCall("/popular-tools?limit=10").then(function(d){
    var tls=d.tools||d.data||d;if(!Array.isArray(tls))tls=[];
    var mx=tls[0]?(tls[0].count||tls[0].uses||1):1;
    var h="";
    for(var i=0;i<tls.length;i++){var t=tls[i];var n=t.toolName||t.name||"Unknown";var c=t.count||t.uses||0;h+='<div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px"><span style="width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(n)+'</span><span style="flex:1;height:16px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden"><span style="display:block;height:100%;width:'+Math.round(c/mx*100)+'%;background:linear-gradient(90deg,#7c6bff,#00d4b1)"></span></span><span style="width:44px;text-align:right;font-weight:700">'+fmt(c)+'</span></div>';}
    G("TUL").innerHTML=h||'<div style="color:#8a86ab">No data</div>';
  }).catch(function(e){G("TUL").innerHTML='<div style="color:#ff6b6b">'+esc(e.message)+'</div>';});
  apiCall("/popular-articles?limit=10").then(function(d){
    var arts=d.articles||d.data||d;if(!Array.isArray(arts))arts=[];
    var mx=arts[0]?(arts[0].count||arts[0].views||1):1;
    var h="";
    for(var i=0;i<arts.length;i++){var a=arts[i];var s=a.slug||a.articleSlug||"";var c=a.count||a.views||0;h+='<div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px"><a href="https://www.fastwebtools.online/blog/'+encodeURIComponent(s)+'" target="_blank" style="width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f2f1fb;text-decoration:none">'+esc(s)+'</a><span style="flex:1;height:16px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden"><span style="display:block;height:100%;width:'+Math.round(c/mx*100)+'%;background:linear-gradient(90deg,#7c6bff,#00d4b1)"></span></span><span style="width:44px;text-align:right;font-weight:700">'+fmt(c)+'</span></div>';}
    G("AVL").innerHTML=h||'<div style="color:#8a86ab">No data</div>';
  }).catch(function(e){G("AVL").innerHTML='<div style="color:#ff6b6b">'+esc(e.message)+'</div>';});
}

function loadComments(){
  G("CL").innerHTML="Loading...";
  apiCall("/comments?limit=30").then(function(d){
    var cmts=d.comments||d.data||d;if(!Array.isArray(cmts))cmts=[];
    if(!cmts.length){G("CL").innerHTML='<div style="color:#8a86ab">No comments</div>';return;}
    var h="";
    for(var i=0;i<cmts.length;i++){var c=cmts[i];h+='<div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><div style="display:flex;gap:10px;align-items:center;margin-bottom:6px"><b>'+esc(c.username||c.user||"Anonymous")+'</b><span style="color:#8a86ab;font-size:12px">'+esc(c.articleSlug||c.slug||"")+'</span></div><div style="font-size:13px;white-space:pre-wrap">'+esc(c.content||c.text||"")+'</div><div style="margin-top:8px;display:flex;gap:6px"><button class="bg2" onclick="window.__apv('+c.id+',&quot;published&quot;)">Approve</button><button class="bg2" onclick="window.__apv('+c.id+',&quot;spam&quot;)">Spam</button><button class="bg2" style="color:#ff6b6b" onclick="window.__del('+c.id+')">Delete</button></div></div>';}
    G("CL").innerHTML=h;
  }).catch(function(e){G("CL").innerHTML='<div style="color:#ff6b6b">'+esc(e.message)+'</div>';});
}

window.__apv=function(id,s){apiCall("/comment/"+id,{method:"PUT",body:JSON.stringify({status:s})}).then(function(){toast("Updated","success");loadComments();}).catch(function(e){toast(e.message,"error");});};
window.__del=function(id){if(!confirm("Delete this comment?"))return;apiCall("/comment/"+id,{method:"DELETE"}).then(function(){toast("Deleted","success");loadComments();}).catch(function(e){toast(e.message,"error");});};

function loadToolLikes(){
  G("TLL").innerHTML="Loading...";
  apiCall("/tool-likes?limit=100").then(function(d){
    var lks=d.likes||d.data||d;if(!Array.isArray(lks))lks=[];
    if(!lks.length){G("TLL").innerHTML='<div style="color:#8a86ab">No data</div>';return;}
    var mx=lks[0].count||lks[0].likes||1;
    var h="";
    for(var i=0;i<lks.length;i++){var t=lks[i];var n=t.toolName||t.name||"Unknown";var c=t.count||t.likes||0;h+='<div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px"><span style="width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(n)+'</span><span style="flex:1;height:16px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden"><span style="display:block;height:100%;width:'+Math.round(c/mx*100)+'%;background:linear-gradient(90deg,#7c6bff,#00d4b1)"></span></span><span style="width:44px;text-align:right;font-weight:700">'+fmt(c)+'</span></div>';}
    G("TLL").innerHTML=h;
  }).catch(function(e){G("TLL").innerHTML='<div style="color:#ff6b6b">'+esc(e.message)+'</div>';});
}

function loadArticleLikes(){
  G("ALL2").innerHTML="Loading...";
  apiCall("/article-likes?limit=100").then(function(d){
    var lks=d.likes||d.data||d;if(!Array.isArray(lks))lks=[];
    if(!lks.length){G("ALL2").innerHTML='<div style="color:#8a86ab">No data</div>';return;}
    var mx=lks[0].count||lks[0].likes||1;
    var h="";
    for(var i=0;i<lks.length;i++){var a=lks[i];var s=a.slug||a.articleSlug||"Unknown";var c=a.count||a.likes||0;h+='<div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px"><a href="https://www.fastwebtools.online/blog/'+encodeURIComponent(s)+'" target="_blank" style="width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f2f1fb;text-decoration:none">'+esc(s)+'</a><span style="flex:1;height:16px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden"><span style="display:block;height:100%;width:'+Math.round(c/mx*100)+'%;background:linear-gradient(90deg,#7c6bff,#00d4b1)"></span></span><span style="width:44px;text-align:right;font-weight:700">'+fmt(c)+'</span></div>';}
    G("ALL2").innerHTML=h;
  }).catch(function(e){G("ALL2").innerHTML='<div style="color:#ff6b6b">'+esc(e.message)+'</div>';});
}

// WIRE UP EVENTS
G("LB").addEventListener("click",doLogin);
G("UN").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();G("PW").focus();}});
G("PW").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();doLogin();}});

// EYE TOGGLE
G("TP").addEventListener("click",function(){
  var pw=G("PW");
  var ei=G("EI");
  if(pw.type==="password"){pw.type="text";ei.className="fa-regular fa-eye-slash";}
  else{pw.type="password";ei.className="fa-regular fa-eye";}
});

// NAV
var nis=document.querySelectorAll(".ni");
for(var i=0;i<nis.length;i++){(function(el){el.addEventListener("click",function(){loadPage(el.getAttribute("data-page"));});})(nis[i]);}

G("MT").addEventListener("click",function(){G("SB").classList.toggle("open");});
G("RB").addEventListener("click",function(){loadPage(curP);});
G("LGOUT").addEventListener("click",logout);

G("CPB").addEventListener("click",function(){
  var c=G("CP").value,n=G("NP2").value,x=G("CPX").value;
  if(!c||!n){toast("Fill all fields","error");return;}
  if(n!==x){toast("Passwords do not match","error");return;}
  apiCall("/change-password",{method:"POST",body:JSON.stringify({currentPassword:c,newPassword:n})}).then(function(){toast("Password updated","success");G("CP").value="";G("NP2").value="";G("CPX").value="";}).catch(function(e){toast(e.message,"error");});
});

// INIT
try{var saved=localStorage.getItem(TK);if(saved){token=saved;showApp();}else{showLogin();}}catch(e){showLogin();}

})();
</script>
</body>
</html>`;

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
      if(url.pathname==="/api/login")return proxy(req,"/admin/login"+url.search,env);
      if(url.pathname.startsWith("/api/"))return proxy(req,url.pathname.replace(/^\/api/,"/admin")+url.search,env);
      return new Response(HTML,{headers:{"Content-Type":"text/html;charset=UTF-8","Cache-Control":"no-store,no-cache,must-revalidate"}});
    }catch(err){
      return new Response("Server error: "+(err&&err.message||String(err)),{status:500});
    }
  }
};
