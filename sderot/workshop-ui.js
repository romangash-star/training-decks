// Workshop interactive elements: <practice-timer> and <click-reveal>.
// Plain web components, loaded from the deck's <helmet>. No deps.
(() => {
  /* ───────────────────────── practice-timer ─────────────────────────
   * Presenter-controlled countdown for "now let's practice" slides.
   *   <practice-timer minutes="7" presets="5,7,10"></practice-timer>
   * Big MM:SS display + preset minute chips + Start/Pause + Reset.
   * Turns coral in the final 30s and flashes on zero.
   */
  class PracticeTimer extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      // Keep taps inside the timer from bubbling to the deck's tap-to-advance
      // (so clicking the big number / card never flips to the next slide).
      this.addEventListener('click', (e) => e.stopPropagation());
      const presets = (this.getAttribute('presets') || '5,7,10')
        .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
      this._mins = parseInt(this.getAttribute('minutes'), 10) || presets[0] || 5;
      this._remaining = this._mins * 60;
      this._running = false;
      this._tick = this._tick.bind(this);

      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          :host { display:block; direction:rtl; }
          .card {
            display:flex; align-items:center; justify-content:space-between; gap:40px;
            background:#fff; border:1px solid #E2E8E6; border-radius:24px;
            padding:30px 44px; box-shadow:0 10px 40px rgba(10,138,122,.10);
            font-family:'Alef',-apple-system,sans-serif;
          }
          .time {
            font-size:108px; font-weight:700; line-height:1; letter-spacing:1px;
            color:#0A8A7A; font-variant-numeric:tabular-nums; direction:ltr;
            min-width:300px; text-align:center; transition:color .3s ease;
          }
          .time { cursor:pointer; }
          .time.warn { color:#F05060; }
          :host([compact]) .card { padding:16px 26px; gap:22px; }
          :host([compact]) .time { font-size:66px; min-width:178px; }
          :host([compact]) .chip { font-size:20px; padding:8px 16px; min-width:54px; }
          :host([compact]) .btn { font-size:21px; padding:9px 22px; }
          :host([compact]) .controls { gap:12px; }
          .time.done { animation:tflash 1s steps(2) infinite; }
          @keyframes tflash { 50% { opacity:.25; } }
          .controls { display:flex; flex-direction:column; gap:18px; align-items:stretch; }
          .presets { display:flex; gap:12px; }
          .chip {
            font-family:inherit; font-size:26px; font-weight:700; cursor:pointer;
            border:1px solid #CFE3DF; background:#EAF4F2; color:#0A8A7A;
            border-radius:14px; padding:12px 26px; transition:all .15s ease; min-width:74px;
          }
          .chip:hover { background:#dcefeb; }
          .chip[data-active] { background:#0A8A7A; color:#fff; border-color:#0A8A7A; }
          .actions { display:flex; gap:12px; }
          .btn {
            font-family:inherit; font-size:27px; font-weight:700; cursor:pointer;
            border:none; border-radius:14px; padding:14px 34px; flex:1;
            display:flex; align-items:center; justify-content:center; gap:10px;
            transition:filter .15s ease;
          }
          .btn:hover { filter:brightness(1.06); }
          .btn.run { background:#0A8A7A; color:#fff; }
          .btn.run[data-running] { background:#F05060; }
          .btn.reset { background:#F0F1F3; color:#6B7280; padding:14px 24px; flex:0 0 auto; }
        </style>
        <div class="card">
          <div class="time" id="t">00:00</div>
          <div class="controls">
            <div class="presets" id="presets"></div>
            <div class="actions">
              <button class="btn run" id="run">▶ התחל</button>
              <button class="btn reset" id="reset" title="איפוס">↺</button>
            </div>
          </div>
        </div>`;
      this._timeEl = root.getElementById('t');
      this._runBtn = root.getElementById('run');
      const presetWrap = root.getElementById('presets');
      presets.forEach((m) => {
        const b = document.createElement('button');
        b.className = 'chip';
        b.textContent = m;
        if (m === this._mins) b.setAttribute('data-active', '');
        b.addEventListener('click', () => this._setMinutes(m, presetWrap));
        presetWrap.appendChild(b);
      });
      this._runBtn.addEventListener('click', () => this._toggle());
      this._timeEl.addEventListener('click', () => this._toggle());
      root.getElementById('reset').addEventListener('click', () => this._reset());
      this._paint();

      // Reset when this timer's slide leaves view, so it's fresh next time.
      this._onSlide = (e) => {
        const slide = e.detail && e.detail.slide;
        if (slide && !slide.contains(this) && this._running) this._reset();
      };
      document.addEventListener('slidechange', this._onSlide);
    }
    disconnectedCallback() {
      this._stop();
      if (this._onSlide) document.removeEventListener('slidechange', this._onSlide);
    }
    _setMinutes(m, wrap) {
      this._mins = m;
      [...wrap.children].forEach((c) => {
        if (parseInt(c.textContent, 10) === m) c.setAttribute('data-active', '');
        else c.removeAttribute('data-active');
      });
      this._reset();
    }
    _toggle() { this._running ? this._stop() : this._start(); }
    _start() {
      if (this._remaining <= 0) this._remaining = this._mins * 60;
      this._running = true;
      this._endAt = Date.now() + this._remaining * 1000;
      this._iv = setInterval(this._tick, 250);
      this._runBtn.textContent = '⏸ השהה';
      this._runBtn.setAttribute('data-running', '');
      this._timeEl.classList.remove('done');
    }
    _stop() {
      this._running = false;
      if (this._iv) clearInterval(this._iv);
      this._runBtn.textContent = '▶ המשך';
      this._runBtn.removeAttribute('data-running');
    }
    _reset() {
      this._stop();
      this._remaining = this._mins * 60;
      this._runBtn.textContent = '▶ התחל';
      this._timeEl.classList.remove('done');
      this._paint();
    }
    _tick() {
      this._remaining = Math.max(0, Math.round((this._endAt - Date.now()) / 1000));
      this._paint();
      if (this._remaining <= 0) {
        this._stop();
        this._runBtn.textContent = '▶ שוב';
        this._timeEl.classList.add('done');
      }
    }
    _paint() {
      const m = Math.floor(this._remaining / 60), s = this._remaining % 60;
      this._timeEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      this._timeEl.classList.toggle('warn', this._remaining <= 30 && this._remaining > 0);
    }
  }
  if (!customElements.get('practice-timer')) customElements.define('practice-timer', PracticeTimer);

  /* ───────────────────────── click-reveal ─────────────────────────
   * Progressive reveal of children on click. Children carry [data-reveal];
   * everything before the first [data-reveal] stays always-visible.
   *   <click-reveal initial="0"> ...items with data-reveal... </click-reveal>
   * Click anywhere on it (or Enter) to reveal the next item. A small hint
   * shows how many remain. Resets when its slide regains focus.
   */
  class ClickReveal extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', '0');
      this.style.cursor = 'pointer';
      this.style.display = this.style.display || 'block';
      this._items = [...this.querySelectorAll('[data-reveal]')];
      this._shown = parseInt(this.getAttribute('initial'), 10) || 0;
      this._items.forEach((el, i) => {
        el.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1)';
        if (i >= this._shown) { el.style.opacity = '0'; el.style.transform = 'translateY(14px)'; }
      });
      this._hint = document.createElement('div');
      this.appendChild(this._hint);
      this._sync();
      this.addEventListener('click', (e) => {
        // ignore clicks on real controls inside
        if (e.target.closest('a,button,input')) return;
        this._next();
      });
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); this._next(); }
      });
      this._onSlide = (ev) => {
        const slide = ev.detail && ev.detail.slide;
        if (slide && slide.contains(this)) this._reset();
      };
      document.addEventListener('slidechange', this._onSlide);
    }
    disconnectedCallback() {
      if (this._onSlide) document.removeEventListener('slidechange', this._onSlide);
    }
    _next() {
      if (this._shown >= this._items.length) return;
      const el = this._items[this._shown];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      this._shown++;
      this._sync();
    }
    _reset() {
      this._shown = parseInt(this.getAttribute('initial'), 10) || 0;
      this._items.forEach((el, i) => {
        if (i >= this._shown) { el.style.opacity = '0'; el.style.transform = 'translateY(14px)'; }
        else { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }
      });
      this._sync();
    }
    _sync() {
      const left = this._items.length - this._shown;
      const hintStyle = this.getAttribute('hint-style') || '';
      this._hint.setAttribute('style',
        'margin-top:26px;font-size:24px;font-weight:700;color:#0A8A7A;display:flex;align-items:center;gap:10px;transition:opacity .3s;' +
        (left ? 'opacity:1;' : 'opacity:0;') + hintStyle);
      this._hint.innerHTML = left
        ? '<span style="display:inline-flex;width:34px;height:34px;border-radius:50%;background:#0A8A7A;color:#fff;align-items:center;justify-content:center;font-size:22px;">+</span> לחצו כדי לחשוף את השלב הבא · נותרו ' + left
        : '✓ כל השלבים מוצגים';
    }
  }
  if (!customElements.get('click-reveal')) customElements.define('click-reveal', ClickReveal);

  /* ───────────────────────── chat-sim ─────────────────────────
   * Typewriter prompt + streamed AI answer, inside any [data-chat-sim].
   * Children: [data-cs-prompt] (typed char by char, keeps its colored spans),
   * [data-cs-answer] (box that appears after), [data-cs-text] (streamed word
   * by word), optional [data-cs-replay]. Starts when its slide is active and
   * the block is revealed; shows full text when the slide isn't active.
   */
  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function setup(root) {
      if (root._cs) return root._cs;
      var prompt = root.querySelector('[data-cs-prompt]');
      var box = root.querySelector('[data-cs-answer]');
      var txt = root.querySelector('[data-cs-text]');
      if (!prompt || !box || !txt) return null;
      var nodes = [], w = document.createTreeWalker(prompt, NodeFilter.SHOW_TEXT, {
        acceptNode: function (t) { return t.parentNode.closest('[data-cs-skip]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
      }), n;
      while ((n = w.nextNode())) nodes.push({ node: n, text: n.nodeValue });
      var answer = txt.textContent;
      var words = answer.match(/\S+\s*/g) || [];
      var caret = document.createElement('span');
      caret.setAttribute('aria-hidden', 'true');
      caret.style.cssText = 'display:inline-block;width:3px;height:1em;background:#F0B95A;margin:0 4px;vertical-align:-0.12em;animation:csBlink 1s steps(1) infinite;';
      var st = { state: 'idle', t: null };
      function clear() { if (st.t) clearTimeout(st.t); st.t = null; if (caret.parentNode) caret.parentNode.removeChild(caret); }
      st.restore = function () {
        clear(); nodes.forEach(function (o) { o.node.nodeValue = o.text; });
        txt.textContent = answer; box.style.opacity = '1'; box.style.transform = 'none'; st.state = 'idle';
      };
      st.arm = function () {
        clear(); nodes.forEach(function (o) { o.node.nodeValue = ''; });
        txt.textContent = ''; box.style.transition = 'none'; box.style.opacity = '0'; box.style.transform = 'translateY(16px)'; st.state = 'armed';
      };
      st.run = function () {
        st.arm(); st.state = 'running';
        var ni = 0, ci = 0, wi = 0;
        caret.style.background = '#F0B95A';
        function type() {
          while (ni < nodes.length && ci >= nodes[ni].text.length) { ni++; ci = 0; }
          if (ni >= nodes.length) { st.t = setTimeout(waitAnswer, 700); return; }
          var o = nodes[ni]; ci++;
          o.node.nodeValue = o.text.slice(0, ci);
          o.node.parentNode.insertBefore(caret, o.node.nextSibling);
          var ch = o.text.charAt(ci - 1);
          st.t = setTimeout(type, (ch === '.' || ch === ',') ? 220 : 26 + Math.random() * 34);
        }
        // If the answer box has its own click step, hold here until that click.
        function waitAnswer() {
          if (box.closest('[data-fragment]:not(.revealed)')) {
            if (caret.parentNode) caret.parentNode.removeChild(caret);
            st.t = setTimeout(waitAnswer, 150); return;
          }
          think();
        }
        function think() {
          if (caret.parentNode) caret.parentNode.removeChild(caret);
          box.style.transition = 'opacity .45s ease, transform .45s ease';
          box.style.opacity = '1'; box.style.transform = 'none';
          txt.innerHTML = '<span style="display:inline-flex;gap:10px;padding:10px 0;">' + [0, 1, 2].map(function (i) {
            return '<span style="width:13px;height:13px;border-radius:50%;background:#1f5f5b;animation:nodeBlink 1s ease-in-out ' + (i * 0.18) + 's infinite;"></span>';
          }).join('') + '</span>';
          st.t = setTimeout(stream, 1400);
        }
        function stream() {
          if (wi === 0) { txt.textContent = ''; caret.style.background = '#1f5f5b'; }
          if (caret.parentNode) caret.parentNode.removeChild(caret);
          txt.appendChild(document.createTextNode(words[wi++]));
          txt.appendChild(caret);
          if (wi < words.length) st.t = setTimeout(stream, 60 + Math.random() * 80);
          else st.t = setTimeout(function () { clear(); st.state = 'done'; }, 700);
        }
        type();
      };
      var rp = root.querySelector('[data-cs-replay]');
      if (rp) rp.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); st.run(); });
      root._cs = st;
      return st;
    }
    function tick() {
      document.querySelectorAll('[data-chat-sim]').forEach(function (root) {
        var st = setup(root); if (!st) return;
        if (reduce) { if (st.state !== 'idle') st.restore(); return; }
        var slide = root.closest('section');
        var active = slide && slide.hasAttribute('data-deck-active');
        var hidden = !!root.closest('[data-fragment]:not(.revealed)');
        if (!active) { if (st.state !== 'idle') st.restore(); return; }
        if (hidden) { if (st.state !== 'armed') st.arm(); return; }
        if (st.state === 'armed' || st.state === 'idle') st.run();
      });
    }
    setInterval(tick, 200);
  })();
})();
