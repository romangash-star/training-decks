/* זמני העלאה וכפתורי העתקת כתובת לעמודי האתר.
   _build.json נוצר בכל העלאה ל-GitHub (ראו .github/workflows/pages.yml):
   { "site": "<זמן ההעלאה>", "commit": "abc1234", "decks": { "<folder>": "<זמן העדכון האחרון של המצגת>" } } */
(function () {
  var root = document.currentScript.src.replace(/_shared\/site\.js.*$/, '');

  function fmt(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var opt = { timeZone: 'Asia/Jerusalem' };
    var date = d.toLocaleDateString('he-IL', Object.assign({ weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' }, opt));
    var time = d.toLocaleTimeString('he-IL', Object.assign({ hour: '2-digit', minute: '2-digit', hour12: false }, opt));
    return date + ' · ' + time;
  }
  window.SiteInfo = { fmt: fmt, build: null };

  function fill(info) {
    window.SiteInfo.build = info;
    document.querySelectorAll('[data-updated]').forEach(function (el) {
      var key = el.getAttribute('data-updated');
      var t = key ? (info.decks || {})[key] : info.site;
      if (t) el.textContent = fmt(t);
    });
    document.querySelectorAll('[data-commit]').forEach(function (el) { el.textContent = info.commit || ''; });
    document.dispatchEvent(new CustomEvent('siteinfo', { detail: info }));
  }

  fetch(root + '_build.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (info) { if (info) fill(info); else fillLocal(); })
    .catch(fillLocal);

  function fillLocal() {
    document.querySelectorAll('[data-updated]').forEach(function (el) { el.textContent = 'תצוגה מקומית · לא הועלה'; });
  }

  // כתובת העמוד + כפתור העתקה
  document.querySelectorAll('[data-url]').forEach(function (el) { el.textContent = location.href.split('#')[0].split('?')[0]; });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    e.preventDefault();
    var text = b.getAttribute('data-copy') || location.href.split('#')[0];
    if (!/^https?:/.test(text)) text = new URL(text, location.href).href;
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
      var old = b.textContent; b.textContent = 'הועתק ✓'; b.classList.add('done');
      setTimeout(function () { b.textContent = old; b.classList.remove('done'); }, 1600);
    }).catch(function () { prompt('העתיקו את הכתובת:', text); });
  });
})();
