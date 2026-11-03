/*
  embed-guard.js · נוסף אוטומטית למצגות שיובאו מ-Claude Design.

  לכל iframe במצגת:
  - מוסיף כפתור קטן "פתחו בלשונית חדשה ↗" בפינת ההטמעה.
  - אם ל-iframe יש data-fallback (צילום מסך) והוא מסומן data-blocked, או שאין אינטרנט,
    או שמדפיסים ל-PDF: מציג את צילום המסך עם כפתור פתיחה במקום ההטמעה.

  סימונים על ה-iframe (מוסיף אותם ה-skill):
    data-fallback="embeds/xxx.png"   צילום מסך של התוכן
    data-open="https://..."          הכתובת לפתיחה בלשונית (ברירת מחדל: כתובת ההטמעה)
    data-blocked                     האתר לא מאפשר הטמעה, תמיד להציג צילום מסך
    data-no-guard                    לא לגעת ב-iframe הזה
*/
(function () {
  var PRINT = /print-pdf/i.test(location.search) || matchMedia('print').matches;

  function openUrl(f) {
    var u = f.getAttribute('data-open') || f.getAttribute('data-lazy-src') || f.getAttribute('src') || '';
    var yt = u.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
    if (yt) return 'https://www.youtube.com/watch?v=' + yt[1];
    var fb = u.match(/facebook\.com\/plugins\/video\.php\?.*?href=([^&]+)/);
    if (fb) return decodeURIComponent(fb[1]);
    return u;
  }

  function cardHtml(img, href) {
    var bg = img ? "background:#1F2A30 url('" + img + "') center/cover no-repeat;" : 'background:#1F2A30;';
    return '<!doctype html><html dir="rtl"><body style="margin:0;height:100vh;' + bg + 'font-family:Alef,Arial,sans-serif">' +
      '<a href="' + href + '" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-decoration:none;background:rgba(10,20,25,.45)">' +
      '<span style="background:#1F5F5B;color:#fff;font-size:28px;font-weight:700;padding:16px 34px;border-radius:999px;box-shadow:0 8px 30px rgba(0,0,0,.35)">פתחו בלשונית חדשה ↗</span></a></body></html>';
  }

  function guard(f) {
    if (f.__eg || f.hasAttribute('data-no-guard')) return;
    var href = openUrl(f);
    if (!/^https?:/.test(href)) return;
    f.__eg = true;
    var fb = f.getAttribute('data-fallback');
    var abs = fb ? new URL(fb, location.href).href : '';
    if (f.hasAttribute('data-blocked') || PRINT || !navigator.onLine) {
      f.removeAttribute('data-lazy-src');
      f.removeAttribute('src');
      f.setAttribute('srcdoc', cardHtml(abs, href));
      return;
    }
    // the slide already has its own "open" link for this URL: don't add a second one
    var sec = f.closest('section');
    var own = sec && [].some.call(sec.querySelectorAll('a[href]:not([data-eg])'), function (l) {
      return l.href.replace(/\/$/, '') === href.replace(/\/$/, '');
    });
    if (own) return;
    // small "open in new tab" pill, placed over the iframe's corner without touching layout
    var a = document.createElement('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'פתחו בלשונית חדשה ↗';
    a.setAttribute('data-eg', '');
    a.style.cssText = 'position:absolute;z-index:20;font:700 20px Alef,Arial,sans-serif;color:#fff;background:rgba(31,95,91,.92);' +
      'padding:8px 18px;border-radius:999px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25);direction:rtl;';
    f.__egLink = a;
    place(f);
  }

  function place(f) {
    var a = f.__egLink, host = f.offsetParent;
    if (!a || !host) return;
    if (a.parentNode !== host) host.appendChild(a);
    a.style.left = (f.offsetLeft + 14) + 'px';
    a.style.top = (f.offsetTop + f.offsetHeight - 54) + 'px';
  }

  function run() {
    document.querySelectorAll('iframe').forEach(function (f) { guard(f); place(f); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 600); });
  else setTimeout(run, 600);
  document.addEventListener('slidechange', function () { setTimeout(run, 50); });
  addEventListener('resize', run);
  addEventListener('online', function () { location.reload(); });
})();

/* מסך מלא וניווט בעכבר: כפתור קבוע בפינה, מקש F, קליק/גלגלת להעברת שקף, ו-?present פותח מסך "לחצו להתחלה".
   הדפדפן מאפשר מסך מלא רק אחרי לחיצה, ולכן ?present מציג כפתור גדול ולא נכנס לבד. */
(function () {
  if (/print-pdf/.test(location.search)) return;
  var d = document, root = d.documentElement;
  var can = root.requestFullscreen || root.webkitRequestFullscreen;
  if (!can) return;
  function isFs() { return !!(d.fullscreenElement || d.webkitFullscreenElement); }
  function enter() {
    var p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    if (p && p.catch) p.catch(function (e) { console.warn('[fullscreen]', e && e.message); });
  }
  function exit() { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
  function toggle() { isFs() ? exit() : enter(); }

  var tries = 0;
  function init() {
    // הנגן נבנה אחרי טעינת הדף: מחכים לו עד 10 שניות. בדפי עזר אין נגן ואין כפתור
    if (!d.querySelector('deck-stage')) { if (++tries < 40) setTimeout(init, 250); return; }
    var st = d.createElement('style');
    st.textContent =
      '.fs-btn{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:8px;' +
      'font:700 15px/1 "Alef","Heebo","Segoe UI",Arial,sans-serif;color:#FFFDF8;background:rgba(31,95,91,.92);' +
      'border:0;border-radius:8px;padding:10px 14px;cursor:pointer;opacity:.55;transition:opacity .15s}' +
      '.fs-btn:hover,.fs-btn:focus-visible{opacity:1}' +
      '.fs-btn svg{width:16px;height:16px}' +
      ':fullscreen .fs-btn{display:none}' +
      '.fs-start{position:fixed;inset:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(42,33,27,.55)}' +
      '.fs-start button{font:700 26px/1 "Alef","Heebo","Segoe UI",Arial,sans-serif;color:#FFFDF8;background:#1F5F5B;' +
      'border:0;border-radius:12px;padding:22px 36px;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.25)}' +
      '.fs-start small{display:block;margin-top:10px;font-size:15px;font-weight:400;opacity:.85}' +
      '@media print{.fs-btn,.fs-start{display:none!important}}';
    d.head.appendChild(st);

    var b = d.createElement('button');
    b.className = 'fs-btn'; b.type = 'button'; b.title = 'מסך מלא (F)';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>מסך מלא';
    b.addEventListener('click', function (e) { e.stopPropagation(); enter(); b.blur(); });
    d.body.appendChild(b);

    if (/[?&]present\b/.test(location.search)) {
      var o = d.createElement('div');
      o.className = 'fs-start';
      o.innerHTML = '<button type="button">▶ התחלת המצגת במסך מלא<small>יציאה: Esc · מעבר שקפים: חיצים, קליק או גלגלת</small></button>';
      o.addEventListener('click', function () { o.remove(); enter(); });
      d.body.appendChild(o);
    }

    // ניווט בעכבר: קליק שמאלי = הבא, קליק ימני = הקודם, גלגלת = קדימה/אחורה.
    // קליק על קישור, כפתור, הטמעה או שדה לא מעביר שקף.
    var deck = d.querySelector('deck-stage');
    var SKIP = 'a,button,input,select,textarea,label,summary,details,video,audio,iframe,[contenteditable],[onclick],[role=button],[data-eg],.fs-btn,.fs-start';
    function onSlide(e) {
      var path = e.composedPath ? e.composedPath() : [];
      var inSlide = false;
      for (var i = 0; i < path.length; i++) {
        var n = path[i];
        if (n === deck) break;
        if (n.matches && n.matches(SKIP)) return false;
        if (n.tagName === 'SECTION') inSlide = true;
      }
      return inSlide;
    }
    function go(step) { step > 0 ? deck.next() : deck.prev(); }
    var fine = matchMedia('(pointer: fine)');
    d.addEventListener('click', function (e) {
      if (!fine.matches || e.button !== 0 || e.defaultPrevented) return;
      if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      if (String(getSelection()) || !onSlide(e)) return;
      go(1);
    });
    d.addEventListener('contextmenu', function (e) {
      if (!fine.matches || e.shiftKey || !onSlide(e)) return; // Shift+קליק ימני = התפריט הרגיל
      e.preventDefault(); go(-1);
    });
    var lastWheel = 0;
    d.addEventListener('wheel', function (e) {
      if (e.ctrlKey || Math.abs(e.deltaY) < 8 || !onSlide(e)) return;
      e.preventDefault();
      var now = Date.now();
      if (now - lastWheel < 700) return; // גלגלת רגישה: שקף אחד לכל תנועה
      lastWheel = now;
      go(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    d.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'f' || e.key === 'F' || e.key === 'כ') { e.preventDefault(); toggle(); }
    });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
