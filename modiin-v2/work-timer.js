/* <work-timer> — a self-contained countdown timer for worksheet / group-work slides.
 * Attributes:
 *   minutes  — starting minutes (default 5)
 *   presets  — comma-separated preset minutes, e.g. "3,5,10" (rendered as buttons)
 *   accent   — main color (default #0E7C68)
 * No dependencies. Styled entirely in shadow DOM. RTL-aware.
 */
(function () {
  if (customElements.get('work-timer')) return;

  class WorkTimer extends HTMLElement {
    constructor() {
      super();
      this._root = this.attachShadow({ mode: 'open' });
      this._remaining = 0;      // seconds
      this._total = 0;          // seconds
      this._running = false;
      this._tick = this._tick.bind(this);
      this._raf = null;
      this._last = 0;
    }

    connectedCallback() {
      const presets = (this.getAttribute('presets') || '')
        .split(',').map(s => parseInt(s.trim(), 10)).filter(n => n > 0);
      const startMin = parseInt(this.getAttribute('minutes') || '5', 10);
      this._accent = this.getAttribute('accent') || '#0E7C68';
      this._presets = presets.length ? presets : [startMin];
      this._selected = this._presets.includes(startMin) ? startMin : this._presets[0];
      this._setTime(this._selected * 60);
      this._render();
      // Clicks anywhere on the timer (buttons, display, padding) must not
      // bubble to the deck's tap-to-navigate handler and flip the slide.
      this.addEventListener('click', (e) => e.stopPropagation());
      this.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    disconnectedCallback() { this._stop(); }

    _setTime(sec) {
      this._total = sec;
      this._remaining = sec;
      this._running = false;
      this._stop();
      this._update();
    }

    _fmt(sec) {
      sec = Math.max(0, Math.round(sec));
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    _stop() {
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    }

    _start() {
      if (this._remaining <= 0) return;
      this._running = true;
      this._last = performance.now();
      this._raf = requestAnimationFrame(this._tick);
      this._update();
    }

    _pause() {
      this._running = false;
      this._stop();
      this._update();
    }

    _toggle() { this._running ? this._pause() : this._start(); }

    _reset() { this._setTime(this._selected * 60); }

    _tick(now) {
      if (!this._running) return;
      const dt = (now - this._last) / 1000;
      this._last = now;
      this._remaining -= dt;
      if (this._remaining <= 0) {
        this._remaining = 0;
        this._running = false;
        this._stop();
        this._update();
        this._flash();
        return;
      }
      this._update();
      this._raf = requestAnimationFrame(this._tick);
    }

    _flash() {
      const box = this._root.querySelector('.wrap');
      if (box) { box.classList.add('done'); }
    }

    _selectPreset(min) {
      this._selected = min;
      this._setTime(min * 60);
      this._root.querySelectorAll('.preset').forEach(b => {
        b.classList.toggle('on', +b.dataset.min === min);
      });
      const box = this._root.querySelector('.wrap');
      if (box) box.classList.remove('done');
    }

    _update() {
      const disp = this._root.querySelector('.disp');
      if (disp) disp.textContent = this._fmt(this._remaining);
      const btn = this._root.querySelector('.startbtn');
      if (btn) {
        btn.innerHTML = this._running
          ? '<span class="ic">&#10073;&#10073;</span> השהה'
          : '<span class="ic">&#9654;</span> התחל';
        btn.style.background = this._running ? '#B4453D' : this._accent;
      }
      const ring = this._root.querySelector('.ring');
      if (ring) {
        const pct = this._total ? (this._remaining / this._total) : 0;
        ring.style.background = `conic-gradient(${this._accent} ${pct * 360}deg, rgba(0,0,0,.08) 0deg)`;
      }
    }

    _render() {
      const presetBtns = this._presets.map(m =>
        `<button class="preset ${m === this._selected ? 'on' : ''}" data-min="${m}">${m}</button>`
      ).join('');
      this._root.innerHTML = `
        <style>
          :host{display:inline-block;font-family:inherit;direction:rtl;}
          .wrap{display:flex;align-items:center;gap:26px;background:#fff;border:1px solid #E4EAE8;
                border-radius:22px;padding:22px 26px;box-shadow:0 8px 30px rgba(0,0,0,.08);transition:box-shadow .3s;}
          .wrap.done{box-shadow:0 0 0 4px rgba(240,80,96,.5),0 8px 30px rgba(0,0,0,.1);animation:pulseDone 1s ease-in-out infinite;}
          @keyframes pulseDone{0%,100%{box-shadow:0 0 0 4px rgba(240,80,96,.35),0 8px 30px rgba(0,0,0,.1);}50%{box-shadow:0 0 0 10px rgba(240,80,96,.15),0 8px 30px rgba(0,0,0,.1);}}
          .left{display:flex;flex-direction:column;gap:12px;}
          .presets{display:flex;gap:10px;}
          .preset{width:56px;height:52px;border-radius:14px;border:1px solid #E4EAE8;background:#F5F8F7;
                  color:#0E7C68;font-size:26px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .15s;}
          .preset:hover{border-color:${this._accent};}
          .preset.on{background:${this._accent};color:#fff;border-color:${this._accent};}
          .controls{display:flex;gap:10px;align-items:center;}
          .startbtn{display:inline-flex;align-items:center;gap:10px;border:none;color:#fff;border-radius:14px;
                    padding:0 26px;height:56px;font-size:26px;font-weight:800;cursor:pointer;font-family:inherit;}
          .ic{font-size:20px;line-height:1;}
          .resetbtn{width:56px;height:56px;border-radius:14px;border:1px solid #E4EAE8;background:#F5F8F7;
                    font-size:26px;cursor:pointer;color:#5B6B67;font-family:inherit;}
          .resetbtn:hover{background:#ECF1EF;}
          .dispwrap{display:flex;align-items:center;gap:20px;}
          .ring{width:26px;height:26px;border-radius:50%;flex-shrink:0;}
          .disp{font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;font-size:76px;font-weight:700;
                letter-spacing:2px;color:${this._accent};line-height:1;min-width:200px;text-align:center;}
        </style>
        <div class="wrap">
          <div class="left">
            <div class="presets">${presetBtns}</div>
            <div class="controls">
              <button class="startbtn"></button>
              <button class="resetbtn" title="איפוס">&#8635;</button>
            </div>
          </div>
          <div class="dispwrap">
            <span class="ring"></span>
            <div class="disp">00:00</div>
          </div>
        </div>`;
      this._root.querySelector('.startbtn').addEventListener('click', () => this._toggle());
      this._root.querySelector('.resetbtn').addEventListener('click', () => this._reset());
      this._root.querySelectorAll('.preset').forEach(b =>
        b.addEventListener('click', () => this._selectPreset(+b.dataset.min)));
      this._update();
    }
  }

  customElements.define('work-timer', WorkTimer);
})();
