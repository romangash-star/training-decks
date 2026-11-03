(function(){
  var HREF=encodeURIComponent(window.WS_FILE||'worksheet-day2.html');
  var PARTS={1:['#1F5F5B','השאלה'],2:['#2E6FA3','הקובץ'],3:['#B4502F','השערה'],4:['#6B4FA0','מחקר'],5:['#9A6A0C','בדיקה'],6:['#B23A6B','חדר מחקר'],7:['#3F7D3A','תובנות'],8:['#5E5249','הלאה']};
  function apply(){
    var secs=document.querySelectorAll('deck-stage > section[data-ws]');if(!secs.length)return false;
    secs.forEach(function(sec){
      var old=sec.querySelector(':scope > .wsb');if(old)old.remove();
      var ws=sec.getAttribute('data-ws'),p=PARTS[parseInt(ws,10)]||PARTS[1];
      var a=document.createElement('a');a.className='wsb';a.href=HREF;a.target='_blank';a.title='פתח את דף העזר';
      a.style.cssText='position:absolute;left:0;top:50%;transform:translateY(-50%);width:124px;box-sizing:border-box;padding:14px 6px 16px;border-radius:0 20px 20px 0;background:'+p[0]+';color:#FFFFFF;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:Alef,sans-serif;text-decoration:none;z-index:9;box-shadow:0 8px 24px rgba(0,0,0,.18);direction:rtl;text-align:center;';
      var item=sec.getAttribute('data-ws-item');
      var name=ws.indexOf('–')>-1?'':p[1];
      a.innerHTML='<span style="font-size:24px;font-weight:700;line-height:1.1;opacity:.85;">דף העזר</span>'+
        '<span style="font-size:'+(name?64:46)+'px;font-weight:700;line-height:1;white-space:nowrap;direction:ltr;">'+ws+'</span>'+
        (name?'<span style="font-size:24px;font-weight:700;line-height:1.1;white-space:nowrap;">'+name+'</span>':'')+
        (item?'<span style="font-size:24px;line-height:1.1;border-top:2px solid rgba(255,255,255,.45);padding-top:6px;margin-top:2px;white-space:nowrap;">'+item+'</span>':'');
      sec.appendChild(a);
    });return true;
  }
  function boot(){if(!apply())setTimeout(boot,300);else setTimeout(apply,1500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
