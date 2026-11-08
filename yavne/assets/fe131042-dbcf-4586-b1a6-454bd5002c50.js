(function(){
  /* Yavne edition: audio player for [data-audio-player] blocks (external so it runs in every viewer). */
  if (window.__yvAudio) return; window.__yvAudio = true;
  function player(el){ return el && el.closest ? el.closest('[data-audio-player]') : null; }
  function setIcon(p, name){ var i = p.querySelector('[data-audio-icon]'); if (i) i.textContent = name; }
  function toggle(e){
    var b = e.target && e.target.closest && e.target.closest('[data-audio-btn]'); if (!b) return;
    e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e.type !== 'click') return;
    var p = player(b); var a = p && p.querySelector('audio'); if (!a) return;
    if (a.paused) { var r = a.play(); if (r && r.catch) r.catch(function(err){ console.warn('audio play failed', err); }); }
    else { a.pause(); }
  }
  ['pointerdown','mousedown','click'].forEach(function(t){ document.addEventListener(t, toggle, true); });
  document.addEventListener('keydown', function(e){
    var b = e.target && e.target.closest && e.target.closest('[data-audio-btn]');
    if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); b.click(); }
  }, true);
  document.addEventListener('play', function(e){ var p = player(e.target); if (p){ p.setAttribute('data-playing',''); setIcon(p,'pause'); } }, true);
  function stop(e){ var p = player(e.target); if (p){ p.removeAttribute('data-playing'); setIcon(p,'play_arrow'); } }
  document.addEventListener('pause', stop, true);
  document.addEventListener('ended', function(e){ stop(e); try { e.target.currentTime = 0; } catch(_){} }, true);
})();
