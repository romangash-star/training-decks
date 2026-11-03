(function(){
var RM=function(){return matchMedia('(prefers-reduced-motion: reduce)').matches};
var THREE_URL='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
var threeP=null;function getThree(){return threeP||(threeP=import(THREE_URL));}
function isActive(el){var s=el.closest('section');return !!(s&&s.hasAttribute('data-deck-active'));}

/* ---------- <wow-3d kind="globe|cube|network" tone="dark|light"> ---------- */
class Wow3D extends HTMLElement{
  connectedCallback(){this.style.display='block';this.style.pointerEvents='none';if(!this._sr)this._sr=this.shadowRoot||this.attachShadow({mode:'open'});if(isActive(this))this.start();}
  disconnectedCallback(){this.stop();}
  async start(){
    if(this._run||RM())return;this._run=true;
    var T;try{T=await getThree();}catch(e){this._run=false;return;}
    if(!this._run||this._r)return;
    var w=this.offsetWidth||600,h=this.offsetHeight||600;
    var r=new T.WebGLRenderer({alpha:true,antialias:true});
    r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.setSize(w,h,false);
    r.domElement.style.cssText='width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s ease';
    this._sr.appendChild(r.domElement);requestAnimationFrame(function(){r.domElement.style.opacity='1'});
    var scene=new T.Scene(),cam=new T.PerspectiveCamera(40,w/h,.1,100);cam.position.set(0,0,7.2);
    var dark=(this.getAttribute('tone')||'dark')==='dark';
    var C1=new T.Color(dark?'#A9D3CC':'#2F6E68'),C2=new T.Color('#D99A2B'),C3=new T.Color(dark?'#DCEDEA':'#1F5F5B');
    var g=new T.Group();scene.add(g);var kind=this.getAttribute('kind')||'globe';var upd=null;
    if(kind==='globe'){
      var N=1600,pos=new Float32Array(N*3),hot=[];
      for(var i=0;i<N;i++){var y=1-(i/(N-1))*2,rr=Math.sqrt(1-y*y),th=i*2.39996;pos[i*3]=Math.cos(th)*rr*2.3;pos[i*3+1]=y*2.3;pos[i*3+2]=Math.sin(th)*rr*2.3;if(i%61===0)hot.push(i);}
      var gm=new T.BufferGeometry();gm.setAttribute('position',new T.BufferAttribute(pos,3));
      g.add(new T.Points(gm,new T.PointsMaterial({color:C1,size:.035,transparent:true,opacity:.85})));
      var hp=new Float32Array(hot.length*3);hot.forEach(function(k,j){hp[j*3]=pos[k*3]*1.01;hp[j*3+1]=pos[k*3+1]*1.01;hp[j*3+2]=pos[k*3+2]*1.01;});
      var hg=new T.BufferGeometry();hg.setAttribute('position',new T.BufferAttribute(hp,3));
      var hm=new T.PointsMaterial({color:C2,size:.11,transparent:true,opacity:.95});g.add(new T.Points(hg,hm));
      for(var k=0;k<3;k++){var ring=new T.Mesh(new T.TorusGeometry(2.75+k*.32,.006,6,180),new T.MeshBasicMaterial({color:k?C1:C2,transparent:true,opacity:k?.25:.55}));ring.rotation.x=Math.PI/2+.35*(k-1);ring.rotation.y=.4*k;g.add(ring);}
      g.rotation.z=.32;
      upd=function(t){g.rotation.y=t*.12;hm.size=.09+Math.sin(t*2)*.03;};
    }else if(kind==='cube'){
      var n=5,s=.42,gap=.62,geo=new T.BoxGeometry(s,s,s),edges=new T.EdgesGeometry(geo),cells=[];
      for(var x=0;x<n;x++)for(var yy=0;yy<n;yy++)for(var z=0;z<n;z++){
        var on=((x*7+yy*3+z*11)%9===0);
        var m=on?new T.Mesh(geo,new T.MeshBasicMaterial({color:C2,transparent:true,opacity:.9})):new T.LineSegments(edges,new T.LineBasicMaterial({color:C1,transparent:true,opacity:.45}));
        m.position.set((x-2)*gap,(yy-2)*gap,(z-2)*gap);m.userData.p=x+yy+z;g.add(m);cells.push(m);}
      g.rotation.x=.5;
      upd=function(t){g.rotation.y=t*.18;g.rotation.x=.5+Math.sin(t*.3)*.12;cells.forEach(function(c){var k=1+Math.sin(t*1.6-c.userData.p*.5)*.14;c.scale.setScalar(k);});};
    }else{
      var M=70,pts=[],pp=new Float32Array(M*3);
      for(var a=0;a<M;a++){var v=new T.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(1.2+Math.random()*1.4);pts.push(v);pp[a*3]=v.x;pp[a*3+1]=v.y;pp[a*3+2]=v.z;}
      var lp=[];for(var a2=0;a2<M;a2++)for(var b=a2+1;b<M;b++)if(pts[a2].distanceTo(pts[b])<1.05)lp.push(pts[a2].x,pts[a2].y,pts[a2].z,pts[b].x,pts[b].y,pts[b].z);
      var lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(lp,3));
      g.add(new T.LineSegments(lg,new T.LineBasicMaterial({color:C1,transparent:true,opacity:.35})));
      var ng=new T.BufferGeometry();ng.setAttribute('position',new T.BufferAttribute(pp,3));
      g.add(new T.Points(ng,new T.PointsMaterial({color:C3,size:.09,transparent:true,opacity:.95})));
      var core=new T.Mesh(new T.IcosahedronGeometry(.55,1),new T.MeshBasicMaterial({color:C2,wireframe:true,transparent:true,opacity:.8}));g.add(core);
      upd=function(t){g.rotation.y=t*.14;g.rotation.x=Math.sin(t*.25)*.2;core.rotation.y=-t*.5;core.rotation.x=t*.3;};
    }
    var t0=performance.now(),self=this;
    function loop(now){if(!self._run)return;upd((now-t0)/1000);r.render(scene,cam);self._raf=requestAnimationFrame(loop);}
    this._r=r;this._scene=scene;this._raf=requestAnimationFrame(loop);
  }
  stop(){
    this._run=false;cancelAnimationFrame(this._raf);
    if(this._r){var r=this._r;this._r=null;
      this._scene&&this._scene.traverse(function(o){o.geometry&&o.geometry.dispose();o.material&&o.material.dispose();});
      r.dispose();try{r.forceContextLoss();}catch(e){}r.domElement.remove();}
  }
}
if(!customElements.get('wow-3d'))customElements.define('wow-3d',Wow3D);

/* ---------- <ai-typing prompt="…" answer="…" tool="…"> ---------- */
class AiTyping extends HTMLElement{
  connectedCallback(){
    if(this._b)return;this._b=true;this.style.display='block';
    var R=this._sr=this.shadowRoot||this.attachShadow({mode:'open'});
    R.innerHTML='<div style="height:100%;display:flex;flex-direction:column;background:#FFFDF8;border:1px solid #E3D8C6;border-radius:22px;box-shadow:0 18px 60px rgba(31,95,91,.18);overflow:hidden;font-family:Alef,sans-serif;direction:rtl;">'+
      '<div style="flex-shrink:0;height:64px;display:flex;align-items:center;gap:14px;padding:0 26px;background:#F2EADC;border-bottom:1px solid #E3D8C6;"><span style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#1F5F5B,#A9D3CC);"></span><span style="font-size:28px;font-weight:700;color:#2A211B;">'+(this.getAttribute('tool')||'Copilot / Gemini')+'</span></div>'+
      '<div data-body style="flex:1;min-height:0;display:flex;flex-direction:column;gap:26px;padding:34px 34px;overflow:hidden;">'+
        '<div data-u style="align-self:flex-start;max-width:88%;background:#1F5F5B;color:#FFFDF8;border-radius:22px 22px 6px 22px;padding:22px 28px;font-size:29px;line-height:1.5;min-height:46px;white-space:pre-wrap;"></div>'+
        '<div data-dots style="align-self:flex-end;display:none;gap:10px;padding:18px 24px;background:#F2EADC;border-radius:20px;"></div>'+
        '<div data-a style="align-self:flex-end;max-width:94%;color:#2A211B;font-size:29px;line-height:1.55;white-space:pre-wrap;display:none;background:#DCEDEA;border-radius:22px 22px 22px 6px;padding:22px 28px;"></div>'+
      '</div>'+
      '<div style="flex-shrink:0;margin:0 26px 22px;height:62px;border:1px solid #E3D8C6;border-radius:31px;display:flex;align-items:center;padding:0 26px;font-size:26px;color:#6B5D52;">כתבו הודעה…</div></div>';
    var d=R.querySelector('[data-dots]');for(var i=0;i<3;i++){var s=document.createElement('span');s.style.cssText='width:14px;height:14px;border-radius:50%;background:#1F5F5B;opacity:.3';d.appendChild(s);}
    this.addEventListener('click',()=>this.play());
    if(isActive(this))this.play();
  }
  reset(){clearTimeout(this._t);this._gen=(this._gen||0)+1;var R=this._sr;if(!R)return;var u=R.querySelector('[data-u]');if(!u)return;u.textContent='';R.querySelector('[data-a]').style.display='none';R.querySelector('[data-a]').textContent='';R.querySelector('[data-dots]').style.display='none';}
  play(){
    this.reset();var R=this._sr;if(!R)return;var gen=this._gen,self=this,u=R.querySelector('[data-u]'),a=R.querySelector('[data-a]'),d=R.querySelector('[data-dots]');
    var P=(this.getAttribute('prompt')||'').replace(/\\n/g,'\n'),A=(this.getAttribute('answer')||'').replace(/\\n/g,'\n');
    if(RM()){u.textContent=P;a.style.display='block';a.textContent=A;return;}
    var i=0,caret='▍';
    function typeP(){if(gen!==self._gen)return;i++;u.textContent=P.slice(0,i)+(i<P.length?caret:'');if(i<P.length)self._t=setTimeout(typeP,P[i-1]===' '?42:24);else self._t=setTimeout(think,500);}
    function think(){if(gen!==self._gen)return;d.style.display='flex';var k=0;var dots=d.children;
      (function blink(){if(gen!==self._gen)return;for(var j=0;j<3;j++)dots[j].style.opacity=(j===k%3)?'1':'.3';k++;if(k<9)self._t=setTimeout(blink,220);else{d.style.display='none';stream();}})();}
    var words=A.split(/(\s+)/),w=0;
    function stream(){if(gen!==self._gen)return;a.style.display='block';w++;a.textContent=words.slice(0,w).join('')+(w<words.length?caret:'');if(w<words.length)self._t=setTimeout(stream,/\n/.test(words[w-1])?160:55);}
    this._t=setTimeout(typeP,600);
  }
}
if(!customElements.get('ai-typing'))customElements.define('ai-typing',AiTyping);

/* ---------- smooth crossfade transitions + ambient layer ---------- */
(function(){var st=document.createElement('style');st.textContent=
'@keyframes wfxDrift{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-6%,4%,0) scale(1.08)}}'+
'@keyframes wfxDrift2{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(5%,-5%,0)}}';
document.head.appendChild(st);})();
function lum(c){var m=c.match(/[\d.]+/g);if(!m||(m[3]!==undefined&&+m[3]===0))return 1;return (.299*m[0]+.587*m[1]+.114*m[2])/255;}
function ambient(s){
  if(s._wfx)return;s._wfx=true;
  var dark=lum(getComputedStyle(s).backgroundColor)<.45;
  s.style.isolation='isolate';
  var L=document.createElement('div');L.setAttribute('data-wfx','');L.setAttribute('aria-hidden','true');
  L.style.cssText='position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden;';
  var dot=dark?'rgba(169,211,204,.10)':'rgba(31,95,91,.07)',acc=dark?'#A9D3CC':'#1F5F5B';
  var g1=dark?'rgba(169,211,204,.14)':'rgba(169,211,204,.28)',g2='rgba(217,154,43,.11)';
  L.innerHTML=
   '<div style="position:absolute;inset:0;background-image:radial-gradient('+dot+' 1.6px,transparent 1.7px);background-size:44px 44px;-webkit-mask-image:radial-gradient(ellipse 60% 55% at 12% 88%,#000,transparent 70%);mask-image:radial-gradient(ellipse 60% 55% at 12% 88%,#000,transparent 70%);"></div>'+
   '<div style="position:absolute;width:60%;height:90%;left:-18%;bottom:-42%;border-radius:50%;background:radial-gradient(closest-side,'+g1+',transparent);animation:wfxDrift 24s ease-in-out infinite;"></div>'+
   '<div style="position:absolute;width:42%;height:70%;right:-12%;top:-32%;border-radius:50%;background:radial-gradient(closest-side,'+g2+',transparent);animation:wfxDrift2 30s ease-in-out infinite;"></div>'+
   '<div data-wfx-bar style="position:absolute;left:0;bottom:0;height:4px;width:100%;transform-origin:right center;transform:scaleX(0);background:linear-gradient(270deg,#D99A2B,'+acc+');opacity:.8;transition:transform 900ms cubic-bezier(.22,.8,.24,1);"></div>'+
   '<div data-wfx-sweep style="position:absolute;inset:-10%;opacity:0;background:linear-gradient(105deg,transparent 42%,'+(dark?'rgba(220,237,234,.08)':'rgba(255,253,248,.5)')+' 50%,transparent 58%);"></div>';
  s.appendChild(L);
}
function vis(el){var cs=getComputedStyle(el);return cs.display!=='none'&&cs.position!=='absolute'&&cs.position!=='fixed';}
function hasHead(el){if(el.matches('h1,h2,h3'))return true;var h=el.querySelector('h1,h2,h3');return !!h&&getComputedStyle(h).display!=='none';}
function hasMedia(el){return /^(IMG|SVG|CANVAS|VIDEO|IFRAME|WOW-3D)$/i.test(el.tagName)||!!el.querySelector('img,svg,canvas,video,iframe,wow-3d');}
function autoFrag(s){
  if(s._wfxFrag)return;s._wfxFrag=true;
  s.removeAttribute('data-reveal-body');
  s.querySelectorAll('h1[data-fragment],h2[data-fragment]').forEach(function(h){h.removeAttribute('data-fragment');h.style.opacity='';h.style.transform='';});
  var authored=s.__wfxAuthored;
  if(!authored){s.querySelectorAll('[data-fragment]').forEach(function(e){e.removeAttribute('data-fragment');e.removeAttribute('data-frag-shown');e.style.opacity='';e.style.transform='';e.style.pointerEvents='';e.style.transition='';});}
  if(authored){s.querySelectorAll('[data-fragment]').forEach(function(e){e.style.animation='none';});return;}
  if(s.hasAttribute('data-no-auto-reveal'))return;
  var box=s,kids,hi=-1,guard=0;
  while(guard++<4){
    kids=[].filter.call(box.children,function(k){return !k.hasAttribute('data-wfx')&&!/^(SCRIPT|STYLE|TEMPLATE)$/.test(k.tagName);});
    hi=-1;for(var i=0;i<kids.length;i++){if(getComputedStyle(kids[i]).display!=='none'&&hasHead(kids[i])){hi=i;break;}}
    if(hi<0)return;
    var hk=kids[hi];
    if(hk.matches('h1,h2,h3'))break;
    var flow=kids.filter(vis);
    if(flow.length===1&&flow[0]===hk&&hk.children.length>1){box=hk;continue;}
    var hc=[].filter.call(hk.children,vis);
    if(flow.length===1&&hc.length>1){box=hk;continue;}
    break;
  }
  var n=0;
  function mark(el){if(!el.textContent.trim()&&!hasMedia(el))return;el.style.animation='none';el.setAttribute('data-fragment',String(++n));}
  function body(list,depth){
    list=list.filter(function(k){return vis(k)&&!k.hasAttribute('data-om-subtitle')&&(k.textContent.trim()||hasMedia(k));});
    list.forEach(function(k){
      var cs=getComputedStyle(k),ch=[].filter.call(k.children,vis);
      var row=cs.display.indexOf('grid')>=0||(cs.display.indexOf('flex')>=0&&cs.flexDirection.indexOf('row')===0);
      var media=/^(IFRAME|WOW-3D|AI-TYPING|IMG|SVG|CANVAS|VIDEO)$/i.test(k.tagName);
      if(!media&&row&&ch.length>=2&&ch.length<=12)ch.forEach(mark);
      else if(!media&&depth<2&&list.length===1&&ch.length>=2)body(ch,depth+1);
      else mark(k);
    });
  }
  body(kids.slice(hi+1),0);
}
function prep(){
  document.querySelectorAll('deck-stage > section').forEach(function(s){
    if(s.__wfxAuthored===undefined)s.__wfxAuthored=!s.hasAttribute('data-reveal-body')&&!!s.querySelector('[data-fragment]');
  });
}
prep();document.addEventListener('DOMContentLoaded',prep);
customElements.whenDefined('deck-stage').then(function(){var C=customElements.get('deck-stage');if(C&&C.prototype._ensureAutoBody)C.prototype._ensureAutoBody=function(){};});
function stage(){return document.querySelector('deck-stage');}
var DUR=420,leaving=null,leaveT=0;
function clearLeaving(){if(!leaving)return;clearTimeout(leaveT);leaving.style.visibility='';leaving.style.opacity='';leaving.style.zIndex='';leaving=null;}
document.addEventListener('slidechange',function(e){
  var dt=e.detail||{},s=dt.slide,p=dt.previousSlide;
  if(p){p.querySelectorAll('wow-3d').forEach(function(x){x.stop()});p.querySelectorAll('ai-typing').forEach(function(x){x.reset()});}
  if(!s)return;
  ambient(s);
  var fwd=dt.reason==='init'||dt.index>=dt.previousIndex;
  prep();if(!s._wfxFrag){autoFrag(s);var st=stage();if(st&&st._resetFragments)st._resetFragments(s,!fwd);}
  var all=document.querySelectorAll('deck-stage > section').length||1;
  var bar=s.querySelector('[data-wfx-bar]');
  if(bar){bar.style.transition='none';bar.style.transform='scaleX('+((dt.previousIndex||0)+1)/all+')';void bar.offsetWidth;bar.style.transition='';bar.style.transform='scaleX('+((dt.index||0)+1)/all+')';}
  var instant=dt.reason==='init'||RM()||!s.animate;
  setTimeout(function(){s.querySelectorAll('wow-3d').forEach(function(x){x.start()});s.querySelectorAll('ai-typing').forEach(function(x){x.play()});},instant?60:DUR);
  if(instant)return;
  clearLeaving();
  s.getAnimations().forEach(function(x){x.cancel()});
  if(p&&p!==s){leaving=p;p.style.visibility='visible';p.style.opacity='1';p.style.zIndex='0';leaveT=setTimeout(clearLeaving,DUR+30);}
  s.style.zIndex='1';
  s.animate([{opacity:0},{opacity:1}],{duration:DUR,easing:'ease-out'});
});
if('requestIdleCallback' in window)requestIdleCallback(function(){document.querySelectorAll('deck-stage > section').forEach(ambient);},{timeout:4000});
})();
