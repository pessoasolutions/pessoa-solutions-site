
(function(){
'use strict';
var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var touch = window.matchMedia('(hover:none)').matches;
var lerp = function(a,b,t){return a+(b-a)*t;};
var clamp = function(v,a,b){return Math.max(a,Math.min(b,v));};
/* ---------- THEME JOUR / NUIT ---------- */
var THEME_KEY='ps-theme', root=document.documentElement;
function store(v){ try{ localStorage.setItem(THEME_KEY,v); }catch(e){} }
function read(){ try{ return localStorage.getItem(THEME_KEY); }catch(e){ return null; } }
function applyTheme(t){
root.setAttribute('data-theme',t);
var tt=document.getElementById('tt');
if(tt) tt.setAttribute('aria-label', t==='dark'?'Basculer en mode jour':'Basculer en mode nuit');
var meta=document.querySelector('meta[name=theme-color]');
if(meta) meta.setAttribute('content', t==='dark'?'#070C15':'#FFFFFF');
if(window.__psTheme) window.__psTheme(t);
}
var saved=read();
applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(e){
if(!read()) applyTheme(e.matches?'dark':'light');
});
document.addEventListener('click',function(e){
var t=e.target.closest('#tt'); if(!t) return;
var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
store(next);
if(document.startViewTransition && !RM){
var r=t.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
var rad=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
var vt=document.startViewTransition(function(){applyTheme(next);});
vt.ready.then(function(){
document.documentElement.animate(
{clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+rad+'px at '+x+'px '+y+'px)']},
{duration:620,easing:'cubic-bezier(.16,1,.3,1)',pseudoElement:'::view-transition-new(root)'});
});
} else { applyTheme(next); }
});
/* ---------- PRELOADER ---------- */
var pre=document.getElementById('pre'),preNum=document.getElementById('preNum'),preBar=document.getElementById('preBar');
var p=0, t0=performance.now();
function loadTick(now){
var d=Math.min((now-t0)/1250,1);
p=Math.round((1-Math.pow(1-d,3))*100);
preNum.textContent=p; preBar.style.width=p+'%';
if(d<1){requestAnimationFrame(loadTick);} else {setTimeout(start,220);}
}
requestAnimationFrame(loadTick);
function start(){
pre.classList.add('done');
document.documentElement.classList.add('ready');
document.body.classList.add('ready');
setTimeout(function(){pre.style.display='none';},1100);
scramble();
if(canvasReady) document.getElementById('psCanvas').classList.add('in');
}
/* ---------- TEXT SCRAMBLE ---------- */
function scramble(){
var el=document.getElementById('scramble'); if(!el) return; var fin=el.textContent, chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&', i=0;
if(RM) return;
var id=setInterval(function(){
el.textContent=fin.split('').map(function(c,k){
if(k<i) return c;
if(c===' ') return ' ';
return chars[Math.floor(Math.random()*chars.length)];
}).join('');
i+=1.1;
if(i>=fin.length){clearInterval(id);el.textContent=fin;}
},26);
}
/* ---------- SMOOTH SCROLL (desktop only) ---------- */
var target=window.scrollY, current=window.scrollY, smoothing=!touch && !RM;
if(smoothing){
window.addEventListener('wheel',function(e){
if(document.body.classList.contains('lock')) return;
if(Math.abs(e.deltaX)>Math.abs(e.deltaY) && e.target.closest && e.target.closest('#htrack')) return;
e.preventDefault();
target=clamp(target+e.deltaY*(e.deltaMode===1?26:1),0,document.body.scrollHeight-window.innerHeight);
},{passive:false});
window.addEventListener('keydown',function(){target=window.scrollY;});
}
var applied=-1;
function syncScroll(){
if(!smoothing) return;
if(applied>=0 && Math.abs(window.scrollY-applied)>2){ target=window.scrollY; current=window.scrollY; }
current=lerp(current,target,0.11);
if(Math.abs(current-target)<0.4) current=target;
window.scrollTo(0,current);
applied=window.scrollY;
}
function jumpTo(y){
target=clamp(y,0,document.body.scrollHeight-window.innerHeight);
if(!smoothing){window.scrollTo({top:target,behavior:'smooth'});}
}
document.querySelectorAll('a[href^="#"]').forEach(function(a){
a.addEventListener('click',function(e){
var el=document.querySelector(a.getAttribute('href'));
if(!el) return; e.preventDefault();
closeSheet();
jumpTo(el.getBoundingClientRect().top+window.scrollY-(a.getAttribute('href')==='#top'?0:(window.innerWidth<720?76:84)));
});
});
/* ---------- SPLIT WORDS + REVEAL ---------- */
document.querySelectorAll('.rev').forEach(function(el){
var html=el.innerHTML.split('<br>').map(function(line){
return line.trim().split(/\s+/).map(function(w){return '<span class="w"><i>'+w+'</i></span>';}).join(' ');
}).join('<br>');
el.innerHTML=html;
el.querySelectorAll('.w>i').forEach(function(i,k){i.style.transitionDelay=(k*0.045)+'s';});
});
var io=new IntersectionObserver(function(es){
es.forEach(function(e){ if(e.isIntersecting){e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:0.18,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rev,.fade').forEach(function(el){io.observe(el);});
/* ---------- MAGNETIC BUTTONS ---------- */
if(!touch && !RM){
document.querySelectorAll('.mag').forEach(function(m){
var el=m.firstElementChild, tx=0,ty=0,cx=0,cy=0,active=false;
m.addEventListener('mouseenter',function(){active=true;});
m.addEventListener('mousemove',function(e){
var r=m.getBoundingClientRect();
tx=(e.clientX-(r.left+r.width/2))*0.32; ty=(e.clientY-(r.top+r.height/2))*0.42;
});
m.addEventListener('mouseleave',function(){tx=0;ty=0;active=false;});
(function loop(){ cx=lerp(cx,tx,0.16); cy=lerp(cy,ty,0.16);
el.style.transform='translate3d('+cx.toFixed(2)+'px,'+cy.toFixed(2)+'px,0)';
requestAnimationFrame(loop);})();
});
/* spotlight coords */
document.querySelectorAll('.spot,.spanel').forEach(function(c){
c.addEventListener('mousemove',function(e){
var r=c.getBoundingClientRect();
c.style.setProperty('--mx',(e.clientX-r.left)+'px');
c.style.setProperty('--my',(e.clientY-r.top)+'px');
});
});
}
/* ---------- NAV ---------- */
var nav=document.getElementById('nav'),lastY=0,burger=document.getElementById('burger'),sheet=document.getElementById('sheet');
var darkZones=[].slice.call(document.querySelectorAll('.hpin, footer'));
function closeSheet(){burger.classList.remove('on');sheet.classList.remove('on');document.body.classList.remove('lock');nav.classList.remove('inv');}
burger.addEventListener('click',function(){
var on=!sheet.classList.contains('on');
sheet.classList.toggle('on',on); burger.classList.toggle('on',on); document.body.classList.toggle('lock',on);
nav.classList.toggle('inv',on); if(on) nav.classList.remove('up');
sheet.querySelectorAll('a.big').forEach(function(a,i){a.style.transitionDelay=(on?0.12+i*0.06:0)+'s';});
});
/* ---------- MARQUEE ---------- */
var marq=document.getElementById('marq');
if(marq) marq.innerHTML+=marq.innerHTML;
var mx=0;
/* ---------- CARROUSEL DES SERVICES : GLISSER A LA SOURIS ---------- */
var htrack=document.getElementById('htrack'), hbar=document.getElementById('hbar'), hthumb=document.getElementById('hthumb');
var hprev=document.getElementById('hprev'), hnext=document.getElementById('hnext'), hhint=document.getElementById('hhint');
(function(){
if(!htrack||!hbar||!hthumb||!hprev||!hnext) return;
function maxScroll(){ return Math.max(htrack.scrollWidth-htrack.clientWidth,0); }
function step(){ var p=htrack.querySelector('.spanel'); return p? p.offsetWidth+parseFloat(getComputedStyle(htrack).gap||24) : 340; }
function paint(){
var max=maxScroll();
var ratio=max>0? htrack.clientWidth/htrack.scrollWidth : 1;
var w=Math.max(ratio*100,10);
hthumb.style.width=w+'%';
hthumb.style.left=(max>0? (htrack.scrollLeft/max)*(100-w) : 0)+'%';
hprev.disabled=htrack.scrollLeft<=2;
hnext.disabled=htrack.scrollLeft>=max-2;
hbar.style.display=max>0?'':'none';
if(hhint) hhint.style.display=max>0?'':'none';
}
htrack.addEventListener('scroll',paint,{passive:true});
window.addEventListener('resize',paint);
setTimeout(paint,60); setTimeout(paint,600);
/* glisser les cartes */
var down=false,startX=0,startL=0,moved=0;
htrack.addEventListener('pointerdown',function(e){
if(e.button!==0) return;
down=true; moved=0; startX=e.clientX; startL=htrack.scrollLeft;
htrack.setPointerCapture(e.pointerId);
});
htrack.addEventListener('pointermove',function(e){
if(!down) return;
var dx=e.clientX-startX;
if(Math.abs(dx)>4 && !htrack.classList.contains('grabbing')) htrack.classList.add('grabbing');
if(htrack.classList.contains('grabbing')){ moved=Math.abs(dx); htrack.scrollLeft=startL-dx; }
});
function endDrag(e){
if(!down) return;
down=false;
try{ htrack.releasePointerCapture(e.pointerId); }catch(err){}
setTimeout(function(){ htrack.classList.remove('grabbing'); },0);
}
htrack.addEventListener('pointerup',endDrag);
htrack.addEventListener('pointercancel',endDrag);
htrack.addEventListener('click',function(e){ if(moved>6){ e.preventDefault(); e.stopPropagation(); moved=0; } },true);
/* glisser la barre doree */
var bdown=false;
function fromBar(clientX){
var r=hbar.getBoundingClientRect();
var tw=hthumb.offsetWidth;
var pos=(clientX-r.left-tw/2)/Math.max(r.width-tw,1);
htrack.scrollLeft=Math.min(Math.max(pos,0),1)*maxScroll();
}
hbar.addEventListener('pointerdown',function(e){
bdown=true; hbar.classList.add('drag'); hbar.setPointerCapture(e.pointerId);
htrack.style.scrollBehavior='auto'; fromBar(e.clientX); e.preventDefault();
});
hbar.addEventListener('pointermove',function(e){ if(bdown) fromBar(e.clientX); });
function endBar(e){
if(!bdown) return;
bdown=false; hbar.classList.remove('drag');
try{ hbar.releasePointerCapture(e.pointerId); }catch(err){}
htrack.style.scrollBehavior='';
}
hbar.addEventListener('pointerup',endBar);
hbar.addEventListener('pointercancel',endBar);
/* fleches */
hprev.addEventListener('click',function(){ htrack.scrollBy({left:-step(),behavior:'smooth'}); });
hnext.addEventListener('click',function(){ htrack.scrollBy({left:step(),behavior:'smooth'}); });
})();
/* ---------- STICKY STACK ---------- */
var cards=[].slice.call(document.querySelectorAll('#stack .card'));
cards.forEach(function(c,i){ c.style.top=(110+i*16)+'px'; c.style.zIndex=i+1; c.style.marginBottom='26px'; });
/* ---------- CANVAS PARTICLE MONOGRAM ---------- */
var canvasReady=false;
(function(){
var cv=document.getElementById('psCanvas'); if(!cv||!document.getElementById('monoSrc')) return;
var ctx=cv.getContext('2d'), pts=[], dpr=Math.min(devicePixelRatio||1,2);
var PAL=['10,31,68','11,90,117'];
window.__psTheme=function(t){ PAL = t==='dark' ? ['246,250,254','116,206,232'] : ['10,31,68','11,90,117']; };
window.__psTheme(document.documentElement.getAttribute('data-theme')||'light');
var mouse={x:-9999,y:-9999};
var img=new Image(); img.src=document.getElementById('monoSrc').src;
function build(){
var w=cv.clientWidth,h=cv.clientHeight;
cv.width=w*dpr; cv.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
var scale=Math.min(h*0.72/img.height, w*0.72/img.width);
var iw=img.width*scale, ih=img.height*scale, ox=(w-iw)/2, oy=(h-ih)/2;
var oc=document.createElement('canvas'); oc.width=Math.max(1,Math.floor(iw)); oc.height=Math.max(1,Math.floor(ih));
var octx=oc.getContext('2d'); octx.drawImage(img,0,0,oc.width,oc.height);
var d=octx.getImageData(0,0,oc.width,oc.height).data, step=Math.max(3,Math.round(oc.width/168));
pts=[];
for(var y=0;y<oc.height;y+=step){ for(var x=0;x<oc.width;x+=step){
var i=(y*oc.width+x)*4, a=d[i+3], lum=(d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114);
if(a>60 && lum<210){
pts.push({tx:ox+x,ty:oy+y,
x:ox+x+(Math.random()-.5)*w*0.8, y:oy+y+(Math.random()-.5)*h*0.8,
vx:0,vy:0, r:1.1+Math.random()*1.4,
dark: lum<90,
o: 0.52+Math.random()*0.4});
}
}}
if(pts.length>5400){ pts=pts.filter(function(_,i){return i%2===0;}); }
}
function frame(){
if(!pts.length) return;
var w=cv.clientWidth,h=cv.clientHeight;
ctx.clearRect(0,0,w,h);
for(var i=0;i<pts.length;i++){
var p=pts[i];
var dx=p.tx-p.x, dy=p.ty-p.y;
p.vx=(p.vx+dx*0.008)*0.90; p.vy=(p.vy+dy*0.008)*0.90;
var mdx=p.x-mouse.x, mdy=p.y-mouse.y, dist=mdx*mdx+mdy*mdy;
if(dist<14000){ var f=(14000-dist)/14000*2.4, d2=Math.sqrt(dist)||1;
p.vx+=mdx/d2*f; p.vy+=mdy/d2*f; }
p.x+=p.vx; p.y+=p.vy;
ctx.fillStyle='rgba('+(p.dark?PAL[0]:PAL[1])+','+p.o+')';
ctx.fillRect(p.x,p.y,p.r,p.r);
}
}
img.onload=function(){ try{ build(); }catch(e){ return; } canvasReady=true; if(document.body.classList.contains('ready')) cv.classList.add('in'); };
window.addEventListener('resize',function(){ if(canvasReady) build(); });
if(!touch){ window.addEventListener('mousemove',function(e){
var r=cv.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; });}
window.__psFrame=function(){ if(!RM) frame(); };
})();
/* ---------- MAIN RAF ---------- */
var prog=document.getElementById('prog'), heroEl=document.getElementById('top');
window.addEventListener('resize',function(){target=window.scrollY;current=window.scrollY;});
function tick(){
syncScroll();
var y=window.scrollY, vh=window.innerHeight;
var max=document.body.scrollHeight-vh;
if(prog) prog.style.transform='scaleX('+(max>0?y/max:0)+')';
/* nav */
nav.classList.toggle('solid', y>40 && !sheet.classList.contains('on'));
var navH=window.innerWidth<720?76:84, zd=false;
for(var zi=0;zi<darkZones.length;zi++){ var zr=darkZones[zi].getBoundingClientRect(); if(zr.top<=navH && zr.bottom>=0){ zd=true; break; } }
nav.classList.toggle('zdark', zd && !sheet.classList.contains('on'));
lastY=y;
/* marquee */
if(marq){ mx-=0.42; if(mx<=-marq.scrollWidth/2) mx=0;
marq.style.transform='translate3d('+mx.toFixed(1)+'px,0,0)'; }
/* hero parallax */
var hg=heroEl?heroEl.querySelector('.hero-grid'):null;
if(hg && y<vh){ hg.style.transform='translate3d(0,'+(y*0.14).toFixed(1)+'px,0)';
hg.style.opacity=(1-y/vh*0.85).toFixed(3); }
if(window.__psFrame) window.__psFrame();
requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
/* ---------- FORM ---------- */
var form=document.getElementById('form');
function fldOf(el){return el.closest('.fld');}
document.querySelectorAll('.fld input,.fld textarea,.fld select').forEach(function(el){
var f=fldOf(el);
el.addEventListener('focus',function(){f.classList.add('focus','up');});
el.addEventListener('blur',function(){ f.classList.remove('focus'); if(!el.value) f.classList.remove('up'); validate(el,true); });
el.addEventListener('input',function(){ if(el.value) f.classList.add('up'); if(f.classList.contains('err')) validate(el,true); });
});
function validate(el,mark){
var f=fldOf(el), ok=true;
if(el.hasAttribute('required') && !el.value.trim()) ok=false;
if(el.type==='email' && el.value && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(el.value)) ok=false;
if(mark) f.classList.toggle('err',!ok);
return ok;
}
if(form) form.addEventListener('submit',function(e){
e.preventDefault();
var fields=[].slice.call(form.querySelectorAll('[required]')), ok=true, first=null;
fields.forEach(function(el){ if(!validate(el,true)){ok=false; if(!first) first=el;} });
if(!ok){ first.focus(); return; }
var d=new FormData(form);
var btn=document.getElementById('send'), lab=btn.querySelector('span:not(.fill)');
var out=document.getElementById('sent');
var initial=lab.textContent;
lab.textContent='Envoi en cours';
btn.disabled=true;
var payload={};
d.forEach(function(v,k){ payload[k]=v; });
fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})
.then(function(r){ return r.json().catch(function(){ return {success:r.ok}; }); })
.then(function(res){
if(res && (res.success===true || res.success==='true')){
form.querySelectorAll('input,textarea').forEach(function(el){ if(el.type!=='hidden'){ el.value=''; var f=el.closest('.fld'); if(f) f.classList.remove('up'); } });
out.textContent='Votre demande est bien partie. Vous recevrez une réponse sous 24 h ouvrées.';
out.classList.add('on');
lab.textContent='Demande envoyée';
} else { throw new Error('refus'); }
})
.catch(function(){
var body='Nom : '+d.get('nom')+'\nPrénom : '+d.get('prenom')+'\nE-mail : '+d.get('email')
+'\nTéléphone : '+(d.get('tel')||'non renseigné')+'\nType de demande : '+d.get('type')+'\n\n'+d.get('message');
window.location.href='mailto:pessoasolutions@gmail.com?subject='
+encodeURIComponent('Demande : '+d.get('type')+' / '+d.get('prenom')+' '+d.get('nom'))
+'&body='+encodeURIComponent(body);
out.textContent="L'envoi direct n'a pas abouti, votre messagerie prend le relais avec la demande pré-remplie.";
out.classList.add('on');
lab.textContent=initial;
btn.disabled=false;
});
});
var yrEl=document.getElementById('yr'); if(yrEl) yrEl.textContent=new Date().getFullYear();
})();

/* menu services : ouverture au survol tolerante et au clic */
(function(){
  var w=document.querySelector('.ddwrap'); if(!w) return;
  var t=null;
  function open(){ clearTimeout(t); w.classList.add('open'); }
  function close(){ clearTimeout(t); t=setTimeout(function(){ w.classList.remove('open'); },260); }
  w.addEventListener('mouseenter',open);
  w.addEventListener('mouseleave',close);
  var head=w.querySelector('a');
  if(head) head.addEventListener('click',function(e){
    if(window.matchMedia('(max-width:1080px)').matches) return;
    if(!w.classList.contains('open')){ e.preventDefault(); open(); }
  });
  document.addEventListener('click',function(e){ if(!w.contains(e.target)) w.classList.remove('open'); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') w.classList.remove('open'); });
})();

/* compteurs animes */
(function(){
  var els=[].slice.call(document.querySelectorAll('[data-count]'));
  if(!els.length) return;
  function run(el){
    var target=parseFloat(el.getAttribute('data-count'))||0, suf=el.getAttribute('data-suffix')||'';
    if(target===0){ el.textContent='0'+suf; return; }
    var t0=null, dur=1100;
    function step(ts){
      if(!t0) t0=ts;
      var p=Math.min((ts-t0)/dur,1), e=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*e)+suf;
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ run(e.target); io.unobserve(e.target); } });
  },{threshold:.6});
  els.forEach(function(e){ io.observe(e); });
})();

/* halo au survol sur les cartes des pages interieures */
(function(){
  var cards=document.querySelectorAll('.deliv > div,.work,.ogrid a,.faq details,.stack .card');
  cards.forEach(function(c){
    c.classList.add('glow');
    c.addEventListener('pointermove',function(e){
      var r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');
      c.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
  });
})();
