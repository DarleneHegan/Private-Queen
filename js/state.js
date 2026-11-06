/**
 * State Management & Data Persistence
 * Memastikan nama pasangan dan pengaturan tersimpan di semua halaman.
 */

const AppState = {
  // Nilai default
  defaultName: "Naizka",
  recipientName: "Naizka",
  soundEnabled: true,

  // Inisialisasi data: nama otomatis Naizka & SFX auto nyala
  init() {
    this.recipientName = "Naizka";
    this.soundEnabled = true;
    localStorage.setItem('date_invite_recipient', "Naizka");
    localStorage.setItem('date_invite_sound', 'true');

    this.syncDisplays();
  },

  // Simpan nama baru
  setRecipientName(name) {
    if (name && name.trim()) {
      this.recipientName = name.trim();
      localStorage.setItem('date_invite_recipient', this.recipientName);
      this.syncDisplays();
    }
  },

  // Sinkronisasi teks nama di seluruh elemen halaman
  syncDisplays() {
    document.querySelectorAll('[data-recipient-name]').forEach(el => {
      el.textContent = this.recipientName;
    });

    const navName = document.getElementById('navRecipientName');
    if (navName) navName.textContent = this.recipientName;

    const heroDisplay = document.getElementById('heroRecipientDisplay');
    if (heroDisplay) heroDisplay.textContent = this.recipientName;

    const ticketName = document.getElementById('ticketPassengerName');
    if (ticketName) ticketName.textContent = this.recipientName;
  },

  // Toggle suara
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('date_invite_sound', this.soundEnabled);
    this.syncSoundUI();
  },

  // Sinkronisasi UI tombol suara
  syncSoundUI() {
    const soundIcon = document.getElementById('soundIcon');
    const soundStatusText = document.getElementById('soundStatusText');
    if (soundIcon) {
      soundIcon.setAttribute('data-lucide', this.soundEnabled ? 'volume-2' : 'volume-x');
    }
    if (soundStatusText) {
      soundStatusText.textContent = this.soundEnabled ? 'SFX Nyala' : 'SFX Mati';
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
};

// Modal Ganti Nama Pasangan
function openNameModal() {
  if (window.SoundEffects) SoundEffects.play('click');
  const modal = document.getElementById('nameModal');
  const input = document.getElementById('nameInputModal');
  if (modal && input) {
    input.value = AppState.recipientName;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => input.focus(), 100);
  }
}

function closeNameModal() {
  if (window.SoundEffects) SoundEffects.play('click');
  const modal = document.getElementById('nameModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function saveRecipientName() {
  const input = document.getElementById('nameInputModal');
  if (input) {
    const newName = input.value.trim();
    if (newName) {
      AppState.setRecipientName(newName);
      if (window.SoundEffects) SoundEffects.play('click');
    }
  }
  closeNameModal();
}

// ============================================================
// FLOW GUARD & REFRESH HANDLER: User wajib mengikuti alur
// Jika refresh dipencet lewat cara apapun, langsung reset ke awal
// ============================================================
const FLOW_STEPS = {
  'index.html': 1,
  'rundown.html': 3,
  'tiket.html': 4
};

function getAllowedStep() {
  return parseInt(sessionStorage.getItem('date_flow_step') || '1', 10);
}

function setAllowedStep(step) {
  sessionStorage.setItem('date_flow_step', String(step));
}

// Cek akses halaman & deteksi reload saat ini (dijalankan segera sebelum konten tampil)
(function guardCurrentPage() {
  const pageStep = parseInt(document.body.dataset.step || '1', 10);
  if (pageStep === 1) {
    setAllowedStep(1); // Mulai ulang alur dari awal
    sessionStorage.removeItem('date_nav_legit');
    return;
  }

  // 1. Deteksi apakah halaman dibuka lewat tombol refresh browser / pull-to-refresh
  let isReload = false;
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0 && navEntries[0].type === 'reload') {
      isReload = true;
    } else if (window.performance && window.performance.navigation && window.performance.navigation.type === 1) {
      isReload = true;
    }
  } catch (err) {}

  // 2. Deteksi apakah navigasi berasal dari klik resmi tombol alur sebelumnya
  const wasLegitNavigation = sessionStorage.getItem('date_nav_legit') === 'true';
  sessionStorage.removeItem('date_nav_legit'); // Konsumsi tiket legitimasi

  // Jika di-refresh ATAU alur lompat/ilegal: lempar langsung ke halaman awal
  if (isReload || !wasLegitNavigation || getAllowedStep() < pageStep) {
    document.body.style.display = 'none';
    setAllowedStep(1);
    sessionStorage.removeItem('date_nav_legit');
    window.location.replace('index.html');
  }
})();

// Cegah tombol keyboard refresh (F5 / Ctrl+R / Cmd+R) agar langsung balik ke awal
window.addEventListener('keydown', (e) => {
  if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'))) {
    e.preventDefault();
    setAllowedStep(1);
    sessionStorage.removeItem('date_nav_legit');
    window.location.replace('index.html');
  }
});

// Navigasi halaman dengan animasi slide ke bawah yang smooth
let isNavigating = false;
function navigateTo(url) {
  if (isNavigating) return;
  isNavigating = true;
  unlockScroll();
  if (window.SoundEffects) SoundEffects.play('click');
  const step = FLOW_STEPS[url];
  if (step) {
    setAllowedStep(Math.max(getAllowedStep(), step));
    sessionStorage.setItem('date_nav_legit', 'true'); // Berikan izin navigasi
  }

  // Terapkan animasi slide ke bawah saat halaman bertransisi keluar
  const mainEl = document.querySelector('main') || document.body;
  if (mainEl) {
    mainEl.classList.remove('page-enter-slide');
    mainEl.classList.add('page-exit-slide');
  }

  setTimeout(() => {
    window.location.replace(url); // replace: tombol back tidak bisa lompat-lompat
  }, 380);
}

// ============================================================
// SCROLL LOCK: Kunci scroll manual selama proses berjalan
// ============================================================
function preventScrollEvent(e) { e.preventDefault(); }
function preventScrollKeys(e) {
  const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
  if (keys.includes(e.key) && e.target.tagName !== 'INPUT') e.preventDefault();
}

function lockScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  window.addEventListener('wheel', preventScrollEvent, { passive: false });
  window.addEventListener('touchmove', preventScrollEvent, { passive: false });
  window.addEventListener('keydown', preventScrollKeys);
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  window.removeEventListener('wheel', preventScrollEvent);
  window.removeEventListener('touchmove', preventScrollEvent);
  window.removeEventListener('keydown', preventScrollKeys);
}

// Inisialisasi saat script dimuat
document.addEventListener('DOMContentLoaded', () => {
  const mainEl = document.querySelector('main');
  if (mainEl) {
    mainEl.classList.add('page-enter-slide');
  }

  AppState.init();
  AppState.syncSoundUI();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

