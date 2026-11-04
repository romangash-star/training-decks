(function(){
  var L={a:"#1F5F5B",b:"#B4502F",c:"#D99A2B"}, D={a:"#FFFDF8",b:"#C9E2DE",c:"#F0B95A"};
  function syms(k){return [
    '<svg viewBox="0 0 48 48"><path d="M8 40V26M18 40V14M28 40V22M38 40V8" stroke="'+k.a+'" stroke-width="5" stroke-linecap="round"/><path d="M4 42h40" stroke="'+k.b+'" stroke-width="2.5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M24 4c1.5 9 5 12.5 14 14-9 1.5-12.5 5-14 14-1.5-9-5-12.5-14-14 9-1.5 12.5-5 14-14z" fill="none" stroke="'+k.c+'" stroke-width="3" stroke-linejoin="round"/><path d="M38 31c.6 3.4 2 4.8 5.4 5.4-3.4.6-4.8 2-5.4 5.4-.6-3.4-2-4.8-5.4-5.4 3.4-.6 4.8-2 5.4-5.4z" fill="'+k.b+'"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M6 36l10-10 8 6 16-18" stroke="'+k.a+'" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="14" r="4" fill="'+k.c+'"/><path d="M4 42h40" stroke="'+k.b+'" stroke-width="2.5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M8 12L24 8M8 12L24 24M8 12L24 40M8 36L24 8M8 36L24 24M8 36L24 40M24 8L40 18M24 24L40 18M24 24L40 30M24 40L40 30" stroke="'+k.b+'" stroke-width="1.8" opacity=".8"/><circle cx="8" cy="12" r="4" fill="'+k.a+'"/><circle cx="8" cy="36" r="4" fill="'+k.a+'"/><circle cx="24" cy="8" r="4" fill="'+k.a+'"/><circle cx="24" cy="24" r="4" fill="'+k.c+'"/><circle cx="24" cy="40" r="4" fill="'+k.a+'"/><circle cx="40" cy="18" r="4" fill="'+k.a+'"/><circle cx="40" cy="30" r="4" fill="'+k.a+'"/></svg>',
    '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" stroke="'+k.b+'" stroke-width="7" fill="none" opacity=".45"/><path d="M24 9a15 15 0 0 1 14.3 19.6" stroke="'+k.c+'" stroke-width="7" fill="none"/></svg>',
    '<svg viewBox="0 0 48 48"><rect x="12" y="12" width="24" height="24" rx="4" stroke="'+k.a+'" stroke-width="3.5" fill="none"/><rect x="19" y="19" width="10" height="10" rx="2" fill="'+k.c+'"/><path d="M18 12V5M24 12V5M30 12V5M18 43v-7M24 43v-7M30 43v-7M12 18H5M12 24H5M12 30H5M43 18h-7M43 24h-7M43 30h-7" stroke="'+k.b+'" stroke-width="2.5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M6 6v36h36" stroke="'+k.b+'" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="14" cy="32" r="3.5" fill="'+k.a+'"/><circle cx="22" cy="26" r="3.5" fill="'+k.a+'"/><circle cx="30" cy="20" r="3.5" fill="'+k.c+'"/><circle cx="37" cy="12" r="3.5" fill="'+k.a+'"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M8 10h32a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H22l-10 8v-8H8a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" stroke="'+k.a+'" stroke-width="3.5" fill="none" stroke-linejoin="round"/><circle cx="15" cy="22" r="2.8" fill="'+k.c+'"/><circle cx="24" cy="22" r="2.8" fill="'+k.c+'"/><circle cx="33" cy="22" r="2.8" fill="'+k.c+'"/></svg>',
    '<svg viewBox="0 0 48 48"><rect x="6" y="8" width="36" height="32" rx="5" stroke="'+k.b+'" stroke-width="3" fill="none"/><path d="M6 18h36M6 29h36M19 8v32" stroke="'+k.b+'" stroke-width="2.5"/><rect x="6" y="8" width="36" height="10" rx="5" fill="'+k.a+'" opacity=".55"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M24 43s13-12.5 13-23a13 13 0 0 0-26 0c0 10.5 13 23 13 23z" stroke="'+k.a+'" stroke-width="3.5" fill="none"/><circle cx="24" cy="20" r="5" fill="'+k.c+'"/></svg>',
    '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="12" rx="14" ry="5" stroke="'+k.b+'" stroke-width="3" fill="none"/><path d="M10 12v24c0 2.8 6.3 5 14 5s14-2.2 14-5V12M10 24c0 2.8 6.3 5 14 5s14-2.2 14-5" stroke="'+k.b+'" stroke-width="3" fill="none"/></svg>'
  ];}
  var SPIN={1:1,4:1};
  var SLOTS=[
    {l:34,t:150,s:50},{r:36,t:250,s:44},{l:42,t:500,s:42},{r:30,t:560,s:54},{l:30,t:800,s:52},
    {r:40,t:840,s:40},{l:560,t:1004,s:44},{l:960,t:1014,s:38},{r:560,t:1004,s:46},{l:300,t:26,s:36},{r:300,t:1010,s:38}
  ];
  function isDark(s){var bg=getComputedStyle(s).backgroundColor;return bg.indexOf("31, 95, 91")>-1||bg.indexOf("180, 80, 47")>-1;}
  function build(){
    var stage=document.querySelector("deck-stage"); if(!stage) return;
    var slides=[].slice.call(stage.children).filter(function(n){return n.tagName==="SECTION";});
    slides.forEach(function(s,i){
      var old=s.querySelector(":scope > .rai-foot"); if(old) old.remove();
      var f=s.querySelector(":scope > .rai-deco");
      if(!f){
        var dark=isDark(s), set=syms(dark?D:L), html="";
        var cnt=1+(i%2);
        for(var j=0;j<cnt;j++){
          var p=SLOTS[(i*4+j*5)%SLOTS.length], k=(i*5+j*3)%set.length;
          var dur=(6.6+((i*1.7+j*2.3)%5.8)).toFixed(1), del=-((i+j*1.9)%6).toFixed(1);
          var anim=SPIN[k]&&j%2===0?"raiS "+(14+j*2)+"s linear infinite":(j%2?"raiB ":"raiA ")+dur+"s ease-in-out "+del+"s infinite";
          html+='<span class="rai-s" style="'+(p.l!=null?"left:"+p.l+"px;":"right:"+p.r+"px;")+"top:"+p.t+"px;width:"+p.s+"px;height:"+p.s+"px;animation:"+anim+'">'+set[k]+'</span>';
        }
        f=document.createElement("div"); f.className="rai-deco"+(dark?" dark":""); f.setAttribute("data-om-raster","");
        f.innerHTML=html+'<div class="rai-num"></div>';
        s.appendChild(f);
      }
      f.querySelector(".rai-num").textContent=(i+1)+" / "+slides.length;
    });
  }
  function go(){build();setTimeout(build,600);}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",go); else go();
  window.addEventListener("load",go);
  document.addEventListener("slidechange",build);
})();
