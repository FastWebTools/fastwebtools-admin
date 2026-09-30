export default `(function(){
'use strict';
var API='/api',TK='fwt_token',TH='fwt_theme',PL=20;
var SITE='https://www.fastwebtools.online';
var TOOLS_HUB=SITE+'/';
var token=null,curP='overview',cPg=1,cAll=[],reportsCache=[],liveT=null,arT=null,rng=null,chartInst=null,lastStats=null,lastUpdated=0,liveNow=0;
var tabTools='usage',tabArts='views';
var articleUrlMap={};

function G(id){return document.getElementById(id);}
function esc(s){var d=document.createElement('div');d.textContent=String(s==null?'':s);return d.innerHTML;}
function fmt(n){n=Number(n)||0;if(n>=1000000)return (n/1000000).toFixed(1)+'M';if(n>=1000)return (n/1000).toFixed(1)+'k';return String(n);}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function isDigitsOnly(s){s=String(s);if(!s.length)return false;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c<48||c>57)return false;}return true;}
function isNumericTimeText(s){if(!s)return false;var dot=false,digits=0;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c>=48&&c<=57){digits++;continue;}if(c===46&&!dot){dot=true;continue;}return false;}return digits>0;}
function fdtMs(v){if(v==null||v==='')return 0;if(typeof v==='number')return v>9999999999?v:v*1000;if(typeof v==='string'){var raw=v.trim();if(isNumericTimeText(raw)){var n=Number(raw);return isFinite(n)?(n>9999999999?n:n*1000):0;}var t=new Date(raw).getTime();return isNaN(t)?0:t;}return 0;}
function fdt(v){var ms=fdtMs(v);if(!ms)return '-';var d=new Date(ms);if(isNaN(d.getTime()))return '-';var mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];var h=d.getHours(),ap=h>=12?'PM':'AM',h12=h%12||12;return mo[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()+' · '+h12+':'+String(d.getMinutes()).padStart(2,'0')+' '+ap;}
function dayKey(ms){var d=new Date(ms);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function titleCase(s){var out='',up=true;for(var i=0;i<s.length;i++){var c=s.charAt(i);if(c===' '){up=true;out+=c;}else if(up){out+=c.toUpperCase();up=false;}else{out+=c;}}return out.trim();}

function normalizeSlug(s){
  if(s==null)return '';
  var t=String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  return t.replace(/^https?-/,'');
}
function populateUrlMap(items){
  if(!items||!items.length)return;
  for(var i=0;i<items.length;i++){
    var u=(items[i].url||items[i].name||'');
    if(u&&/^https?:\\/\\//i.test(u)){
      var k=normalizeSlug(u);
      if(k)articleUrlMap[k]=u;
    }
  }
}
function titleFromUrl(fullUrl){
  var idx=fullUrl.indexOf('/',8);
  var path=idx>0?fullUrl.substring(idx):'/';
  var parts=path.split('/'),last='';
  for(var i=parts.length-1;i>=0;i--){if(parts[i]){last=parts[i];break;}}
  last=last.replace(/\\.html?$/i,'');
  try{last=decodeURIComponent(last);}catch(e){}
  return titleCase(last.split('-').join(' ').split('_').join(' '))||'(unknown)';
}

function parseArticle(raw){
  var s=String(raw==null?'':raw).trim();
  if(!s)return {title:'(unknown)',url:SITE+'/'};
  if(/^https?:\\/\\//i.test(s)){return {title:titleFromUrl(s),url:s};}
  var key=normalizeSlug(s);
  if(key&&articleUrlMap[key]){var fu=articleUrlMap[key];return {title:titleFromUrl(fu),url:fu};}
  var isPath=(s.charAt(0)==='/')||/^\\d{4}\\//.test(s);
  var pathPart='';
  if(isPath){pathPart=(s.charAt(0)==='/')?s:'/'+s;}
  else{
    var stripped=s.replace(/^www[-.]?fastwebtools[-.]?online[-.]?/i,'').replace(/^https?[-.:]?/i,'');
    stripped=stripped.replace(/^[-\\/]+/,'');
    var m=stripped.match(/^(\\d{4})[-\\/](\\d{1,2})[-\\/]?(.+)$/);
    if(m){
      var slugPart=m[3].replace(/\\.html?$/i,'').replace(/-html?$/i,'');
      pathPart='/'+m[1]+'/'+String(m[2]).padStart(2,'0')+'/'+slugPart+'.html';
    } else {
      pathPart='/'+stripped.replace(/\\.html?$/i,'').replace(/-html?$/i,'');
    }
  }
  var finalUrl=SITE+pathPart;
  return {title:titleFromUrl(finalUrl),url:finalUrl};
}
function artTitle(u){return parseArticle(u).title;}
function artUrl(u){return parseArticle(u).url;}
function toolUrl(name){if(!name)return TOOLS_HUB;var s=String(name).trim();if(s.substring(0,7)==='http://'||s.substring(0,8)==='https://')return s;var slug=s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');return SITE+'/?tool='+encodeURIComponent(slug);}

function toast(msg,type){type=type||'info';var ic={success:'fa-circle-check',error:'fa-circle-exclamation',info:'fa-circle-info'};var el=document.createElement('div');el.className='toast '+type;el.innerHTML='<i class="fa-solid '+ic[type]+'"></i><span></span>';el.querySelector('span').textContent=msg;G('TS').appendChild(el);setTimeout(function(){el.style.opacity='0';setTimeout(function(){el.remove();},300);},4200);}
function showMod(title,body,btns){G('MTT').textContent=title;G('MB').innerHTML=body;var mf=G('MF');mf.innerHTML='';(btns||[]).forEach(function(b){var btn=document.createElement('button');btn.className=b.cls||'bg2';btn.textContent=b.label;btn.onclick=b.fn;mf.appendChild(btn);});G('MO').classList.add('show');}
function closeMod(){G('MO').classList.remove('show');}
function closeSb(){var sb=G('SB');if(sb)sb.classList.remove('open');var bd=G('SB_BD');if(bd)bd.classList.remove('show');}
function showLogin(){G('AV').classList.add('hidden');G('LV').classList.remove('hidden');if(liveT){clearInterval(liveT);liveT=null;}if(arT){clearInterval(arT);arT=null;}}
function showApp(){G('LV').classList.add('hidden');G('AV').classList.remove('hidden');try{G('AV').classList.toggle('sb-collapsed',localStorage.getItem('fwt_sidebar_collapsed')==='1');}catch(e){}injectDiagCard();loadPage('overview');loadNavBadges();startLive();startAR();}
function setNavBadge(key,n){n=Math.max(0,Number(n)||0);var els=document.querySelectorAll('[data-badge="'+key+'"]');for(var i=0;i<els.length;i++){els[i].textContent=n>99?'99+':String(n);els[i].title=n.toLocaleString()+' '+key;els[i].style.display=n?'inline-flex':'none';}}
function loadNavBadges(){return apiCall('/badge-counts').then(function(d){var c=(d&&d.counts)||{};setNavBadge('comments',c.comments);setNavBadge('reports',c.reports);setNavBadge('tools',c.tool_likes);setNavBadge('articles',c.article_likes);}).catch(function(){});}
function markBadgeSeen(key){if(['comments','tools','articles'].indexOf(key)===-1)return;setNavBadge(key,0);apiCall('/badge-seen',{method:'POST',body:JSON.stringify({badge:key})}).then(function(){setNavBadge(key,0);loadNavBadges();}).catch(function(){loadNavBadges();});}
function loadSettingsInfo(){var d=G('SVER_DASH'),b=G('SVER_BACKEND'),st=G('SVER_STATUS');if(d)d.textContent='v2.15.0';if(b)b.textContent='Checking...';if(st)st.textContent='Checking...';apiCall('/diag').then(function(x){if(b)b.textContent=x.worker_version||'Unknown';if(st){st.textContent='Operational';st.style.color='var(--ac2)';}}).catch(function(){if(b)b.textContent='Unavailable';if(st){st.textContent='Check connection';st.style.color='var(--dg)';}});}
function sumCounts(items){var n=0;for(var i=0;i<(items||[]).length;i++)n+=Math.max(0,Number(items[i].count)||0);return n;}
function setMetricCount(id,items,useSum){var el=G(id);if(el)el.textContent='('+(useSum?sumCounts(items):(items||[]).length)+')';}
function logout(){token=null;try{localStorage.removeItem(TK);}catch(e){}showLogin();}

function apiCall(path,opts){opts=opts||{};var h={'Content-Type':'application/json'};if(token)h['Authorization']='Bearer '+token;var qs=path.indexOf('?')===-1?'?':'&';var pathWithBust=path+qs+'_t='+Date.now();return fetch(API+pathWithBust,{method:opts.method||'GET',headers:h,body:opts.body,cache:'no-store'}).then(function(r){if(r.status===401){logout();throw new Error('Session expired');}return r.text().then(function(raw){var d;try{d=raw?JSON.parse(raw):{};}catch(e){throw new Error('Bad response from server');}if(!r.ok||d.success===false)throw new Error(d.message||d.error||('HTTP '+r.status));return d;});});}

function wr(path){if(!rng)return path;var sep=path.indexOf('?')===-1?'?':'&';return path+sep+'from='+rng.from+'&to='+rng.to;}
function prevRng(){if(!rng)return null;var a=new Date(rng.from+'T00:00:00Z'),b=new Date(rng.to+'T00:00:00Z');if(isNaN(a.getTime())||isNaN(b.getTime()))return null;var days=Math.round((b-a)/86400000)+1;var pe=new Date(a.getTime()-86400000),ps=new Date(pe.getTime()-(days-1)*86400000);return {from:ymd(ps),to:ymd(pe)};}
function deltaHtml(cur,prev){cur=Number(cur)||0;prev=Number(prev)||0;if(!prev)return cur?'<span class="delta up"><i class="fa-solid fa-arrow-up"></i> New</span>':'<span class="delta flat">—</span>';var d=((cur-prev)/prev)*100,cls=d>0?'up':d<0?'down':'flat',ic=d>0?'fa-arrow-up':d<0?'fa-arrow-down':'fa-minus';return '<span class="delta '+cls+'"><i class="fa-solid '+ic+'"></i> '+Math.abs(d).toFixed(0)+'%</span>';}
function setUpdated(){lastUpdated=Date.now();var el=G('HUP');if(el)el.textContent='Just now';}
function updateHealth(){var el=G('HAPI');if(!el)return;apiCall('/diag').then(function(d){var ok=!!(d&&d.worker_version);el.classList.toggle('bad',!ok);el.innerHTML='<i class="fa-solid '+(ok?'fa-circle-check':'fa-triangle-exclamation')+'"></i><div><div class="hv">'+(ok?'All systems operational':'Check diagnostics')+'</div><div class="hl">Admin API '+esc(d.worker_version||'unknown')+'</div></div>';}).catch(function(){el.classList.add('bad');el.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i><div><div class="hv">API check failed</div><div class="hl">Open Settings → Diagnostics</div></div>';});}
function csvCell(v){var x=String(v==null?'':v);return /[",\\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}
function downloadCsv(name,rows){if(!rows||!rows.length){toast('No data available to export','error');return;}var cols=Object.keys(rows[0]),out=[cols.map(csvCell).join(',')];for(var i=0;i<rows.length;i++){out.push(cols.map(function(k){return csvCell(rows[i][k]);}).join(','));}var blob=new Blob(['\ufeff'+out.join('\\n')],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name+'-'+ymd(new Date())+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},500);toast('CSV exported successfully','success');}
function exportCurrent(){var rows=[],name='fastwebtools-'+curP;if(curP==='overview'&&lastStats){for(var k in lastStats)if(lastStats.hasOwnProperty(k))rows.push({metric:k,value:lastStats[k],range:rng?(rng.from+' to '+rng.to):'All time'});}else if(curP==='comments'){for(var i=0;i<cAll.length;i++)rows.push({id:cAll[i].id,article:cAll[i].article_id,name:cAll[i].name,status:cAll[i].status||'published',comment:cAll[i].comment,date:cAll[i].created_at});}else if(curP==='tools'){var ti=tabTools==='usage'?toolsCache.usage:toolsCache.likes;for(var j=0;j<(ti||[]).length;j++)rows.push({tool:ti[j].name||ti[j].tool_id,count:ti[j].count,type:tabTools,range:rng?(rng.from+' to '+rng.to):'All time'});}else if(curP==='articles'){var ai=tabArts==='views'?artsCache.views:artsCache.likes;for(var n=0;n<(ai||[]).length;n++)rows.push({article:ai[n].url||ai[n].name||ai[n].article_id,count:ai[n].count,type:tabArts,range:rng?(rng.from+' to '+rng.to):'All time'});}else if(curP==='reports'){for(var r=0;r<reportsCache.length;r++){var rp=reportsCache[r],rc=rp._comment||{};rows.push({report_id:rp.id,status:rp.status||'pending',reason:rp.reason,details:rp.details||'',comment_id:rc.id,comment_author:rc.name,comment:rc.comment,article:rc.article_id,date:rp.created_at_iso||rp.created_at});}}else{toast('No export is available on this page','info');return;}downloadCsv(name,rows);}
function filterSort(items,kind,q,sort){var out=(items||[]).slice(),query=String(q||'').trim().toLowerCase();if(query)out=out.filter(function(it){var raw=it.url||it.name||it.article_id||it.tool_id||'';var nm=kind==='article'?parseArticle(raw).title:(it.name||it.tool_id||raw);return String(nm).toLowerCase().indexOf(query)!==-1;});out.sort(function(a,b){var an=String(a.name||a.tool_id||a.url||a.article_id||''),bn=String(b.name||b.tool_id||b.url||b.article_id||'');if(sort==='az')return an.localeCompare(bn);var av=Number(a.count)||0,bv=Number(b.count)||0;return sort==='low'?av-bv:bv-av;});return out;}

// v2.5.18: FTB button gets .filtered dot when a range is active.
function setRng(from,to){rng=from?{from:from,to:to||from}:null;var fl=G('FL');if(fl)fl.textContent=rng?('Filtered: '+rng.from+(rng.from!==rng.to?' to '+rng.to:'')):'All time';var hr=G('HRNG');if(hr)hr.textContent=rng?(rng.from+(rng.from!==rng.to?' → '+rng.to:'')):'All time';var ftb=G('FTB');if(ftb)ftb.classList.toggle('filtered',!!rng);toast(rng?'Filter applied: '+(rng.from===rng.to?rng.from:rng.from+' to '+rng.to):'Filter cleared','info');refreshCur();}
function presetRng(p){var now=new Date(),to=ymd(now),from;if(p==='all'){setRng(null);return;}if(p==='today'){from=ymd(now);}else if(p==='yesterday'){var y=new Date(now.getTime()-86400000);from=to=ymd(y);}else if(p==='7d'){from=ymd(new Date(now.getTime()-6*86400000));}else if(p==='30d'){from=ymd(new Date(now.getTime()-29*86400000));}else if(p==='month'){from=ymd(new Date(now.getFullYear(),now.getMonth(),1));}setRng(from,to);}

function injectDiagCard(){
  if(G('DIAGCARD'))return;
  var sp=G('pg-settings');if(!sp)return;
  var grid=sp.querySelector('[style*="display:grid"]');if(!grid)return;
  var card=document.createElement('div');
  card.className='card';card.id='DIAGCARD';
  card.innerHTML='<h3 style="margin-bottom:8px"><i class="fa-solid fa-stethoscope" style="color:#00d4b1;margin-right:6px"></i>Backend Diagnostics</h3><p style="color:var(--dm);font-size:13px;margin-bottom:16px;line-height:1.6">Check deployed backend version and sample data formats.</p><button class="bg2" id="DIAGBTN"><i class="fa-solid fa-play"></i> Run Diagnostics</button><pre id="DIAGOUT" style="margin-top:14px;font-size:11px;background:var(--sf2);padding:12px;border-radius:8px;overflow:auto;max-height:420px;display:none;white-space:pre-wrap;word-break:break-all;color:var(--tx);border:1px solid var(--bd)"></pre>';
  grid.appendChild(card);
}

function doLogin(){var u=G('UN').value.trim();var p=G('PW').value;var btn=G('LB');var le=G('LE'),les=G('LES');le.classList.remove('show');if(!u||!p){les.textContent='Please enter username and password';le.classList.add('show');return;}btn.disabled=true;btn.textContent='Signing in...';fetch(API+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p}),cache:'no-store'}).then(function(r){return r.text().then(function(raw){var d;try{d=raw?JSON.parse(raw):{};}catch(e){throw new Error('Bad response from server');}if(!r.ok||!d.success||!d.token){throw new Error(d.message||d.error||('Login failed ('+r.status+')'));}token=d.token;try{if(G('REM').checked)localStorage.setItem(TK,token);}catch(e){}toast('Welcome back!','success');showApp();});}).catch(function(e){les.textContent=e.message||'Network error. Try again.';le.classList.add('show');}).then(function(){btn.disabled=false;btn.textContent='Sign in';});}

// v2.5.18: show FTB (Filter toggle button) only on Overview; hide filter row on page change.
function loadPage(name){curP=name;var pgs=document.querySelectorAll('.pg');for(var i=0;i<pgs.length;i++)pgs[i].classList.remove('active');var pg=G('pg-'+name);if(pg)pg.classList.add('active');var nis=document.querySelectorAll('.ni,.mni');for(var j=0;j<nis.length;j++)nis[j].classList.toggle('active',nis[j].getAttribute('data-page')===name);var titles={'overview':'Overview','comments':'Comments','reports':'Reports','tools':'Tools','articles':'Articles','settings':'Settings'};G('PT').textContent=titles[name]||name;var ftb=G('FTB');if(ftb)ftb.style.display=name==='settings'?'none':'';var exb=G('EXB');if(exb)exb.style.display=name==='settings'?'none':'';closeSb();if(['comments','tools','articles'].indexOf(name)!==-1)markBadgeSeen(name);if(name==='overview')loadOverview();else if(name==='comments')loadComments(1);else if(name==='reports')loadReports();else if(name==='tools')loadToolsPage();else if(name==='articles')loadArticlesPage();else if(name==='settings'){injectDiagCard();loadSettingsInfo();}}
function refreshCur(){if(curP==='overview')loadOverview();else if(curP==='comments')loadComments(cPg,true);else if(curP==='reports')loadReports();else if(curP==='tools')loadToolsPage();else if(curP==='articles')loadArticlesPage();loadNavBadges();}
function startLive(){if(liveT)clearInterval(liveT);pollLive();liveT=setInterval(pollLive,5000);}
function pollLive(){apiCall('/visitors/realtime').then(function(d){liveNow=Number(d.live||0);var el=G('LIVEKPI');if(el)el.textContent=fmt(liveNow);}).catch(function(){});}
function startAR(){if(arT)clearInterval(arT);arT=setInterval(function(){var ar=G('AR');if(ar&&ar.checked)refreshCur();},20000);}

function setVABtn(navKey,count){var btns=document.querySelectorAll('[data-nav="'+navKey+'"]');for(var i=0;i<btns.length;i++)btns[i].innerHTML='View all ('+count+') <i class="fa-solid fa-arrow-right"></i>';}

function buildEngagementChart(labels,visits,commentsByDay){
  var wrap=G('CHTW');if(!wrap)return;
  wrap.innerHTML='<canvas id="CHT"></canvas>';
  var ctx=G('CHT');
  if(chartInst){try{chartInst.destroy();}catch(e){}chartInst=null;}
  if(!ctx||typeof Chart==='undefined')return;
  if(!labels.length){wrap.innerHTML='<div style="text-align:center;color:var(--dm);padding:80px 20px"><i class="fa-solid fa-chart-line" style="font-size:32px;margin-bottom:10px;display:block"></i>No activity data for selected range</div>';return;}
  var commentData=[];
  for(var i=0;i<labels.length;i++){commentData.push(Number(commentsByDay[labels[i]]||0));}
  try{
    chartInst=new Chart(ctx.getContext('2d'),{
      type:'line',
      data:{labels:labels,datasets:[
        {label:'Visits',data:visits,borderColor:'#7c6bff',backgroundColor:'rgba(124,107,255,0.10)',fill:true,tension:0.4,pointBackgroundColor:'#7c6bff',pointRadius:2,pointHoverRadius:5,borderWidth:2},
        {label:'Comments',data:commentData,borderColor:'#00d4b1',backgroundColor:'rgba(0,212,177,0.06)',fill:false,tension:0.4,pointBackgroundColor:'#00d4b1',pointRadius:2,pointHoverRadius:5,borderWidth:2}
      ]},
      options:{
        responsive:true,maintainAspectRatio:false,
        interaction:{mode:'index',intersect:false},
        plugins:{legend:{display:true,position:'top',labels:{color:'#c4c1e0',boxWidth:12,padding:14,font:{size:12}}},tooltip:{callbacks:{label:function(c){return ' '+c.dataset.label+': '+c.parsed.y;}}}},
        scales:{
          x:{ticks:{color:'#8a86ab',maxTicksLimit:10,maxRotation:0},grid:{color:'rgba(255,255,255,0.04)'}},
          y:{ticks:{color:'#8a86ab'},grid:{color:'rgba(255,255,255,0.05)'},beginAtZero:true}
        }
      }
    });
  }catch(err){wrap.innerHTML='<div style="color:var(--dg);padding:20px">Chart render error: '+esc(err.message||String(err))+'</div>';}
}

// v2.5.18: dashboard grouped into 3 sections (Traffic / Articles / Tools).
// Blog Views card added. Tool Likes / Article Likes cards route to their
// By Likes sub-tab via data-sub attribute.
function loadOverview(){
  updateHealth();var hr=G('HRNG');if(hr)hr.textContent=rng?(rng.from+(rng.from!==rng.to?' → '+rng.to:'')):'All time';
  G('STG').innerHTML='<div style="padding:24px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i> Loading stats...</div>';
  var isFiltered=!!rng;
  var pr=prevRng(),prevPath=pr?('/stats?from='+pr.from+'&to='+pr.to):null;
  Promise.all([apiCall(wr('/stats')),prevPath?apiCall(prevPath):Promise.resolve({stats:{}})]).then(function(rs){
    var s=rs[0],st=s.stats||{},pst=(rs[1]&&rs[1].stats)||{};lastStats=st;setUpdated();
    var sections=[
      ['Traffic','fa-signal',[
        ['total_visits','Total Visits','fa-eye','',false,''],
        ['unique_visitors','Unique Visitors','fa-users','',false,''],
        ['total_blog_views','Blog Views','fa-book-open','articles',false,'views'],
        ['live_now','Live Now','fa-bolt','',false,'']
      ]],
      ['Articles','fa-newspaper',[
        ['total_article_likes','Article Likes','fa-heart','articles',false,'likes'],
        ['total_comments','Comments','fa-comments','comments',false,'']
      ]],
      ['Tools','fa-wrench',[
        ['total_tool_uses','Tool Uses','fa-hammer','tools',false,'usage'],
        ['total_tool_likes','Tool Likes','fa-thumbs-up','tools',false,'likes']
      ]]
    ];
    var h='';
    for(var si=0;si<sections.length;si++){
      var sec=sections[si];
      h+='<div class="sec-h"><i class="fa-solid '+sec[1]+'"></i>'+sec[0]+'</div><div class="sg">';
      var cards=sec[2];
      for(var i=0;i<cards.length;i++){
        var c=cards[i];var v=c[0]==='live_now'?liveNow:Number(st[c[0]]||0);
        var badge=(isFiltered&&c[4])?'<span class="atg" title="This stat is all-time only">all-time</span>':'';
        var cmp=isFiltered?deltaHtml(v,pst[c[0]]):'';var pg=c[3],sub=c[5]||'';
        h+='<div class="sc '+(c[0]==='live_now'?'live-card':'')+'" data-pg="'+pg+'" data-sub="'+sub+'" style="'+(pg?'cursor:pointer':'')+'"><div class="val" '+(c[0]==='live_now'?'id="LIVEKPI"':'')+'>'+fmt(v)+'</div><div class="lbl2">'+c[1]+' '+badge+' '+cmp+'</div><i class="fa-solid '+c[2]+' ic"></i></div>';
      }
      h+='</div>';
    }
    G('STG').innerHTML=h;
    var scs=document.querySelectorAll('.sc[data-pg]');
    for(var k=0;k<scs.length;k++){
      (function(el){
        var pg=el.getAttribute('data-pg');var sub=el.getAttribute('data-sub')||'';
        el.addEventListener('click',function(){if(!pg)return;if(sub){if(pg==='tools')tabTools=sub;if(pg==='articles')tabArts=sub;}loadPage(pg);});
      })(scs[k]);
    }
  }).catch(function(e){G('STG').innerHTML='<div style="color:var(--dg);padding:14px"><i class="fa-solid fa-triangle-exclamation"></i> Stats: '+esc(e.message)+'</div>';});

  var daPath=rng?wr('/daily-activity'):'/daily-activity?days=30';
  var labels=[],visits=[];
  var chartReady=function(commentsByDay){buildEngagementChart(labels,visits,commentsByDay);};
  var commentsData={};
  var pendingDaily=true,pendingComm=true;
  var maybeRender=function(){if(!pendingDaily&&!pendingComm)chartReady(commentsData);};
  apiCall(daPath).then(function(dd){var days=dd.activity||dd.days||[];for(var i=0;i<days.length;i++){if(!days[i].day)continue;labels.push(days[i].day||days[i].date||'');visits.push(Number(days[i].visits||days[i].count||0));}pendingDaily=false;maybeRender();}).catch(function(e){pendingDaily=false;var w=G('CHTW');if(w)w.innerHTML='<div style="color:var(--dg);padding:20px">Chart data error: '+esc(e.message)+'</div>';});
  apiCall(wr('/comments')).then(function(cd){var comments=cd.comments||[];for(var i=0;i<comments.length;i++){var ms=fdtMs(comments[i].created_at);if(!ms)continue;var k=dayKey(ms);commentsData[k]=(commentsData[k]||0)+1;}pendingComm=false;maybeRender();}).catch(function(){pendingComm=false;maybeRender();});

  G('TUL').innerHTML='<div style="padding:20px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  apiCall(wr('/popular-tools?limit=1000')).then(function(d){
    var allTls=d.tools||[];
    setVABtn('tools',allTls.length);
    var tls=allTls.slice(0,10);
    if(!tls.length){G('TUL').innerHTML='<div style="color:var(--dm);padding:20px;text-align:center">No tool usage data</div>';return;}
    var mx=Number(tls[0].count||0)||1;var h='';
    for(var i=0;i<tls.length;i++){var t=tls[i];var n=t.name||t.tool_id||'Unknown';var uu=toolUrl(n);var c=Number(t.count||0);var p=Math.round(c/mx*100);h+='<div class="br"><span class="rnk">'+(i+1)+'</span><a class="bn" href="'+esc(uu)+'" target="_blank" rel="noopener" title="'+esc(uu)+'">'+esc(n)+'</a><span class="bt"><span class="bf" style="width:'+p+'%"></span></span><span class="bv">'+fmt(c)+'</span></div>';}
    G('TUL').innerHTML=h;
  }).catch(function(e){G('TUL').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});

  G('AVL').innerHTML='<div style="padding:20px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  apiCall(wr('/popular-articles?limit=1000')).then(function(d){
    var allArts=d.articles||[];
    populateUrlMap(allArts);
    setVABtn('articles',allArts.length);
    var arts=allArts.slice(0,10);
    if(!arts.length){G('AVL').innerHTML='<div style="color:var(--dm);padding:20px;text-align:center">No article views yet</div>';return;}
    var mx=Number(arts[0].count||0)||1;var h='';
    for(var i=0;i<arts.length;i++){var a=arts[i];var raw=a.url||a.name||a.article_id||'';var parsed=parseArticle(raw);var c=Number(a.count||0);var p=Math.round(c/mx*100);h+='<div class="br"><span class="rnk">'+(i+1)+'</span><a class="bn" href="'+esc(parsed.url)+'" target="_blank" rel="noopener" title="'+esc(parsed.url)+'">'+esc(parsed.title)+'</a><span class="bt"><span class="bf" style="width:'+p+'%"></span></span><span class="bv">'+fmt(c)+'</span></div>';}
    G('AVL').innerHTML=h;
  }).catch(function(e){G('AVL').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});
}

function loadComments(page,quiet){cPg=page||1;var hasData=cAll&&cAll.length>0,cl=G('CL');if(!quiet&&!hasData){cl.innerHTML='<div style="padding:28px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i> Loading comments...</div>';G('CSTAT').innerHTML='';}else if(hasData){cl.classList.add('is-refreshing');}apiCall(wr('/popular-articles?limit=1000')).then(function(d){populateUrlMap(d.articles||[]);return apiCall(wr('/comments'));}).catch(function(){return apiCall(wr('/comments'));}).then(function(d){cAll=(d&&d.comments)||[];setUpdated();renderCommentStats();renderComments();cl.classList.remove('is-refreshing');}).catch(function(e){cl.classList.remove('is-refreshing');if(hasData)toast('Refresh failed: '+e.message,'error');else cl.innerHTML='<div style="color:var(--dg);padding:14px"><i class="fa-solid fa-triangle-exclamation"></i> '+esc(e.message)+'</div>';});}

function renderCommentStats(){var arts={},pub=0,pend=0,spam=0,replies=0,commentLikes=0,commentDislikes=0,replyLikes=0,replyDislikes=0;for(var i=0;i<cAll.length;i++){var c=cAll[i],aid=c.article_id||'(none)';arts[aid]=(arts[aid]||0)+1;var st=c.status||'published';if(st==='published')pub++;else if(st==='pending')pend++;else if(st==='spam')spam++;var rs=c.replies||[];commentLikes+=Number(c.likes||0);commentDislikes+=Number(c.dislikes||0);for(var r=0;r<rs.length;r++){if(Number(rs[r].is_official)!==0)replies++;replyLikes+=Number(rs[r].likes||0);replyDislikes+=Number(rs[r].dislikes||0);}}var artCount=Object.keys(arts).length,totalLikes=commentLikes+replyLikes,totalDislikes=commentDislikes+replyDislikes,items=[['fa-comments','#7c6bff',cAll.length,'Total comments'],['fa-reply','#1a5fff',replies,'Admin replies'],['fa-thumbs-up','#00d4b1',totalLikes,'All likes'],['fa-thumbs-down','#ff8a8a',totalDislikes,'All dislikes'],['fa-newspaper','#00d4b1',artCount,'Articles'],['fa-clock','#ffb545',pend,'Pending']];var h='<div class="cst">';for(var j=0;j<items.length;j++){var x=items[j];h+='<div class="csi" title="Likes and dislikes include user comments and admin replies"><i class="fa-solid '+x[0]+'" style="color:'+x[1]+'"></i><div><div class="csv">'+x[2]+'</div><div class="csl">'+x[3]+'</div></div></div>';}G('CSTAT').innerHTML=h+'</div>';}
function renderComments(){
  var sq=G('CS').value.trim().toLowerCase(),stf=G('SF').value,fx=G('CFX').value,list=[];
  for(var i=0;i<cAll.length;i++){
    var c=cAll[i],cs=c.status||'published',reps=(c.replies||[]).filter(function(r){return Number(r.is_official)!==0;});
    if(stf&&stf!=='all'&&cs!==stf)continue;
    if(fx==='unanswered'&&reps.length)continue;if(fx==='answered'&&!reps.length)continue;if(fx==='admin-edited'&&!c.edited_by_admin)continue;
    if(sq){var rt='';for(var z=0;z<reps.length;z++)rt+=' '+(reps[z].body||'');var qr=c.reports||[];for(var qi=0;qi<qr.length;qi++)rt+=' '+(qr[qi].reason||'')+' '+(qr[qi].details||'');var hay=((c.name||'')+' '+(c.comment||'')+' '+(c.article_id||'')+rt).toLowerCase();if(hay.indexOf(sq)===-1)continue;}
    list.push(c);
  }
  if(fx==='most-liked')list.sort(function(a,b){return Number(b.likes||0)-Number(a.likes||0);});else if(fx==='most-disliked')list.sort(function(a,b){return Number(b.dislikes||0)-Number(a.dislikes||0);});else list.sort(function(a,b){return (fdtMs(b.created_at_ms||b.created_at)-fdtMs(a.created_at_ms||a.created_at))||(Number(b.id||0)-Number(a.id||0));});
  var total=list.length,pages=Math.max(1,Math.ceil(total/PL));if(cPg>pages)cPg=pages;if(cPg<1)cPg=1;
  var pageList=list.slice((cPg-1)*PL,cPg*PL);G('PI').textContent='Page '+cPg+' of '+pages+(total?' · '+total+' results':'');G('PP').disabled=cPg<=1;G('NPB').disabled=cPg>=pages;
  if(!pageList.length){G('CL').innerHTML='<div class="empty"><i class="fa-solid fa-comment-slash" style="font-size:28px;margin-bottom:10px;display:block"></i>No comments match your filters.</div>';return;}
  var grp={},order=[];
  for(var j=0;j<pageList.length;j++){var c2=pageList[j],k=c2.article_id||'(no-article)';if(!grp[k]){grp[k]={list:[],latest:0,replies:0};order.push(k);}grp[k].list.push(c2);grp[k].replies+=(c2.replies||[]).filter(function(x){return Number(x.is_official)!==0;}).length;var dt=fdtMs(c2.created_at_ms||c2.created_at);if(dt>grp[k].latest)grp[k].latest=dt;}
  order.sort(function(a,b){return grp[b].latest-grp[a].latest;});var h='<div class="al">';
  for(var m=0;m<order.length;m++){
    var slug=order[m],g=grp[slug],parsed=parseArticle(slug);
    h+='<div class="ai'+(m===0?' open':'')+'"><div class="ah" data-toggle="1" role="button" tabindex="0" aria-expanded="'+(m===0?'true':'false')+'"><i class="fa-solid fa-chevron-right achev"></i><div class="atw"><a class="at" href="'+esc(parsed.url)+'" target="_blank" rel="noopener">'+esc(parsed.title)+'</a><div class="asub">Latest: '+fdt(g.latest)+' · '+g.list.length+' comment'+(g.list.length===1?'':'s')+' · '+g.replies+' admin repl'+(g.replies===1?'y':'ies')+'</div></div><span class="acnt"><i class="fa-solid fa-comment"></i> '+g.list.length+' <i class="fa-solid fa-reply"></i> '+g.replies+'</span></div><div class="abdy">';
    for(var l=0;l<g.list.length;l++){
      var c3=g.list[l],init=String(c3.name||'?').charAt(0).toUpperCase(),status=c3.status||'published',replies=(c3.replies||[]).filter(function(x){return Number(x.is_official)!==0;}),reports=c3.reports||[],pendingReports=reports.filter(function(x){return (x.status||'pending')==='pending';});
      h+='<div class="cr"><div class="cav">'+esc(init)+'</div><div class="cm"><div class="chr2"><span class="cu">'+esc(c3.name||'Anonymous')+'</span><span class="sbd '+status+'">'+status+'</span>'+(pendingReports.length?'<span class="reporttag"><i class="fa-solid fa-flag"></i> '+pendingReports.length+' pending report'+(pendingReports.length===1?'':'s')+'</span>':'')+(c3.edited_once?'<span class="edtag">'+(c3.edited_by_admin?'Edited by Admin':'Edited')+'</span>':'')+'<span class="cd">'+fdt(c3.created_at_ms||c3.created_at)+'</span></div><div class="ct">'+esc(c3.comment||'')+'</div>'+(c3.edited_by_admin&&c3.admin_edit_reason?'<div class="moderation-note"><i class="fa-solid fa-shield-halved"></i> '+esc(c3.admin_edit_reason)+'</div>':'')+'<div style="display:flex;gap:6px;margin:7px 0;flex-wrap:wrap"><span class="rx like"><i class="fa-solid fa-thumbs-up"></i> '+Number(c3.likes||0)+'</span><span class="rx dislike"><i class="fa-solid fa-thumbs-down"></i> '+Number(c3.dislikes||0)+'</span><span class="rx"><i class="fa-solid fa-reply"></i> '+replies.length+'</span></div><div class="ca"><button data-act="reply" data-id="'+c3.id+'"><i class="fa-solid fa-reply"></i> Reply as Admin</button><button data-act="edit-user" data-id="'+c3.id+'"><i class="fa-solid fa-pen"></i> Edit Comment</button><button data-act="published" data-id="'+c3.id+'"><i class="fa-solid fa-check"></i> Approve</button><button data-act="pending" data-id="'+c3.id+'"><i class="fa-solid fa-clock"></i> Pending</button><button data-act="spam" data-id="'+c3.id+'"><i class="fa-solid fa-ban"></i> Spam</button><button class="danger" data-act="delete" data-id="'+c3.id+'"><i class="fa-solid fa-trash"></i> Delete</button></div>';
      if(reports.length){h+='<div class="report-list"><div class="report-title"><i class="fa-solid fa-flag"></i> Comment reports</div>';for(var q=0;q<reports.length;q++){var rp0=reports[q],rst=rp0.status||'pending';h+='<div class="report-item '+rst+'"><div><b>'+esc(rp0.reason||'Other')+'</b><span>'+fdt(rp0.created_at_ms||rp0.created_at)+'</span></div>'+(rp0.details?'<p>'+esc(rp0.details)+'</p>':'')+'<div class="report-actions">'+(rst==='pending'?'<button data-act="report-reviewed" data-id="'+rp0.id+'"><i class="fa-solid fa-check"></i> Mark reviewed</button><button data-act="report-dismissed" data-id="'+rp0.id+'"><i class="fa-solid fa-xmark"></i> Dismiss</button>':'<span class="sbd '+(rst==='reviewed'?'published':'spam')+'">'+esc(rst)+'</span>')+'</div></div>';}h+='</div>';}
      if(replies.length){h+='<div class="rplist">';for(var r=0;r<replies.length;r++){var rp=replies[r];h+='<div class="admin-reply"><img class="admin-logo" src="data:image/webp;base64,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" alt="Fast Web Tools"><div style="flex:1;min-width:0"><div><span class="admin-name">Fast Web Tools</span><span class="admin-badge"><i class="fa-solid fa-check"></i>&nbsp; ADMIN</span><span class="cd" style="float:right">'+fdt(rp.created_at_ms||rp.created_at)+'</span></div><div class="reply-text">'+esc(rp.body||'')+'</div><div style="display:flex;gap:5px;margin-bottom:5px"><span class="rx like"><i class="fa-solid fa-thumbs-up"></i> '+Number(rp.likes||0)+'</span><span class="rx dislike"><i class="fa-solid fa-thumbs-down"></i> '+Number(rp.dislikes||0)+'</span></div><div class="reply-actions"><button data-act="edit-reply" data-id="'+rp.id+'"><i class="fa-solid fa-pen"></i> Edit Reply</button><button data-act="delete-reply" data-id="'+rp.id+'"><i class="fa-solid fa-trash"></i> Delete Reply</button></div></div></div>';}h+='</div>';}
      h+='</div></div>';
    }
    h+='</div></div>';
  }
  G('CL').innerHTML=h+'</div>';
}
document.addEventListener('keydown',function(e){var h=e.target&&e.target.closest?e.target.closest('.ah[data-toggle]'):null;if(h&&(e.key==='Enter'||e.key===' ')){e.preventDefault();h.click();}});
document.addEventListener('click',function(e){if(!e.target.closest)return;var db=e.target.closest('#DIAGBTN');if(db){var out=G('DIAGOUT');out.style.display='block';out.textContent='Loading...';apiCall('/diag').then(function(d){out.textContent=JSON.stringify(d,null,2);}).catch(function(err){out.textContent='Error: '+err.message;});return;}var tog=e.target.closest('.ah[data-toggle]');if(tog&&!e.target.closest('a')){var opened=tog.parentElement.classList.toggle('open');tog.setAttribute('aria-expanded',opened?'true':'false');return;}var tab=e.target.closest('.tab[data-tab]');if(tab){var scope=tab.getAttribute('data-scope'),val=tab.getAttribute('data-tab');if(scope==='tools'){tabTools=val;renderToolsPage();}else if(scope==='articles'){tabArts=val;renderArticlesPage();}return;}var b=e.target.closest('[data-act]');if(!b)return;var act=b.getAttribute('data-act'),id=b.getAttribute('data-id'),comment=null,reply=null;for(var i=0;i<cAll.length;i++){if(String(cAll[i].id)===String(id))comment=cAll[i];var rr=cAll[i].replies||[];for(var j=0;j<rr.length;j++)if(String(rr[j].id)===String(id))reply=rr[j];}if(act==='delete'){showMod('Delete comment and all reactions?','<p style="color:var(--dg);font-weight:700">This permanently deletes the comment, all likes/dislikes, and every reply.</p>',[{label:'Cancel',fn:closeMod},{label:'Delete permanently',cls:'bd2',fn:function(){closeMod();apiCall('/comment/'+id,{method:'DELETE'}).then(function(){toast('Comment and related data deleted','success');loadComments(cPg,true);}).catch(function(err){toast(err.message,'error');});}}]);}else if(act==='reply'){showMod('Reply as Fast Web Tools Admin','<textarea id="MREPLY" class="modal-ta" maxlength="800" placeholder="Write an official reply..."></textarea>',[{label:'Cancel',fn:closeMod},{label:'Publish official reply',cls:'btn',fn:function(){var t=G('MREPLY').value.trim();if(!t){toast('Reply is required','error');return;}closeMod();apiCall('/comment/'+id+'/reply',{method:'POST',body:JSON.stringify({reply:t,is_official:true})}).then(function(){toast('Official reply published','success');loadComments(cPg,true);}).catch(function(err){toast(err.message,'error');});}}]);}else if(act==='edit-user'&&comment){showMod('Edit user comment','<p style="font-size:12px;color:var(--dm);margin-bottom:10px">The public comment will show “Edited by Admin”. The original is preserved in the private audit log.</p><textarea id="MEDIT" class="modal-ta" maxlength="400">'+esc(comment.comment||'')+'</textarea><select id="MREASON" class="modal-sel"><option>Formatting corrected</option><option>Personal information removed</option><option>Offensive language removed</option><option>Broken link corrected</option><option>Moderated by admin</option></select>',[{label:'Cancel',fn:closeMod},{label:'Save with audit record',cls:'btn',fn:function(){var t=G('MEDIT').value.trim(),r=G('MREASON').value;if(!t){toast('Comment is required','error');return;}closeMod();apiCall('/comment/'+id,{method:'PUT',body:JSON.stringify({comment:t,reason:r})}).then(function(){toast('Comment edited transparently','success');loadComments(cPg,true);}).catch(function(err){toast(err.message,'error');});}}]);}else if(act==='edit-reply'&&reply){showMod('Edit official reply','<textarea id="MREPLYEDIT" class="modal-ta" maxlength="800">'+esc(reply.body||'')+'</textarea>',[{label:'Cancel',fn:closeMod},{label:'Save reply',cls:'btn',fn:function(){var t=G('MREPLYEDIT').value.trim();if(!t){toast('Reply is required','error');return;}closeMod();apiCall('/reply/'+id,{method:'PUT',body:JSON.stringify({reply:t,is_official:Number(reply.is_official)!==0})}).then(function(){toast('Reply updated','success');loadComments(cPg,true);}).catch(function(err){toast(err.message,'error');});}}]);}else if(act==='delete-reply'){showMod('Delete official reply?','<p style="color:var(--dm)">The reply and its reactions will be permanently deleted. The user comment will remain.</p>',[{label:'Cancel',fn:closeMod},{label:'Delete reply',cls:'bd2',fn:function(){closeMod();apiCall('/reply/'+id,{method:'DELETE'}).then(function(){toast('Reply deleted','success');loadComments(cPg,true);}).catch(function(err){toast(err.message,'error');});}}]);}else if(act==='report-reviewed'||act==='report-dismissed'||act==='report-pending'){var rs=act==='report-reviewed'?'reviewed':(act==='report-dismissed'?'dismissed':'pending');apiCall('/report/'+id,{method:'PUT',body:JSON.stringify({status:rs})}).then(function(){toast('Report marked '+rs,'success');if(curP==='reports')loadReports();else loadComments(cPg,true);loadNavBadges();}).catch(function(err){toast(err.message,'error');});}else if(['published','pending','spam'].indexOf(act)!==-1){apiCall('/comment/'+id,{method:'PUT',body:JSON.stringify({status:act})}).then(function(){toast('Marked as '+act,'success');loadComments(cPg,true);}).catch(function(err){toast(err.message,'error');});}});
function loadReports(){
  var el=G('RL');if(el)el.innerHTML='<div class="empty"><i class="fa-solid fa-spinner fa-spin"></i> Loading reports...</div>';
  apiCall('/comments').then(function(d){cAll=(d&&d.comments)||[];reportsCache=[];for(var i=0;i<cAll.length;i++){var c=cAll[i],rs=c.reports||[];for(var j=0;j<rs.length;j++){var q=rs[j];q._comment=c;reportsCache.push(q);}}renderReports();}).catch(function(e){if(el)el.innerHTML='<div class="empty" style="color:var(--dg)">'+esc(e.message)+'</div>';});
}
function renderReports(){
  var q=(G('RS')?G('RS').value:'').trim().toLowerCase(),status=G('RSF')?G('RSF').value:'pending',reason=G('RRF')?G('RRF').value:'all',sort=G('RSORT')?G('RSORT').value:'newest',list=[];
  for(var i=0;i<reportsCache.length;i++){var r=reportsCache[i],c=r._comment||{},st=r.status||'pending';if(status!=='all'&&st!==status)continue;if(reason!=='all'&&r.reason!==reason)continue;var hay=((r.reason||'')+' '+(r.details||'')+' '+(c.comment||'')+' '+(c.name||'')+' '+(c.article_id||'')).toLowerCase();if(q&&hay.indexOf(q)===-1)continue;list.push(r);}
  list.sort(function(a,b){var d=fdtMs(b.created_at_ms||b.created_at)-fdtMs(a.created_at_ms||a.created_at);return sort==='oldest'?-d:d;});
  var pending=reportsCache.filter(function(x){return (x.status||'pending')==='pending';}).length,reviewed=reportsCache.filter(function(x){return x.status==='reviewed';}).length,dismissed=reportsCache.filter(function(x){return x.status==='dismissed';}).length;
  setNavBadge('reports',pending);
  var stat=G('RSTAT');if(stat)stat.innerHTML='<div class="cst"><div class="csi"><i class="fa-solid fa-flag" style="color:#ff6b6b"></i><div><div class="csv">'+pending+'</div><div class="csl">Pending</div></div></div><div class="csi"><i class="fa-solid fa-check" style="color:#00d4b1"></i><div><div class="csv">'+reviewed+'</div><div class="csl">Reviewed</div></div></div><div class="csi"><i class="fa-solid fa-xmark" style="color:#8a86ab"></i><div><div class="csv">'+dismissed+'</div><div class="csl">Dismissed</div></div></div></div>';
  var el=G('RL');if(!el)return;if(!list.length){el.innerHTML='<div class="empty"><i class="fa-solid fa-shield-check" style="font-size:28px;display:block;margin-bottom:10px"></i>No reports match these filters.</div>';return;}
  var h='<div class="report-grid">';for(var j=0;j<list.length;j++){var r=list[j],c=r._comment||{},parsed=parseArticle(c.article_id||'');h+='<article class="report-card"><div class="report-card-head"><div><div class="report-reason"><i class="fa-solid fa-flag"></i> '+esc(r.reason||'Other')+'</div><div class="report-date">'+fdt(r.created_at_ms||r.created_at)+'</div></div><span class="sbd '+((r.status||'pending')==='reviewed'?'published':(r.status==='dismissed'?'spam':'pending'))+'">'+esc(r.status||'pending')+'</span></div>'+(r.details?'<div class="report-detail">'+esc(r.details)+'</div>':'')+'<div class="report-comment"><b>'+esc(c.name||'Anonymous')+'</b>'+esc(c.comment||'')+'</div><div class="report-meta"><a href="'+esc(parsed.url)+'" target="_blank" rel="noopener">'+esc(parsed.title)+'</a><span><i class="fa-solid fa-thumbs-up"></i> '+Number(c.likes||0)+'</span><span><i class="fa-solid fa-thumbs-down"></i> '+Number(c.dislikes||0)+'</span></div><div class="report-actions">'+((r.status||'pending')==='pending'?'<button class="bg2" data-act="report-reviewed" data-id="'+r.id+'"><i class="fa-solid fa-check"></i> Mark reviewed</button><button class="bg2" data-act="report-dismissed" data-id="'+r.id+'"><i class="fa-solid fa-xmark"></i> Dismiss</button>':'<button class="bg2" data-act="report-pending" data-id="'+r.id+'"><i class="fa-solid fa-rotate-left"></i> Reopen</button>')+'</div></article>';}
  el.innerHTML=h+'</div>';
}
var toolsCache={usage:null,likes:null};
var artsCache={views:null,likes:null};

function loadToolsPage(){toolsCache={usage:null,likes:null};G('TP_USG').innerHTML='<div style="padding:28px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i></div>';G('TP_LK').innerHTML='<div style="padding:28px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i></div>';apiCall(wr('/popular-tools?limit=1000')).then(function(d){toolsCache.usage=d.tools||[];setMetricCount('TP_USG_C',toolsCache.usage,false);renderToolsPage();}).catch(function(e){G('TP_USG').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});apiCall(wr('/tool-likes?limit=1000')).then(function(d){toolsCache.likes=d.tools||d.likes||[];setMetricCount('TP_LK_C',toolsCache.likes,true);renderToolsPage();loadNavBadges();}).catch(function(e){G('TP_LK').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});}

function renderToolsPage(){var tabs=document.querySelectorAll('#pg-tools .tab');for(var i=0;i<tabs.length;i++)tabs[i].classList.toggle('active',tabs[i].getAttribute('data-tab')===tabTools);var showUsage=tabTools==='usage',items=showUsage?toolsCache.usage:toolsCache.likes,q=G('TPS')?G('TPS').value:'',sort=G('TPSORT')?G('TPSORT').value:'high',list=filterSort(items,'tool',q,sort);G('TP_USG_W').style.display=showUsage?'block':'none';G('TP_LK_W').style.display=showUsage?'none':'block';if(items){renderRankedList(showUsage?'TP_USG':'TP_LK',list,'tool');setUpdated();}}

function loadArticlesPage(){
  artsCache={views:null,likes:null};
  G('AP_VW').innerHTML='<div style="padding:28px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  G('AP_LK').innerHTML='<div style="padding:28px;text-align:center;color:var(--dm)"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  apiCall(wr('/popular-articles?limit=1000')).then(function(d){
    var arts=(d&&d.articles)||[];populateUrlMap(arts);artsCache.views=arts;setMetricCount('AP_VW_C',artsCache.views,false);renderArticlesPage();
  }).catch(function(e){G('AP_VW').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});
  apiCall(wr('/article-likes?limit=1000')).then(function(d){
    artsCache.likes=(d&&(d.articles||d.likes))||[];setMetricCount('AP_LK_C',artsCache.likes,true);renderArticlesPage();loadNavBadges();
  }).catch(function(e){G('AP_LK').innerHTML='<div style="color:var(--dg);padding:14px">'+esc(e.message)+'</div>';});
}

function renderArticlesPage(){var tabs=document.querySelectorAll('#pg-articles .tab');for(var i=0;i<tabs.length;i++)tabs[i].classList.toggle('active',tabs[i].getAttribute('data-tab')===tabArts);var showViews=tabArts==='views',items=showViews?artsCache.views:artsCache.likes,q=G('APS')?G('APS').value:'',sort=G('APSORT')?G('APSORT').value:'high',list=filterSort(items,'article',q,sort);G('AP_VW_W').style.display=showViews?'block':'none';G('AP_LK_W').style.display=showViews?'none':'block';if(items){renderRankedList(showViews?'AP_VW':'AP_LK',list,'article');setUpdated();}}

function renderRankedList(elId,items,kind){var el=G(elId);if(!items||!items.length){el.innerHTML='<div style="padding:40px;text-align:center;color:var(--dm)">No data yet</div>';return;}var mx=Number(items[0].count||0)||1;var h='';for(var i=0;i<items.length;i++){var it=items[i];var raw=it.url||it.name||it.article_id||it.tool_id||'';var displayName,url;if(kind==='tool'){displayName=it.name||it.tool_id||raw||'Unknown';url=toolUrl(displayName);}else{var parsed=parseArticle(raw);displayName=parsed.title;url=parsed.url;}var c=Number(it.count||0);var p=Math.round(c/mx*100);h+='<div class="br"><span class="rnk">'+(i+1)+'</span><a class="bn" href="'+esc(url)+'" target="_blank" rel="noopener" title="'+esc(url)+'">'+esc(displayName)+'</a><span class="bt"><span class="bf" style="width:'+p+'%"></span></span><span class="bv">'+fmt(c)+'</span></div>';}el.innerHTML=h;}

function applyTheme(t){document.documentElement.setAttribute('data-theme',t);var i=G('TG').querySelector('i');if(i)i.className=t==='dark'?'fa-solid fa-moon':'fa-solid fa-sun';}

G('LB').addEventListener('click',doLogin);
G('UN').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();G('PW').focus();}});
G('PW').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doLogin();}});
G('TP').addEventListener('click',function(){var pw=G('PW'),ei=G('EI');if(pw.type==='password'){pw.type='text';ei.className='fa-regular fa-eye-slash';}else{pw.type='password';ei.className='fa-regular fa-eye';}});
var nis=document.querySelectorAll('.ni,.mni');for(var ii=0;ii<nis.length;ii++){(function(el){el.addEventListener('click',function(){loadPage(el.getAttribute('data-page'));});})(nis[ii]);}
var navBtns=document.querySelectorAll('[data-nav]');for(var nn=0;nn<navBtns.length;nn++){(function(el){el.addEventListener('click',function(){loadPage(el.getAttribute('data-nav'));});})(navBtns[nn]);}
G('MT').addEventListener('click',function(e){e.stopPropagation();if(window.innerWidth<=768)return;var av=G('AV'),collapsed=av.classList.toggle('sb-collapsed');try{localStorage.setItem('fwt_sidebar_collapsed',collapsed?'1':'0');}catch(x){}});
var sbBd=G('SB_BD');if(sbBd)sbBd.addEventListener('click',closeSb);
G('RB').addEventListener('click',refreshCur);
G('EXB').addEventListener('click',exportCurrent);
G('TPS').addEventListener('input',renderToolsPage);G('TPSORT').addEventListener('change',renderToolsPage);
G('APS').addEventListener('input',renderArticlesPage);G('APSORT').addEventListener('change',renderArticlesPage);
// v2.5.18: Filter toggle button — clicking shows/hides the filter row.
var ftbEl=G('FTB');if(ftbEl){ftbEl.addEventListener('click',function(){var fbr=G('FBR');if(!fbr)return;var isOpen=fbr.style.display!=='none';fbr.style.display=isOpen?'none':'flex';ftbEl.classList.toggle('active',!isOpen);});}
G('TG').addEventListener('click',function(){var cur=document.documentElement.getAttribute('data-theme')||'dark';var next=cur==='dark'?'light':'dark';applyTheme(next);try{localStorage.setItem(TH,next);}catch(e){}});
G('LGOUT').addEventListener('click',logout);
var mlogout=G('MLOGOUT');if(mlogout)mlogout.addEventListener('click',logout);
G('PP').addEventListener('click',function(){if(cPg>1){cPg--;renderComments();}});
G('NPB').addEventListener('click',function(){cPg++;renderComments();});
G('RC').addEventListener('click',function(){loadComments(1);});
G('RR').addEventListener('click',loadReports);G('RS').addEventListener('input',renderReports);G('RSF').addEventListener('change',renderReports);G('RRF').addEventListener('change',renderReports);G('RSORT').addEventListener('change',renderReports);
G('CS').addEventListener('input',function(){cPg=1;renderComments();});
G('SF').addEventListener('change',function(){cPg=1;renderComments();});
G('CFX').addEventListener('change',function(){cPg=1;renderComments();});
G('CPB').addEventListener('click',function(){var c=G('CP').value,n=G('NP2').value,x=G('CPX').value;if(!c||!n){toast('Please fill all fields','error');return;}if(n!==x){toast('New passwords do not match','error');return;}if(n.length<6){toast('New password must be at least 6 characters','error');return;}apiCall('/change-password',{method:'POST',body:JSON.stringify({oldPassword:c,newPassword:n})}).then(function(){toast('Password updated successfully!','success');G('CP').value='';G('NP2').value='';G('CPX').value='';}).catch(function(e){toast(e.message,'error');});});
G('CAB').addEventListener('click',function(){showMod('Clear All Analytics Data','<p style="color:var(--dg);margin-bottom:8px"><strong>Warning: This cannot be undone.</strong></p><p style="color:var(--dm);font-size:13px">All visits, article views, tool usage, comments, and likes will be permanently deleted.</p>',[{label:'Cancel',fn:closeMod},{label:'Yes, clear all data',cls:'bd2',fn:function(){closeMod();apiCall('/clear-all',{method:'POST'}).then(function(){toast('All data cleared successfully','success');loadOverview();}).catch(function(e){toast(e.message,'error');});}}]);});
G('MC').addEventListener('click',closeMod);
G('MO').addEventListener('click',function(e){if(e.target===this)closeMod();});
G('FBS').addEventListener('click',function(e){var btn=e.target.closest?e.target.closest('.fb[data-p]'):null;if(!btn)return;var fbs=document.querySelectorAll('.fbs .fb');for(var i=0;i<fbs.length;i++)fbs[i].classList.remove('active');btn.classList.add('active');presetRng(btn.getAttribute('data-p'));});
G('AFC').addEventListener('click',function(){var f=G('FF').value,t=G('FT').value;if(!f){toast('Please select a start date','error');return;}var fbs=document.querySelectorAll('.fbs .fb');for(var i=0;i<fbs.length;i++)fbs[i].classList.remove('active');setRng(f,t||f);});

try{applyTheme(localStorage.getItem(TH)||'dark');}catch(e){applyTheme('dark');}
try{var saved=localStorage.getItem(TK);if(saved){token=saved;showApp();}else{showLogin();}}catch(e){showLogin();}

})();`;
