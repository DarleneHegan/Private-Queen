/**
 * Evasive Button Engine ("Gak Mau")
 * Tombol penolakan yang super sensitif menghindar, label tetap "Gak dulu, makasih",
 * dan SELALU berada di dalam area layar yang terlihat.
 * Dilengkapi proximity detector khusus mobile agar saat jari mendekati layar,
 * tombol langsung berpindah secara kilat.
 */

const EvasiveButton = {
  btnElement: null,
  dodgeCount: 0,
  label: "Gak dulu, makasih",
  margin: 16,
  topSafe: 20, // Navbar sudah dihapus, cukup batas aman 20px
  _lastDodgeTime: 0,

  init(elementId = 'btnNo') {
    this.btnElement = document.getElementById(elementId);
    if (!this.btnElement || this.btnElement.dataset.evasiveReady) return;
    this.btnElement.dataset.evasiveReady = '1';

    // Preload audio cartoonslip
    if (window.SoundEffects && typeof SoundEffects.initSlipPool === 'function') {
      SoundEffects.initSlipPool();
    }

    // 1. Sentuhan / klik langsung pada elemen tombol
    const directEvents = [
      'pointerenter', 'pointerover', 'pointerdown',
      'touchstart', 'touchend', 'touchcancel',
      'mousedown', 'focus'
    ];
    directEvents.forEach(evt => {
      this.btnElement.addEventListener(evt, (e) => this.dodge(e), { passive: false });
    });

    this.btnElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dodge(e);
    });

    // 2. PROXIMITY SENSOR (Sensitivitas Jarak Jari di Mobile & Pointer di Desktop):
    // Saat jari user baru mendekati area tombol (radius ~80px di mobile),
    // tombol langsung kabur seketika sebelum jari sempat menempel!
    const handleProximity = (e) => {
      if (!this.btnElement) return;

      let x, y;
      if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if (typeof e.clientX === 'number') {
        x = e.clientX;
        y = e.clientY;
      } else {
        return;
      }

      const rect = this.btnElement.getBoundingClientRect();
      // Hitung jarak terdekat dari titik jari/kursor ke kotak tombol
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Ambang batas sensitivitas:
      // Mobile touch: 80px (sangat sensitif saat jari mendekati tombol)
      // Desktop pointer: 60px
      const isTouch = (e.type && e.type.startsWith('touch')) || (e.pointerType === 'touch');
      const proximityThreshold = isTouch ? 80 : 60;

      if (dist < proximityThreshold) {
        this.dodge(e);
      }
    };

    window.addEventListener('touchstart', handleProximity, { passive: false });
    window.addEventListener('touchmove', handleProximity, { passive: false });
    window.addEventListener('pointermove', handleProximity, { passive: true });
    window.addEventListener('pointerdown', handleProximity, { passive: false });

    // Re-clamp posisi saat layar berubah ukuran atau orientasi
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
    // Placeholder agar posisi tombol YES tetap stabil
    const placeholder = document.createElement('div');
    placeholder.id = 'btnNoPlaceholder';
    placeholder.style.width = rect.width + 'px';
    placeholder.style.height = rect.height + 'px';
    placeholder.style.flexShrink = '0';
    btn.parentElement.insertBefore(placeholder, btn);

    document.body.appendChild(btn);
    btn.style.position = 'fixed';
    btn.style.zIndex = '9999';
    btn.style.margin = '0';
    btn.style.left = Math.round(rect.left) + 'px';
    btn.style.top = Math.round(rect.top) + 'px';
    // Animasi kilat (0.11s) agar langsung melesat secepat kilat
    btn.style.transition = 'left 0.11s cubic-bezier(0.15, 0.9, 0.2, 1), top 0.11s cubic-bezier(0.15, 0.9, 0.2, 1)';
    btn.style.willChange = 'left, top';
    btn.style.touchAction = 'none'; // Hilangkan 300ms tap delay di mobile
  },

  getBounds() {
    const vp = this.getViewport();
    const w = this.btnElement.offsetWidth || 130;
    const h = this.btnElement.offsetHeight || 48;
    const minLeft = this.margin;
    const maxLeft = Math.max(minLeft, vp.width - w - this.margin);
    const minTop = this.topSafe;
    const maxTop = Math.max(minTop, vp.height - h - this.margin);
    return {
      w, h,
      minLeft,
      maxLeft,
      minTop,
      maxTop
    };
  },

  dodge(e) {
    if (e && e.cancelable) {
      e.preventDefault();
    }
    if (e) {
      e.stopPropagation();
    }
    if (!this.btnElement) return;

    // Batasi jeda mikro antar-dodge (40ms) agar tidak duplicate jump di frame yang sama
    const now = Date.now();
    if (this._lastDodgeTime && now - this._lastDodgeTime < 45) return;
    this._lastDodgeTime = now;

    // Putar sound effect lucu cartoonslip.mp3
    try {
      if (window.SoundEffects && typeof SoundEffects.playSlip === 'function') {
        SoundEffects.playSlip(1.0);
      } else {
        const slip = new Audio('Addons/Sound%20Effect/cartoonslip.mp3');
        slip.volume = 1.0;
        slip.play().catch(() => {});
      }
    } catch (err) {}
    this.dodgeCount++;

    // Label tetap "Gak dulu, makasih"
    this.btnElement.textContent = this.label;

    this.detachToBody();
    const b = this.getBounds();
    const vp = this.getViewport();

    // Posisi pointer / jari saat memicu
    let px = (b.minLeft + b.maxLeft) / 2;
    let py = (b.minTop + b.maxTop) / 2;
    if (e) {
      if (e.touches && e.touches[0]) {
        px = e.touches[0].clientX;
        py = e.touches[0].clientY;
      } else if (typeof e.clientX === 'number' && (e.clientX || e.clientY)) {
        px = e.clientX;
        py = e.clientY;
      }
    }

    // Strategi Cerdas: Otomatis melompat ke sisi berlawanan dari posisi jari/kursor
    // Jika jari ada di kanan, lempar ke kiri; jika jari di bawah, lempar ke atas
    let best = null, bestDist = -1;
    for (let i = 0; i < 22; i++) {
      let x, y;
      if (Math.random() < 0.8) {
        // 80% kemungkinan lempar ke kuadran berlawanan
        if (px > vp.width / 2) {
          x = b.minLeft + Math.random() * ((b.maxLeft - b.minLeft) * 0.45);
        } else {
          x = b.minLeft + (b.maxLeft - b.minLeft) * 0.55 + Math.random() * ((b.maxLeft - b.minLeft) * 0.45);
        }
        if (py > vp.height / 2) {
          y = b.minTop + Math.random() * ((b.maxTop - b.minTop) * 0.45);
        } else {
          y = b.minTop + (b.maxTop - b.minTop) * 0.55 + Math.random() * ((b.maxTop - b.minTop) * 0.45);
        }
      } else {
        x = b.minLeft + Math.random() * (b.maxLeft - b.minLeft);
        y = b.minTop + Math.random() * (b.maxTop - b.minTop);
      }

      const dx = x + b.w / 2 - px;
      const dy = y + b.h / 2 - py;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > bestDist) {
        best = { x, y };
        bestDist = d;
      }
      if (d > 220) break;
    }

    if (!best) {
      best = {
        x: px > vp.width / 2 ? b.minLeft : b.maxLeft,
        y: py > vp.height / 2 ? b.minTop : b.maxTop
      };
    }

    this.btnElement.style.left = Math.round(best.x) + 'px';
    this.btnElement.style.top = Math.round(best.y) + 'px';

    // Munculkan tulisan notif setelah tombol bergeser/kabur minimal 3 kali
    if (this.dodgeCount >= 3) {
      const hint = document.getElementById('decisionHint');
      if (hint) {
        hint.textContent = "Muehehe tombolnya kabur terus tuh, jadiin aja yokk....";
        hint.classList.remove('hidden');
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
