(function(){
  var RX=/\d[\d,]*(\.\d+)?/g;
  function fmt(m,e){var dec=(m.split('.')[1]||'').length;var n=parseFloat(m.replace(/,/g,''));if(!m.includes(',')&&!m.includes('.')&&n>=1900&&n<=2100)return m;var v=(n*e).toFixed(dec);return m.includes(',')?Number(v).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}):v;}
  function run(slide){
    if(!slide||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var nodes=[],w=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT);
    while(w.nextNode()){var n=w.currentNode,p=n.parentElement;if(!p||!/\d/.test(n.nodeValue))continue;
      if(p.closest('[data-bar]')||parseFloat(getComputedStyle(p).fontSize)>=88)nodes.push(n);}
    nodes.forEach(function(n){if(n.__o==null)n.__o=n.nodeValue;var o=n.__o,t0=performance.now();
      (function step(now){var k=Math.min(1,(now-t0)/1100),e=1-Math.pow(1-k,3);
        n.nodeValue=k<1?o.replace(RX,function(m){return fmt(m,e)}):o;if(k<1)requestAnimationFrame(step);})(t0);});
  }
  document.addEventListener('slidechange',function(e){run(e.detail&&e.detail.slide)});
})();
