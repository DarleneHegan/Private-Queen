/**
 * Suasana latar: bintang kecil berkedip + kelopak/hati yang jatuh pelan.
 * Dipakai di semua halaman. Butuh elemen <div id="ambient"> di halaman.
 */
(function buildAmbient() {
  const box = document.getElementById('ambient');
  if (!box) return;

  for (let i = 0; i < 28; i++) {
    const s = document.createElement('span');
    s.className = 'twinkle';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 3.2) + 's';
    s.style.animationDuration = (2.4 + Math.random() * 2.6) + 's';
    box.appendChild(s);
  }

  const icons = ['🌸', '💗', '✨', '🌹', '💖'];
  for (let i = 0; i < 14; i++) {
    const d = document.createElement('span');
    d.className = 'drifter';
    d.textContent = icons[i % icons.length];
    d.style.left = Math.random() * 100 + '%';
    d.style.fontSize = (14 + Math.random() * 16) + 'px';
    d.style.animationDuration = (12 + Math.random() * 12) + 's';
    d.style.animationDelay = (-Math.random() * 20) + 's';
    d.style.setProperty('--sway', (Math.random() * 120 - 60) + 'px');
    box.appendChild(d);
  }
})();
