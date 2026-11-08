(function(){
  /* Yavne edition: enlarge inline font sizes for projector readability.
     Per-slide factor (0 = keep original size) where the bigger text would not fit. */
  var SKIP={"תהליך · דוגמת בת ים": 0, "דאטה ביומיום": 0.75, "דף עזר לחשיבה": 0.0, "סרטון": 0.0, "נתח השוק": 0.3, "הטיות": 0.75, "התממה · איך עושים": 0.5};
  function g(p){return p<=24?1.35:p<=32?1.3:p<=40?1.25:p<=56?1.18:p<=80?1.12:p<=120?1.06:1;}
  function apply(){
    var secs=document.querySelectorAll('deck-stage > section');if(!secs.length)return false;
    secs.forEach(function(sec){
      var lab=sec.getAttribute('data-label');
      var k=Object.prototype.hasOwnProperty.call(SKIP,lab)?SKIP[lab]:1;
      if(!k)return;
      [sec].concat([].slice.call(sec.querySelectorAll('[style*="font-size"]'))).forEach(function(el){
        if(el.hasAttribute('data-yv-fs'))return;
        var m=/font-size:\s*(\d+(?:\.\d+)?)px/.exec(el.getAttribute('style')||'');if(!m)return;
        var p=parseFloat(m[1]);el.setAttribute('data-yv-fs',String(p));
        el.style.fontSize=Math.round(p*(1+k*(g(p)-1)))+'px';
      });
    });return true;
  }
  function boot(){if(!apply())setTimeout(boot,300);else{setTimeout(apply,1500);setTimeout(apply,4000);}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
