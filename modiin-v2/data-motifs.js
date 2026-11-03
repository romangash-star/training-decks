(function(){
  var C1='#1F5F5B',C2='#A9D3CC',C3='#B4502F';
  var css='@keyframes dmBar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}'+
  '@keyframes dmDraw{0%{stroke-dashoffset:220}55%,80%{stroke-dashoffset:0}100%{stroke-dashoffset:-220}}'+
  '@keyframes dmPie{0%,100%{stroke-dasharray:20 100}50%{stroke-dasharray:72 100}}'+
  '@keyframes dmSpin{to{transform:rotate(360deg)}}'+
  '@keyframes dmDot{0%,100%{transform:scale(.4);opacity:.3}50%{transform:scale(1);opacity:1}}'+
  '@keyframes dmNeedle{0%,100%{transform:rotate(-55deg)}50%{transform:rotate(50deg)}}'+
  '@keyframes dmScroll{to{transform:translateX(-60px)}}'+
  '@keyframes dmIn{from{opacity:0;transform:translateY(8px)}to{opacity:.7;transform:none}}';
  var st=document.createElement('style');st.textContent=css+'[data-motif] *{transform-box:fill-box}';document.head.appendChild(st);
  function bars(){var s='';for(var i=0;i<6;i++){s+='<rect x="'+(6+i*17)+'" y="8" width="11" height="52" rx="2" fill="'+(i%3==2?C3:i%2?C2:C1)+'" style="transform-origin:50% 100%;animation:dmBar '+(1.6+i*.23)+'s ease-in-out '+(i*.18)+'s infinite"></rect>';}return s+'<line x1="2" y1="61" x2="112" y2="61" stroke="'+C2+'" stroke-width="2"></line>';}
  function line(){return '<line x1="2" y1="61" x2="112" y2="61" stroke="'+C2+'" stroke-width="2"></line><polyline points="4,52 22,44 38,48 56,30 74,34 92,16 110,10" fill="none" stroke="'+C1+'" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="220" style="animation:dmDraw 5s ease-in-out infinite"></polyline><circle cx="110" cy="10" r="5" fill="'+C3+'" style="transform-origin:50% 50%;animation:dmDot 1.8s ease-in-out infinite"></circle>';}
  function pie(){return '<g style="transform-origin:57px 34px;animation:dmSpin 14s linear infinite"><circle cx="57" cy="34" r="26" fill="none" stroke="'+C2+'" stroke-width="12"></circle><circle cx="57" cy="34" r="26" fill="none" stroke="'+C1+'" stroke-width="12" pathLength="100" style="animation:dmPie 4.5s ease-in-out infinite"></circle><circle cx="57" cy="34" r="26" fill="none" stroke="'+C3+'" stroke-width="12" pathLength="100" stroke-dasharray="10 100" stroke-dashoffset="-80"></circle></g>';}
  function dash(){var s='<rect x="1" y="1" width="112" height="62" rx="8" fill="#FFFDF8" stroke="'+C2+'" stroke-width="2"></rect><rect x="9" y="9" width="40" height="6" rx="3" fill="'+C2+'"></rect>';for(var i=0;i<4;i++)s+='<rect x="'+(10+i*10)+'" y="24" width="6" height="32" rx="1.5" fill="'+(i==2?C3:C1)+'" style="transform-origin:50% 100%;animation:dmBar '+(1.4+i*.3)+'s ease-in-out '+(i*.2)+'s infinite"></rect>';
    return s+'<svg x="56" y="20" width="50" height="36" viewBox="0 0 50 36" overflow="hidden"><polyline points="0,28 10,20 20,24 30,10 40,16 50,6 60,18 70,12 80,22 90,8 100,14 110,28" fill="none" stroke="'+C1+'" stroke-width="2.5" style="animation:dmScroll 3s linear infinite"></polyline></svg>';}
  function scatter(){var p=[[12,50],[26,40],[34,48],[48,30],[58,36],[70,22],[82,26],[96,12],[104,18]],s='<line x1="2" y1="61" x2="112" y2="61" stroke="'+C2+'" stroke-width="2"></line><line x1="2" y1="2" x2="2" y2="61" stroke="'+C2+'" stroke-width="2"></line><line x1="8" y1="54" x2="108" y2="10" stroke="'+C3+'" stroke-width="2" stroke-dasharray="4 4"></line>';p.forEach(function(q,i){s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="5" fill="'+(i%2?C2:C1)+'" style="transform-origin:50% 50%;animation:dmDot '+(2+i%3*.5)+'s ease-in-out '+(i*.25)+'s infinite"></circle>';});return s;}
  function gauge(){return '<path d="M17 56 A40 40 0 0 1 97 56" fill="none" stroke="'+C2+'" stroke-width="10" stroke-linecap="round"></path><path d="M75 22 A40 40 0 0 1 97 56" fill="none" stroke="'+C3+'" stroke-width="10" stroke-linecap="round"></path><line x1="57" y1="56" x2="57" y2="22" stroke="'+C1+'" stroke-width="4" stroke-linecap="round" style="transform-origin:57px 56px;transform-box:view-box;animation:dmNeedle 4s ease-in-out infinite"></line><circle cx="57" cy="56" r="6" fill="'+C1+'"></circle>';}
  var kinds=[bars,line,pie,dash,scatter,gauge];
  function apply(){
    var secs=document.querySelectorAll('deck-stage > section');if(!secs.length)return false;
    secs.forEach(function(sec,i){
      if(sec.querySelector('[data-motif]')||sec.hasAttribute('data-no-motif'))return;
      var photo=parseInt(getComputedStyle(sec).paddingTop)===0;
      var w=document.createElement('div');w.setAttribute('data-motif','');w.setAttribute('aria-hidden','true');
      w.style.cssText='position:absolute;'+(photo?'top:44px;left:52px;background:rgba(255,255,255,.88);padding:10px 12px;border-radius:12px;':'top:38px;left:52px;')+'width:114px;height:64px;pointer-events:none;z-index:5;opacity:.7;animation:dmIn .8s ease both;';
      w.innerHTML='<svg width="114" height="64" viewBox="0 0 114 64" overflow="visible">'+kinds[i%kinds.length]()+'</svg>';
      sec.appendChild(w);
    });return true;
  }
  function boot(){if(!apply())setTimeout(boot,300);else setTimeout(apply,1500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
