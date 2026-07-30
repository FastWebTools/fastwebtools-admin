export default `(function(){
'use strict';
var API='/api',TK='fwt_token',TH='fwt_theme',PL=20;
var SITE='https://www.fastwebtools.online';
var token=null,curP='overview',cPg=1,cAll=[],liveT=null,arT=null,rng=null,chartInst=null;

function G(id){return document.getElementById(id);}
function esc(s){var d=document.createElement('div');d.textContent=String(s==null?'':s);return d.innerHTML;}
function fmt(n){n=Number(n)||0;if(n>=1000000)return (n/1000000).toFixed(1)+'M';if(n>=1000)return (n/1000).toFixed(1)+'k';return String(n);}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function isDigitsOnly(s){s=String(s);if(!s.length)return false;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c<48||c>57)return false;}return true;}
function fdt(v){
  if(v==null||v==='')return '-';
  var d;
  if(typeof v==='number'){d=new Date(v>9999999999?v:v*1000);}
  else if(typeof v==='string'&&isDigitsOnly(v)){var n=Number(v);d=new Date(n>9999999999?n:n*1000);}
  else{d=new Date(v);}
  if(!d||isNaN(d.getTime()))return '-';
  var mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var h=d.getHours(),ap=h>=12?'PM':'AM',h12=h%12||12;
  return mo[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()+' '+h12+':'+String(d.getMinutes()).padStart(2,'0')+' '+ap;
}
function fdtMs(v){
  if(v==null||v==='')return 0;
  if(typeof v==='number')return v>9999999999?v:v*1000;
  if(typeof v==='string'){if(isDigitsOnly(v)){var n=Number(v);return n>9999999999?n:n*1000;}var t=new Date(v).getTime();return isNaN(t)?0:t;}
  return 0;
}

// Extract clean slug from any URL/path/name
function slugFrom(u){
  if(!u)return '';
  var s=String(u);
  var q=s.indexOf('?');if(q>=0)s=s.substring(0,q);
  var h2=s.indexOf('#');if(h2>=0)s=s.substring(0,h2);
  var parts=s.split('/');
  var last='';
  for(var i=parts.length-1;i>=0;i--){if(parts[i]){last=parts[i];break;}}
  if(!last)return '';
  var lo=last.toLowerCase();
  if(lo.substring(lo.length-5)==='.html')last=last.substring(0,last.length-5);
  else if(lo.substring(lo.length-4)==='.htm')last=last.substring(0,last.length-4);
  try{last=decodeURIComponent(last);}catch(e){}
  return last;
}
function artTitle(u){
  var last=slugFrom(u);
  if(!last)return '(unknown)';
  last=last.split('-').join(' ').split('_').join(' ');
  var out='',up=true;
  for(var i=0;i<last.length;i++){var c=last.charAt(i);if(c===' '){up=true;out+=c;}else if(up){out+=c.toUpperCase();up=false;}else{out+=c;}}
  return out.trim()||String(u);
}
// Article URL - always /blog/<slug>
function artUrl(u){
  var sl=slugFrom(u);
  if(!sl)return SITE+'/';
  return SITE+'/blog/'+sl;
}
// Tool URL - /<slug> (tool slugs are already lowercase-hyphen)
function toolUrl(name){
  if(!name)return SITE+'/';
  var s=String(name).trim();
  if(s.substring(0,7)==='http://'||s.substring(0,8)==='https://')return s;
  var slug=s.toLowerCase().split(' ').join('-');
  while(slug.charAt(0)==='/')slug=slug.substring(1);
  return SITE+'/'+slug;
}

function toast(msg,type){type=type||'info';var ic={success:'fa-circle-check',error:'fa-circle-exclamation',info:'fa-circle-info'};var el=document.createElement('div');el.className='toast '+type;el.innerHTML='<i class="fa-solid '+ic[type]+'"></i><span></span>';el.querySelector('span').textContent=msg;G('TS').appendChild(el);setTimeout(function(){el.style.opacity='0';setTimeout(function(){el.remove();},300);},4200);}
function showMod(title,body,btns){G('MTT').textContent=title;G('MB').innerHTML=body;var mf=G('MF');mf.innerHTML='';(btns||[]).forEach(function(b){var btn=document.createElement('button');btn.className=b.cls||'bg2';btn.textContent=b.label;btn.onclick=b.fn;mf.appendChild(btn);});G('MO').classList.add('show');}
function closeMod(){G('MO').classList.remove('show');}
function showLogin(){G('AV').classList.add('hidden');G('LV').classList.remove('hidden');if(liveT){clearInterval(liveT);liveT=null;}if(arT){clearInterval(arT);arT=null;}}
function showApp(){G('LV').classList.add('hidden');G('AV').classList.remove('hidden');loadPage('overview');startLive();startAR();}
function logout(){token=null;try{localStorage.removeItem(TK);}catch(e){}showLogin();}

function apiCall(path,opts){opts=opts||{};var h={'Content-Type':'application/json'};if(token)h['Authorization']='Bearer '+token;return fetch(API+path,{method:opts.method||'GET',headers:h,body:opts.body}).then(function(r){if(r.status===401){logout();throw new Error('Session expired');}return r.text().then(function(raw){var d;try{d=raw?JSON.parse(raw):{};}catch(e){throw new Error('Bad response from server');}if(!r.ok||d.success===false)throw new Error(d.message||d.error||('HTTP '+r.status));return d;});});}

function wr(path){if(!rng)return path;var sep=path.indexOf('?')===-1?'?':'&';return path+sep+'from='+rng.from+'&to='+rng.to;}
function setRng(from,to){rng=from?{from:from,to:to||from}:null;var fl=G('FL');if(fl)fl.textContent=rng?('Showing: '+rng.from+(rng.from!==rng.to?' to '+rng.to:'')):'All time';if(curP==='overview')loadOverview();}
function presetRng(p){var now=new Date(),to=ymd(now),from;if(p==='all'){setRng(null);return;}if(p==='today'){from=ymd(now);}else if(p==='yesterday'){var y=new Date(now.getTime()-86400000);from=to=ymd(y);}else if(p==='7d'){from=ymd(new Date(now.getTime()-6*86400000));}else if(p==='30d'){from=ymd(new Date(now.getTime()-29*86400000));}else if(p==='month'){from=ymd(new Date(now.getFullYear(),now.getMonth(),1));}setRng(from,to);}

function doLogin(){var u=G('UN').value.trim();var p=G('PW').value;var btn=G('LB');var le=G('LE'),les=G('LES');le.classList.remove('show');if(!u||!p){les.textContent='Please enter username and password';le.classList.add('show');return;}btn.disabled=true;btn.textContent='Signing in...';fetch(API+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})}).then(function(r){return r.text().then(function(raw){var d;try{d=raw?JSON.parse(raw):{};}catch(e){throw new Error('Bad response from server');}if(!r.ok||!d.success||!d.token){throw new Error(d.message||d.error||('Login failed ('+r.status+')'));}token=d.token;try{if(G('REM').checked)localStorage.setItem(TK,token);}catch(e){}toast('Welcome back!','success');showApp();});}).catch(function(e){les.textContent=e.message||'Network error. Try again.';le.classList.add('show');}).then(function(){btn.disabled=false;btn.textContent='Sign in';});}

function loadPage(name){curP=name;var pgs=document.querySelectorAll('.pg');for(var i=0;i<pgs.length;i++)pgs[i].classList.remove('active');var pg=G('pg-'+name);if(pg)pg.classList.add('active');var nis=document.querySelectorAll('.ni');for(var j=0;j<nis.length;j++)nis[j].classList.toggle('active',nis[j].getAttribute('data-page')===name);G('PT').textContent=name.charAt(0).toUpperCase()+name.slice(1).split('-').join(' ');G('SB').classList.remove('open');if(name==='overview')loadOverview();else if(name==='comments')loadComments(1);else if(name==='tool-likes')loadToolLikes();else if(name==='article-likes')loadArticleLikes();}
function refreshCur(){if(curP==='overview')loadOverview();else if(curP==='comments')loadComments(cPg);else if(curP==='tool-likes')loadToolLikes();else if(curP==='article-likes')loadArticleLikes();}
function startLive(){if(liveT)clearInterval(liveT);pollLive();liveT=setInterval(pollLive,5000);}
function pollLive(){apiCall('/visitors/realtime').then(function(d){var el=G('LC');if(el)el.textContent=fmt(d.live||0);}).catch(function(){});}
function startAR(){if(arT)clearInterval(arT);arT=setInterval(function(){var ar=G('AR');if(ar&&ar.checked)refreshCur();},20000);}

function setVABtn(navKey,count){
  var btn=document.querySelector('[data-nav="'+navKey+'"]');
  if(btn)btn.innerHTML='View all ('+count+') <i class="fa-solid fa-arrow-right"></i>';
}

function loadOverview(){
  G('STG').innerHTML='<div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i> Loading stats...</div>';
  apiCall(wr('/stats')).then(function(s){
    var st=s.stats||{};
    var cards=[
      ['total_visits','Total Visits','fa-eye',''],
      ['unique_visitors','Unique Visitors','fa-users',''],
      ['total_tool_uses','Tool Uses','fa-wrench','tool-likes'],
      ['total_comments','Comments','fa-comments','comments'],
      ['total_tool_likes','Tool Likes','fa-thumbs-up','tool-likes'],
      ['total_article_likes','Article Likes','fa-heart','article-likes']
    ];
    var h='';
    for(var i=0;i<cards.length;i++){
      var c=cards[i];var v=Number(st[c[0]]||0);
      h+='<div class="sc" data-pg="'+c[3]+'" style="'+(c[3]?'cursor:pointer':'')+'"><div class="val">'+fmt(v)+'</div><div class="lbl2">'+c[1]+'</div><i class="fa-solid '+c[2]+' ic"></i></div>';
    }
    G('STG').innerHTML=h;
    var scs=document.querySelectorAll('.sc[data-pg]');
    for(var k=0;k<scs.length;k++){(function(el){var pg=el.getAttribute('data-pg');el.addEventListener('click',function(){if(pg)loadPage(pg);});})(scs[k]);}
  }).catch(function(e){G('STG').innerHTML='<div style="color:var(--dg);grid-column:1/-1;padding:14px"><i class="fa-solid fa-triangle-exclamation"></i> Stats: '+esc(e.message)+'</div>';});

  var daPath=rng?wr('/daily-activity'):'/daily-activity?days=30';
  apiCall(daPath).then(function(dd){
    var days=dd.activity||dd.days||[];
    var wrap=G('CHTW');if(!wrap)return;
    wrap.innerHTML='<canvas id="CHT"></canvas>';
    var ctx=G('CHT');
    if(chartInst){try{chartInst.destroy();}catch(e){}chartInst=null;}
    if(!ctx||typeof Chart==='undefined')return;
    if(!days.length){wrap.innerHTML='<div style="text-align:center;color:var(--dm);padding:80px 20px"><i class="fa-solid fa-chart-line" style="font-size:32px;margin-bottom:10px;display:block"></i>No activity data for selected range</div>';return;}
    var labels=[],data=[];
    for(var i=0;i<days.length;i++){labels.push(days[i].day||days[i].date||'');data.push(Number(days[i].visits||days[i].count||0));}
    try{
      chartInst=new Chart(ctx.getContext('2d'),{
        type:'line',
        data:{labels:labels,datasets:[{label:'Visits',data:data,borderColor:'#7c6bff',backgroundColor:'rgba(124,107,255,0.10)',fill:true,tension:0.4,pointBackgroundColor:'#7c6bff',pointRadius:3,pointHoverRadius:5,borderWidth:2}]},
        options:{
          responsive:true,maintainAspectRatio:false,
          interaction:{mode:'index',intersect:false},
          plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return ' '+c.parsed.y+' visits';}}}},
          scales:{
            x:{ticks:{color:'#8a86ab',maxTicksLimit:10,maxRotation:0},grid:{color:'rgba(255,255,255,0.04)'}},
            y:{ticks:{color:'#8a86ab'},grid:{color:'rgba(255,255,255,0.05)'},beginAtZero:true}
          }
        }
      });
    }catch(err){wrap.innerHTML='<div style="color:var(--dg);padding:20px">Chart render error: '+esc(err.message||String(err))+'</div>';}
  }).catch(function(e){var w=G('CHTW');if(w)w.innerHTML='<div style="color:var(--dg);padding:20px">Chart data error: '+esc(e.message)+'</div>';});

  G('TUL').innerHTML='<div style="padding:20px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  apiCall(wr('/popular-tools?limit=1000')).then(function(d){
    var allTls=d.tools||[];
    setVABtn('tool-likes',allTls.length);
    var tls=allTls.slice(0,10);
    if(!tls.length){G('TUL').innerHTML='<div style="color:var(--dm);padding:20px;text-align:center">No tool usage data</div>';return;}
    var mx=Number(tls[0].count||0)||1;var h='';
    for(var i=0;i<tls.length;i++){var t=tls[i];var n=t.name||t.tool_id||'Unknown';var uu=toolUrl(n);var c=Number(t.count||0);var p=Math.round(c/mx*100);h+='<div class="br"><span class="rnk">'+(i+1)+'</span><a class="bn" href="'+esc(uu)+'" target="_blank" rel="noopener" title="'+esc(n)+'">'+esc(n)+'</a><span class="bt"><span class="bf" style="width:'+p+'%"></span></span><span class="bv">'+fmt(c)+'</span></div>';}
    G('TUL').innerHTML=h;
  }).catch(function(e){G('TUL').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});

  G('AVL').innerHTML='<div style="padding:20px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  apiCall(wr('/popular-articles?limit=1000')).then(function(d){
    var allArts=d.articles||[];
    setVABtn('article-likes',allArts.length);
    var arts=allArts.slice(0,10);
    if(!arts.length){G('AVL').innerHTML='<div style="color:var(--dm);padding:20px;text-align:center">No article views yet</div>';return;}
    var mx=Number(arts[0].count||0)||1;var h='';
    for(var i=0;i<arts.length;i++){var a=arts[i];var raw=a.url||a.name||a.article_id||'';var t=artTitle(raw);var u=artUrl(raw);var c=Number(a.count||0);var p=Math.round(c/mx*100);h+='<div class="br"><span class="rnk">'+(i+1)+'</span><a class="bn" href="'+esc(u)+'" target="_blank" rel="noopener" title="'+esc(t)+'">'+esc(t)+'</a><span class="bt"><span class="bf" style="width:'+p+'%"></span></span><span class="bv">'+fmt(c)+'</span></div>';}
    G('AVL').innerHTML=h;
  }).catch(function(e){G('AVL').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});
}

function loadComments(page){cPg=page||1;G('CL').innerHTML='<div style="padding:28px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i> Loading comments...</div>';G('CSTAT').innerHTML='';apiCall('/comments').then(function(d){cAll=d.comments||[];renderCommentStats();renderComments();}).catch(function(e){G('CL').innerHTML='<div style="color:var(--dg);padding:14px"><i class="fa-solid fa-triangle-exclamation"></i> '+esc(e.message)+'</div>';});}

function renderCommentStats(){
  var arts={},pub=0,pend=0,spam=0;
  for(var i=0;i<cAll.length;i++){
    var c=cAll[i];
    var aid=c.article_id||'(none)';
    arts[aid]=(arts[aid]||0)+1;
    var s=c.status||'published';
    if(s==='published')pub++;else if(s==='pending')pend++;else if(s==='spam')spam++;
  }
  var artCount=0;for(var k in arts)if(arts.hasOwnProperty(k))artCount++;
  var h='<div class="cst"><div class="csi"><i class="fa-solid fa-comments" style="color:#7c6bff"></i><div><div class="csv">'+cAll.length+'</div><div class="csl">Total comments</div></div></div>';
  h+='<div class="csi"><i class="fa-solid fa-newspaper" style="color:#00d4b1"></i><div><div class="csv">'+artCount+'</div><div class="csl">Articles with comments</div></div></div>';
  h+='<div class="csi"><i class="fa-solid fa-check-circle" style="color:#00d4b1"></i><div><div class="csv">'+pub+'</div><div class="csl">Published</div></div></div>';
  h+='<div class="csi"><i class="fa-solid fa-clock" style="color:#ffb545"></i><div><div class="csv">'+pend+'</div><div class="csl">Pending</div></div></div>';
  h+='<div class="csi"><i class="fa-solid fa-ban" style="color:#ff6b6b"></i><div><div class="csv">'+spam+'</div><div class="csl">Spam</div></div></div>';
  h+='</div>';
  G('CSTAT').innerHTML=h;
}

function renderComments(){
  var sq=G('CS').value.trim().toLowerCase();
  var st=G('SF').value;
  var list=[];
  for(var i=0;i<cAll.length;i++){var c=cAll[i];var cs=c.status||'published';if(st&&st!=='all'&&cs!==st)continue;if(sq){var hay=((c.name||'')+' '+(c.comment||'')+' '+(c.article_id||'')).toLowerCase();if(hay.indexOf(sq)===-1)continue;}list.push(c);}
  var total=list.length;var pages=Math.max(1,Math.ceil(total/PL));
  if(cPg>pages)cPg=pages;if(cPg<1)cPg=1;
  var pageList=list.slice((cPg-1)*PL,cPg*PL);
  G('PI').textContent='Page '+cPg+' of '+pages+(total?' - '+total+' filtered':'');
  G('PP').disabled=cPg<=1;G('NPB').disabled=cPg>=pages;
  if(!pageList.length){G('CL').innerHTML='<div style="padding:40px;text-align:center;color:var(--dm)"><i class="fa-solid fa-comment-slash" style="font-size:28px;margin-bottom:10px;display:block"></i>No comments match your filters.</div>';return;}
  var grp={};var order=[];
  for(var j=0;j<pageList.length;j++){var c2=pageList[j];var k=c2.article_id||'(no-article)';if(!grp[k]){grp[k]={list:[],latest:0};order.push(k);}grp[k].list.push(c2);var dt=fdtMs(c2.created_at);if(dt>grp[k].latest)grp[k].latest=dt;}
  order.sort(function(a,b){return grp[b].latest-grp[a].latest;});
  var h='<div class="al">';
  for(var m=0;m<order.length;m++){
    var slug=order[m],g=grp[slug];
    var at2=artTitle(slug),au2=artUrl(slug);
    h+='<div class="ai'+(m===0?' open':'')+'"><div class="ah" data-toggle="1"><i class="fa-solid fa-chevron-right achev"></i><div class="atw"><a class="at" href="'+esc(au2)+'" target="_blank" rel="noopener">'+esc(at2)+'</a><div class="asub">Latest: '+fdt(g.latest)+' - '+g.list.length+' comment'+(g.list.length===1?'':'s')+'</div></div><span class="acnt">'+g.list.length+'</span></div><div class="abdy">';
    for(var l=0;l<g.list.length;l++){
      var c3=g.list[l];var init=String(c3.name||'?').charAt(0).toUpperCase();var stx=c3.status||'published';
      h+='<div class="cr"><div class="cav">'+esc(init)+'</div><div class="cm"><div class="chr2"><span class="cu">'+esc(c3.name||'Anonymous')+'</span><span class="sbd '+stx+'">'+stx+'</span><span class="cd">'+fdt(c3.created_at)+'</span></div><div class="ct">'+esc(c3.comment||'')+'</div><div class="ca"><button data-act="published" data-id="'+c3.id+'"><i class="fa-solid fa-check"></i> Approve</button><button data-act="pending" data-id="'+c3.id+'"><i class="fa-solid fa-clock"></i> Pending</button><button data-act="spam" data-id="'+c3.id+'"><i class="fa-solid fa-ban"></i> Spam</button><button class="danger" data-act="delete" data-id="'+c3.id+'"><i class="fa-solid fa-trash"></i> Delete</button></div></div></div>';
    }
    h+='</div></div>';
  }
  h+='</div>';
  G('CL').innerHTML=h;
}

document.addEventListener('click',function(e){
  if(!e.target.closest)return;
  var tog=e.target.closest('.ah[data-toggle]');
  if(tog&&!e.target.closest('a')){tog.parentElement.classList.toggle('open');return;}
  var b=e.target.closest('.ca button[data-act]');
  if(b){
    var act=b.getAttribute('data-act');var id=b.getAttribute('data-id');
    if(act==='delete'){showMod('Delete comment?','<p style="color:var(--dm)">This action cannot be undone.</p>',[{label:'Cancel',fn:closeMod},{label:'Delete',cls:'bd2',fn:function(){closeMod();apiCall('/comment/'+id,{method:'DELETE'}).then(function(){toast('Comment deleted','success');loadComments(cPg);}).catch(function(err){toast(err.message,'error');});}}]);}
    else{apiCall('/comment/'+id,{method:'PUT',body:JSON.stringify({status:act})}).then(function(){toast('Marked as '+act,'success');loadComments(cPg);}).catch(function(err){toast(err.message,'error');});}
  }
});

function loadToolLikes(){G('TLL').innerHTML='<div style="padding:28px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';apiCall('/tool-likes?limit=1000').then(function(d){var lks=d.tools||d.likes||[];if(!lks.length){G('TLL').innerHTML='<div style="padding:40px;text-align:center;color:var(--dm)"><i class="fa-solid fa-thumbs-up" style="font-size:28px;margin-bottom:10px;display:block"></i>No tool likes yet</div>';return;}var mx=Number(lks[0].count||0)||1;var h='';for(var i=0;i<lks.length;i++){var t=lks[i];var n=t.name||t.tool_id||'Unknown';var uu=toolUrl(n);var c=Number(t.count||0);h+='<div class="br"><span class="rnk">'+(i+1)+'</span><a class="bn" href="'+esc(uu)+'" target="_blank" rel="noopener" title="'+esc(n)+'">'+esc(n)+'</a><span class="bt"><span class="bf" style="width:'+Math.round(c/mx*100)+'%"></span></span><span class="bv">'+fmt(c)+'</span></div>';}G('TLL').innerHTML=h;}).catch(function(e){G('TLL').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});}

function loadArticleLikes(){G('ALL2').innerHTML='<div style="padding:28px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';apiCall('/article-likes?limit=1000').then(function(d){var lks=d.articles||d.likes||[];if(!lks.length){G('ALL2').innerHTML='<div style="padding:40px;text-align:center;color:var(--dm)"><i class="fa-solid fa-heart" style="font-size:28px;margin-bottom:10px;display:block"></i>No article likes yet</div>';return;}var mx=Number(lks[0].count||0)||1;var h='';for(var i=0;i<lks.length;i++){var a=lks[i];var raw=a.url||a.name||a.article_id||'';var t=artTitle(raw);var u=artUrl(raw);var c=Number(a.count||0);h+='<div class="br"><span class="rnk">'+(i+1)+'</span><a class="bn" href="'+esc(u)+'" target="_blank" rel="noopener" title="'+esc(t)+'">'+esc(t)+'</a><span class="bt"><span class="bf" style="width:'+Math.round(c/mx*100)+'%"></span></span><span class="bv">'+fmt(c)+'</span></div>';}G('ALL2').innerHTML=h;}).catch(function(e){G('ALL2').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});}

function applyTheme(t){document.documentElement.setAttribute('data-theme',t);var i=G('TG').querySelector('i');if(i)i.className=t==='dark'?'fa-solid fa-moon':'fa-solid fa-sun';}

G('LB').addEventListener('click',doLogin);
G('UN').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();G('PW').focus();}});
G('PW').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doLogin();}});
G('TP').addEventListener('click',function(){var pw=G('PW'),ei=G('EI');if(pw.type==='password'){pw.type='text';ei.className='fa-regular fa-eye-slash';}else{pw.type='password';ei.className='fa-regular fa-eye';}});
var nis=document.querySelectorAll('.ni');for(var ii=0;ii<nis.length;ii++){(function(el){el.addEventListener('click',function(){loadPage(el.getAttribute('data-page'));});})(nis[ii]);}
var navBtns=document.querySelectorAll('[data-nav]');for(var nn=0;nn<navBtns.length;nn++){(function(el){el.addEventListener('click',function(){loadPage(el.getAttribute('data-nav'));});})(navBtns[nn]);}
G('MT').addEventListener('click',function(e){e.stopPropagation();G('SB').classList.toggle('open');});
document.addEventListener('click',function(e){var sb=G('SB');if(sb&&sb.classList.contains('open')&&!sb.contains(e.target)&&e.target.id!=='MT')sb.classList.remove('open');});
G('RB').addEventListener('click',refreshCur);
G('TG').addEventListener('click',function(){var cur=document.documentElement.getAttribute('data-theme')||'dark';var next=cur==='dark'?'light':'dark';applyTheme(next);try{localStorage.setItem(TH,next);}catch(e){}});
G('LGOUT').addEventListener('click',logout);
G('PP').addEventListener('click',function(){if(cPg>1){cPg--;renderComments();}});
G('NPB').addEventListener('click',function(){cPg++;renderComments();});
G('RC').addEventListener('click',function(){loadComments(1);});
G('CS').addEventListener('input',function(){cPg=1;renderComments();});
G('SF').addEventListener('change',function(){cPg=1;renderComments();});
G('RTL').addEventListener('click',loadToolLikes);
G('RAL').addEventListener('click',loadArticleLikes);
G('CPB').addEventListener('click',function(){var c=G('CP').value,n=G('NP2').value,x=G('CPX').value;if(!c||!n){toast('Please fill all fields','error');return;}if(n!==x){toast('New passwords do not match','error');return;}if(n.length<6){toast('New password must be at least 6 characters','error');return;}apiCall('/change-password',{method:'POST',body:JSON.stringify({oldPassword:c,newPassword:n})}).then(function(){toast('Password updated successfully!','success');G('CP').value='';G('NP2').value='';G('CPX').value='';}).catch(function(e){toast(e.message,'error');});});
G('CAB').addEventListener('click',function(){showMod('Clear All Analytics Data','<p style="color:var(--dg);margin-bottom:8px"><strong>Warning: This cannot be undone.</strong></p><p style="color:var(--dm);font-size:13px">All visits, article views, tool usage, comments, and likes will be permanently deleted.</p>',[{label:'Cancel',fn:closeMod},{label:'Yes, clear all data',cls:'bd2',fn:function(){closeMod();apiCall('/clear-all',{method:'POST'}).then(function(){toast('All data cleared successfully','success');loadOverview();}).catch(function(e){toast(e.message,'error');});}}]);});
G('MC').addEventListener('click',closeMod);
G('MO').addEventListener('click',function(e){if(e.target===this)closeMod();});
G('FBS').addEventListener('click',function(e){var btn=e.target.closest?e.target.closest('.fb[data-p]'):null;if(!btn)return;var fbs=document.querySelectorAll('.fbs .fb');for(var i=0;i<fbs.length;i++)fbs[i].classList.remove('active');btn.classList.add('active');presetRng(btn.getAttribute('data-p'));});
G('AFC').addEventListener('click',function(){var f=G('FF').value,t=G('FT').value;if(!f){toast('Please select a start date','error');return;}var fbs=document.querySelectorAll('.fbs .fb');for(var i=0;i<fbs.length;i++)fbs[i].classList.remove('active');setRng(f,t||f);});

try{applyTheme(localStorage.getItem(TH)||'dark');}catch(e){applyTheme('dark');}
try{var saved=localStorage.getItem(TK);if(saved){token=saved;showApp();}else{showLogin();}}catch(e){showLogin();}

})();`;
