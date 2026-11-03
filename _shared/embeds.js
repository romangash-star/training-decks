/*
  רכיבי הטמעה למצגות.

  שימוש בשקף:
    <div class="embed" data-src="https://youtu.be/XXXX" data-title="שם הסרטון" data-fallback="assets/video.png"></div>

  data-src       הקישור הרגיל (YouTube, Vimeo, Power BI, קובץ וידאו או כל אתר אחר)
  data-type      לא חובה: youtube / vimeo / powerbi / video / iframe. בלי זה הסוג מזוהה לפי הקישור
  data-title     שם התוכן, מופיע בשורת המקור ובכרטיס החלופי
  data-fallback  צילום מסך שמוצג כשאין אינטרנט או בהדפסה ל-PDF
  data-caption   "false" כדי להסתיר את שורת המקור

  ההטמעה נטענת רק כשמגיעים לשקף. דשבורדים נשארים טעונים אחרי זה.
  סרטונים נעצרים כשעוזבים את השקף.
*/
(function () {
  const LABELS = {
    youtube: { source: "YouTube", icon: "▶", button: "צפו בסרטון" },
    vimeo: { source: "Vimeo", icon: "▶", button: "צפו בסרטון" },
    video: { source: "וידאו", icon: "▶", button: "צפו בסרטון" },
    powerbi: { source: "Power BI", icon: "📊", button: "פתחו את הדשבורד החי" },
    iframe: { source: "אתר חיצוני", icon: "↗", button: "פתחו בלשונית חדשה" },
  };
  const IS_VIDEO = { youtube: true, vimeo: true, video: true };
  const PRINT = /print-pdf/i.test(window.location.search);

  function parseUrl(src) {
    try { return new URL(src, window.location.href); } catch (e) { return null; }
  }

  function detectType(src) {
    const u = parseUrl(src);
    if (!u) return "iframe";
    const host = u.hostname.replace(/^www\./, "");
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(host) || host === "youtu.be") return "youtube";
    if (/(^|\.)vimeo\.com$/.test(host)) return "vimeo";
    if (/powerbi\.com$/.test(host)) return "powerbi";
    if (/\.(mp4|webm|ogg|mov)$/i.test(u.pathname)) return "video";
    return "iframe";
  }

  // "90", "90s", "1m30s", "1h2m3s" -> שניות
  function parseTime(t) {
    if (!t) return 0;
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (!m) return 0;
    return (parseInt(m[1] || 0, 10) * 3600) + (parseInt(m[2] || 0, 10) * 60) + parseInt(m[3] || 0, 10);
  }

  function youtubeInfo(src) {
    const u = parseUrl(src);
    if (!u) return null;
    let id = null;
    if (u.hostname.endsWith("youtu.be")) id = u.pathname.slice(1).split("/")[0];
    else if (u.searchParams.get("v")) id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/\/(embed|shorts|live|v)\/([^/?#]+)/);
      if (m) id = m[2];
    }
    if (!id) return null;
    const start = parseTime(u.searchParams.get("t") || u.searchParams.get("start"));
    const embed = "https://www.youtube-nocookie.com/embed/" + id + "?rel=0" + (start ? "&start=" + start : "");
    const open = "https://www.youtube.com/watch?v=" + id + (start ? "&t=" + start + "s" : "");
    return { embed: embed, open: open };
  }

  function vimeoInfo(src) {
    const u = parseUrl(src);
    if (!u) return null;
    if (u.hostname.startsWith("player.")) return { embed: src, open: src };
    const parts = u.pathname.split("/").filter(Boolean);
    const id = parts.find(function (p) { return /^\d+$/.test(p); });
    if (!id) return null;
    const hash = parts[parts.indexOf(id) + 1];
    const embed = "https://player.vimeo.com/video/" + id + (hash ? "?h=" + hash : "");
    return { embed: embed, open: src };
  }

  function resolve(el) {
    const src = (el.dataset.src || "").trim();
    const type = el.dataset.type || detectType(src);
    let embed = src, open = src;
    if (type === "youtube") { const y = youtubeInfo(src); if (y) { embed = y.embed; open = y.open; } }
    if (type === "vimeo") { const v = vimeoInfo(src); if (v) { embed = v.embed; open = v.open; } }
    return { src: src, type: type, embed: embed, open: open };
  }

  function el(tag, attrs, text) {
    const n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text) n.textContent = text;
    return n;
  }

  function renderFallback(box, info, note) {
    const label = LABELS[info.type] || LABELS.iframe;
    const card = el(info.open ? "a" : "div", { class: "embed-fallback" });
    if (info.open) { card.href = info.open; card.target = "_blank"; card.rel = "noopener"; }
    if (box.dataset.fallback) card.style.backgroundImage = "url('" + box.dataset.fallback + "')";
    card.appendChild(el("span", { class: "embed-btn" }, label.icon + "  " + label.button));
    if (note) card.appendChild(el("span", { class: "embed-note" }, note));
    box.replaceChildren(card);
  }

  function renderLive(box, info) {
    if (info.type === "video") {
      const v = el("video", { controls: "", preload: "metadata", playsinline: "" });
      v.src = info.embed;
      if (box.dataset.fallback) v.poster = box.dataset.fallback;
      box.replaceChildren(v);
      return;
    }
    const f = el("iframe", {
      title: box.dataset.title || "תוכן מוטמע",
      allow: "autoplay; encrypted-media; fullscreen; picture-in-picture",
      allowfullscreen: "",
      referrerpolicy: "strict-origin-when-cross-origin",
      loading: "eager",
    });
    f.src = info.embed;
    box.replaceChildren(f);
  }

  function addCaption(box, info) {
    if (box.dataset.caption === "false" || box.nextElementSibling && box.nextElementSibling.classList.contains("embed-caption")) return;
    const label = LABELS[info.type] || LABELS.iframe;
    const cap = el("div", { class: "embed-caption" });
    cap.appendChild(el("span", {}, label.source + (box.dataset.title ? " · " + box.dataset.title : "")));
    if (info.open && info.type !== "video") {
      const a = el("a", { href: info.open, target: "_blank", rel: "noopener" }, "פתחו בלשונית חדשה ↗");
      cap.appendChild(a);
    }
    box.insertAdjacentElement("afterend", cap);
  }

  function load(box) {
    if (box.dataset.state === "live") return;
    const info = resolve(box);
    if (!info.src) { renderFallback(box, info, "חסר קישור: הוסיפו data-src"); box.dataset.state = "empty"; return; }
    const local = info.type === "video" && !/^https?:/i.test(info.src);
    if (PRINT) { renderFallback(box, info, box.dataset.title || ""); box.dataset.state = "print"; return; }
    if (!navigator.onLine && !local) { renderFallback(box, info, "אין חיבור לאינטרנט"); box.dataset.state = "offline"; return; }
    renderLive(box, info);
    box.dataset.state = "live";
  }

  function unload(box) {
    if (box.dataset.state !== "live") return;
    const info = resolve(box);
    if (!IS_VIDEO[info.type]) return; // דשבורדים נשארים טעונים, כדי לא לחכות שוב
    renderFallback(box, info, box.dataset.title || "");
    box.dataset.state = "idle";
  }

  function embedsIn(slide) {
    return slide ? Array.prototype.slice.call(slide.querySelectorAll(".embed")) : [];
  }

  // קוראים לזה אחרי Reveal.initialize(): Reveal.initialize({...}).then(() => DeckEmbeds.init(Reveal))
  function init(Reveal) {
    // הכנה ראשונית: שורת מקור וכרטיס חלופי לכל הטמעה
    document.querySelectorAll(".reveal .embed").forEach(function (box) {
      const info = resolve(box);
      addCaption(box, info);
      renderFallback(box, info, box.dataset.title || "");
      box.dataset.state = "idle";
    });
    if (PRINT) return;

    // טוענים רק שקף גלוי: iframe שנטען כשהשקף מוסתר מקבל גודל שגוי (מפות, דשבורדים)
    function show(slide) {
      embedsIn(slide).forEach(load);
    }

    // init נקרא אחרי Reveal.initialize(), אז השקף הנוכחי כבר ידוע
    show(Reveal.getCurrentSlide());
    Reveal.on("slidechanged", function (e) {
      embedsIn(e.previousSlide).forEach(unload);
      show(e.currentSlide);
    });
    window.addEventListener("online", function () { show(Reveal.getCurrentSlide()); });
  }

  window.DeckEmbeds = { init: init, resolve: resolve };
})();
