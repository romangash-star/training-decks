(function(){
  var DAY=window.DS_DAY||'יום 1';
  function sym(dark){
    var A=dark?'#FFFDF8':'#1F5F5B',B=dark?'#C9E2DE':'#B4502F',C=dark?'#F0B95A':'#D99A2B';
    return [
      '<path d="M8 40V26M18 40V14M28 40V22M38 40V8" stroke="'+A+'" stroke-width="5" stroke-linecap="round"/><path d="M4 42h40" stroke="'+B+'" stroke-width="2.5" stroke-linecap="round"/>',
      '<rect x="6" y="8" width="36" height="32" rx="5" stroke="'+B+'" stroke-width="3" fill="none"/><path d="M6 18h36M6 29h36M19 8v32" stroke="'+B+'" stroke-width="2.5"/><rect x="6" y="8" width="36" height="10" rx="5" fill="'+A+'" opacity=".55"/>',
      '<path d="M6 36l10-10 8 6 16-18" stroke="'+A+'" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="14" r="4" fill="'+C+'"/><path d="M4 42h40" stroke="'+B+'" stroke-width="2.5" stroke-linecap="round"/>',
      '<circle cx="24" cy="24" r="15" stroke="'+B+'" stroke-width="7" fill="none" opacity=".45"/><path d="M24 9a15 15 0 0 1 14.3 19.6" stroke="'+C+'" stroke-width="7" fill="none"/>',
      '<path d="M6 6v36h36" stroke="'+B+'" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="14" cy="32" r="3.5" fill="'+A+'"/><circle cx="22" cy="26" r="3.5" fill="'+A+'"/><circle cx="30" cy="20" r="3.5" fill="'+C+'"/><circle cx="37" cy="12" r="3.5" fill="'+A+'"/>',
      '<path d="M24 43s13-12.5 13-23a13 13 0 0 0-26 0c0 10.5 13 23 13 23z" stroke="'+A+'" stroke-width="3.5" fill="none"/><circle cx="24" cy="20" r="5" fill="'+C+'"/>',
      '<ellipse cx="24" cy="12" rx="14" ry="5" stroke="'+B+'" stroke-width="3" fill="none"/><path d="M10 12v24c0 2.8 6.3 5 14 5s14-2.2 14-5V12M10 24c0 2.8 6.3 5 14 5s14-2.2 14-5" stroke="'+B+'" stroke-width="3" fill="none"/>'
    ].map(function(p){return '<svg viewBox="0 0 48 48" fill="none">'+p+'</svg>';}).join('');
  }
  var css='.dsf{position:absolute;left:0;right:0;bottom:0;height:94px;pointer-events:none;z-index:8;font-family:"Alef",sans-serif;direction:rtl}'+
    '.dsf.band{background:#FAF5EC;border-top:1px solid #E3D8C6}.dsf.band.dk{background:#1F5F5B;border-top:0}'+
    '.dsf .lg{position:absolute;top:28px;height:48px;object-fit:contain;object-position:right center}'+
    '.dsf.dk .lg{filter:brightness(0) invert(1);opacity:.75}'+
    '.dsf .num{position:absolute;left:96px;top:32px;font-size:28px;line-height:36px;color:#6B5D52;direction:rtl;white-space:nowrap}.dsf.dk .num{color:#DCEDEA}'+
    '.dsf .sym{position:absolute;left:600px;top:10px;width:720px;height:84px;display:flex;justify-content:space-evenly;align-items:center}'+
    '.dsf .sym svg{width:46px;height:46px;opacity:.6;animation:dsfF 7s ease-in-out infinite}.dsf.dk .sym svg{opacity:.75}'+
    '.dsf .sym svg:nth-child(2){animation-duration:8.4s;animation-delay:-1.3s}.dsf .sym svg:nth-child(3){animation-duration:6.6s;animation-delay:-2.7s}'+
    '.dsf .sym svg:nth-child(4){animation-duration:9.2s;animation-delay:-.6s}.dsf .sym svg:nth-child(5){animation-duration:7.7s;animation-delay:-3.9s}'+
    '.dsf .sym svg:nth-child(6){animation-duration:8.8s;animation-delay:-2.1s}.dsf .sym svg:nth-child(7){animation-duration:6.9s;animation-delay:-4.6s}'+
    '@keyframes dsfF{0%,100%{transform:translateY(5px) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}'+
    '@media (prefers-reduced-motion:reduce){.dsf .sym svg{animation:none}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  function lum(c){var m=c&&c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);if(!m)return null;if(m[4]!==undefined&&+m[4]<.2)return null;return (0.299*m[1]+0.587*m[2]+0.114*m[3])/255;}
  function isDark(sec){var cs=getComputedStyle(sec);var l=lum(cs.backgroundColor);if(l==null){var g=cs.backgroundImage.match(/rgba?\([^)]*\)/);l=g?lum(g[0]):1;}return l!=null&&l<.45;}
  function apply(){
    var secs=[].slice.call(document.querySelectorAll('deck-stage > section'));if(!secs.length)return false;
    var vis=secs.filter(function(s){return !s.hasAttribute('data-deck-skip');}),N=vis.length;
    secs.forEach(function(sec){
      var f=sec.querySelector(':scope > .dsf');
      if(!f){f=document.createElement('div');f.className='dsf';f.setAttribute('aria-hidden','true');f.setAttribute('data-om-raster','');
        var dk=isDark(sec),pb=parseFloat(getComputedStyle(sec).paddingBottom)||0;
        if(dk)f.classList.add('dk');if(pb<40)f.classList.add('band');
        f.innerHTML='<div class="sym">'+sym(dk)+'</div><div class="num"></div>';
        sec.appendChild(f);}
      var i=vis.indexOf(sec);f.querySelector('.num').textContent=i<0?DAY:DAY+' · '+(i+1)+' / '+N;
    });return true;
  }
  function boot(){if(!apply())setTimeout(boot,300);else{setTimeout(apply,1500);setTimeout(apply,4000);}}
  function lazy(sec){if(!sec)return;sec.querySelectorAll('iframe[data-lazy-src]').forEach(function(fr){var u=fr.getAttribute('data-lazy-src');if(fr.getAttribute('src')!==u)fr.setAttribute('src',u);});}
  function activeSec(){return document.querySelector('deck-stage > section[data-deck-active]');}
  function stopOthers(cur){document.querySelectorAll('deck-stage > section').forEach(function(sec){if(sec===cur)return;sec.querySelectorAll('video,audio').forEach(function(v){try{v.pause();}catch(e){}});sec.querySelectorAll('iframe[data-lazy-src]').forEach(function(fr){var u=fr.getAttribute('data-lazy-src')||'';if(/facebook\.com\/plugins\/video|youtube\.com|youtu\.be|vimeo\.com/.test(u)&&fr.getAttribute('src')&&fr.getAttribute('src')!=='about:blank')fr.setAttribute('src','about:blank');});});}
  document.addEventListener('slidechange',function(e){apply();var cur=(e.detail&&e.detail.slide)||activeSec();stopOthers(cur);lazy(cur);});
  setTimeout(function(){lazy(activeSec());},800);setTimeout(function(){lazy(activeSec());},2500);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
