/**
 * Evasive Button Engine ("Gak Mau")
 * Tombol penolakan yang menghindar, label tetap "Gak dulu, makasih",
 * dan SELALU berada di dalam area layar yang terlihat.
 */

const EvasiveButton = {
  btnElement: null,
  dodgeCount: 0,
  label: "Gak dulu, makasih",
  margin: 16,
  topSafe: 80, // di bawah navbar

  init(elementId = 'btnNo') {
    this.btnElement = document.getElementById(elementId);
    if (!this.btnElement || this.btnElement.dataset.evasiveReady) return;
    this.btnElement.dataset.evasiveReady = '1';

    // Preload audio cartoonslip
    if (window.SoundEffects && typeof SoundEffects.initSlipPool === 'function') {
      SoundEffects.initSlipPool();
    }

    const events = ['pointerenter', 'pointerover', 'pointerdown', 'touchstart', 'focus'];
    events.forEach(evt => {
      this.btnElement.addEventListener(evt, (e) => this.dodge(e), { passive: false });
    });

    this.btnElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dodge(e);
    });

    const reclamp = () => this.clampPosition();
    window.addEventListener('resize', reclamp);
    window.addEventListener('scroll', reclamp);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', reclamp);
    }
  },

  // Ukuran area layar yang benar-benar terlihat (aman untuk mobile)
  getViewport() {
    const vv = window.visualViewport;
    return {
      width: vv ? vv.width : document.documentElement.clientWidth,
      height: vv ? vv.height : window.innerHeight
    };
  },

  // Pindahkan tombol ke <body> agar position:fixed tidak terpengaruh
  // oleh parent yang memakai transform (penyebab tombol keluar layar)
  detachToBody() {
    const btn = this.btnElement;
    if (btn.parentElement === document.body) return;

    const rect = btn.getBoundingClientRect();
    // Placeholder agar layout kartu tidak "loncat"
    const placeholder = document.createElement('div');
    placeholder.style.width = rect.width + 'px';
    placeholder.style.height = rect.height + 'px';
    btn.parentElement.insertBefore(placeholder, btn);

    document.body.appendChild(btn);
    btn.style.position = 'fixed';
    btn.style.zIndex = '999';
    btn.style.margin = '0';
    btn.style.left = rect.left + 'px';
    btn.style.top = rect.top + 'px';
    btn.style.transition = 'left 0.25s ease-out, top 0.25s ease-out';
  },

  getBounds() {
    const vp = this.getViewport();
    const w = this.btnElement.offsetWidth || 120;
    const h = this.btnElement.offsetHeight || 45;
    const minLeft = this.margin;
    const minTop = Math.min(this.topSafe, Math.max(this.margin, vp.height - h - this.margin));
    return {
      w, h,
      minLeft,
      maxLeft: Math.max(minLeft, vp.width - w - this.margin),
      minTop,
      maxTop: Math.max(minTop, vp.height - h - this.margin)
    };
  },

  dodge(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!this.btnElement) return;

    if (window.SoundEffects) {
      if (typeof SoundEffects.playSlip === 'function') {
        SoundEffects.playSlip();
      } else {
        SoundEffects.playFile('slip');
      }
    }
    this.dodgeCount++;

    // Label tetap "Gak dulu, makasih"
    this.btnElement.textContent = this.label;

    this.detachToBody();
    const b = this.getBounds();

    // Posisi pointer/jari
    let px = b.minLeft, py = b.minTop;
    const rect = this.btnElement.getBoundingClientRect();
    px = rect.left + rect.width / 2;
    py = rect.top + rect.height / 2;
    if (e) {
      if (e.touches && e.touches[0]) {
        px = e.touches[0].clientX; py = e.touches[0].clientY;
      } else if (typeof e.clientX === 'number' && (e.clientX || e.clientY)) {
        px = e.clientX; py = e.clientY;
      }
    }

    // Cari posisi acak yang jauh dari pointer, tetap di dalam layar
    let best = null, bestDist = -1;
    for (let i = 0; i < 25; i++) {
      const x = b.minLeft + Math.random() * (b.maxLeft - b.minLeft);
      const y = b.minTop + Math.random() * (b.maxTop - b.minTop);
      const dx = x + b.w / 2 - px;
      const dy = y + b.h / 2 - py;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > bestDist) { best = { x, y }; bestDist = d; }
      if (d > 160) break;
    }

    this.btnElement.style.left = Math.round(best.x) + 'px';
    this.btnElement.style.top = Math.round(best.y) + 'px';

    if (this.dodgeCount >= 3) {
      const hint = document.getElementById('decisionHint');
      if (hint) {
        hint.textContent = "Tombolnya kabur terus kan? Mending kita jalan beneran aja yukss 💖";
        hint.classList.add('text-crimson-600', 'font-bold');
      }
    }
  },

  clampPosition() {
    const btn = this.btnElement;
    if (!btn || btn.parentElement !== document.body) return;
    const b = this.getBounds();
    const left = Math.min(Math.max(parseFloat(btn.style.left) || b.minLeft, b.minLeft), b.maxLeft);
    const top = Math.min(Math.max(parseFloat(btn.style.top) || b.minTop, b.minTop), b.maxTop);
    btn.style.left = left + 'px';
    btn.style.top = top + 'px';
  }
};
