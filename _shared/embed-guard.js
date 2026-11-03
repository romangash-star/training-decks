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
