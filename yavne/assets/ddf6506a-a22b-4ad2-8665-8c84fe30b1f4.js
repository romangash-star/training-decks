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
          .time.warn { color:#F05060; }
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
          .custom { display:flex; align-items:center; gap:10px; justify-content:flex-start; }
          .step {
            font-family:inherit; font-size:30px; font-weight:700; cursor:pointer; line-height:1;
            border:1px solid #CFE3DF; background:#EAF4F2; color:#0A8A7A;
            border-radius:12px; width:52px; height:52px; transition:all .15s ease;
          }
          .step:hover { background:#dcefeb; }
          .mins {
            font-family:inherit; font-size:30px; font-weight:700; color:#0A8A7A; text-align:center;
            width:90px; height:52px; border:1px solid #CFE3DF; background:#fff; border-radius:12px;
            -moz-appearance:textfield;
          }
          .mins::-webkit-outer-spin-button, .mins::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
          .lbl { font-family:inherit; font-size:24px; font-weight:700; color:#6B7280; }
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
            <div class="custom">
              <button class="step" id="minus" title="פחות דקה">−</button>
              <input class="mins" id="mins" type="number" min="1" max="180" inputmode="numeric">
              <span class="lbl">דק׳</span>
              <button class="step" id="plus" title="עוד דקה">+</button>
            </div>
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
        b.addEventListener('click', () => this._setMinutes(m));
        presetWrap.appendChild(b);
      });
      this._presetWrap = presetWrap;
      this._minsInput = root.getElementById('mins');
      this._minsInput.value = this._mins;
      root.getElementById('minus').addEventListener('click', () => this._setMinutes(this._mins - 1));
      root.getElementById('plus').addEventListener('click', () => this._setMinutes(this._mins + 1));
      this._minsInput.addEventListener('change', () => this._setMinutes(parseInt(this._minsInput.value, 10)));
      this._minsInput.addEventListener('keydown', (e) => e.stopPropagation());
      this._runBtn.addEventListener('click', () => this._toggle());
      root.getElementById('reset').addEventListener('click', () => this._reset());
      this._paint();
      // Don't let taps on the timer bubble to the deck's tap-to-navigate.
      this.addEventListener('click', (e) => e.stopPropagation());
      this.addEventListener('pointerdown', (e) => e.stopPropagation());

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
    _setMinutes(m) {
      m = Math.max(1, Math.min(180, m || 1));
      this._mins = m;
      if (this._presetWrap) [...this._presetWrap.children].forEach((c) => {
        if (parseInt(c.textContent, 10) === m) c.setAttribute('data-active', '');
        else c.removeAttribute('data-active');
      });
      if (this._minsInput) this._minsInput.value = m;
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
        // Reveal is the tap's job here — don't also let it flip the slide.
        e.stopPropagation();
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
})();
