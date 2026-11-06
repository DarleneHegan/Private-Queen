/**
 * Web Audio API Sound Synthesizer
 * Menghasilkan efek audio sintetik mandiri (zero external audio files).
 */

const SoundEffects = {
  ctx: null,

  // File sound effect eksternal (MP3) dari folder Addons
  files: {
    slip: 'Addons/Sound%20Effect/cartoonslip.mp3'
  },
  slipAudioPool: [],
  slipIdx: 0,
  lastSlipTime: 0,

  // Inisialisasi pool audio instance untuk cartoonslip.mp3
  initSlipPool() {
    if (this.slipAudioPool.length > 0) return;
    const soundPath = 'Addons/Sound%20Effect/cartoonslip.mp3';
    for (let i = 0; i < 4; i++) {
      const a = new Audio(soundPath);
      a.preload = 'auto';
      this.slipAudioPool.push(a);
    }
  },

  // Putar sound effect cartoonslip.mp3 saat tombol 'Gak Mau' menghindar
  playSlip(volume = 1.0) {
    if (typeof AppState !== 'undefined' && !AppState.soundEnabled) return;
    
    const now = Date.now();
    if (now - this.lastSlipTime < 60) return; // throttle micro-events
    this.lastSlipTime = now;

    this.initSlipPool();

    try {
      const audio = this.slipAudioPool[this.slipIdx % this.slipAudioPool.length];
      this.slipIdx++;
      audio.currentTime = 0;
      audio.volume = volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Fallback ke Web Audio API synth jika autoplay audio file dibatasi
          this.play('whoosh');
        });
      }
    } catch(e) {
      this.play('whoosh');
    }
  },

  // Putar file MP3 umum
  playFile(name, volume = 0.9) {
    if (name === 'slip') {
      this.playSlip(volume);
      return;
    }
    if (typeof AppState !== 'undefined' && !AppState.soundEnabled) return;
    const src = this.files[name];
    if (!src) return;

    try {
      const sound = new Audio(src);
      sound.volume = volume;
      sound.play().catch(() => {});
    } catch(e) {}
  },

  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  play(type) {
    if (typeof AppState !== 'undefined' && !AppState.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      switch(type) {
        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'typewriter': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800 + Math.random() * 300, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.03);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'scribble': {
          // Goresan pensil di atas kertas (noise pendek difilter)
          const len = Math.floor(ctx.sampleRate * 0.07);
          const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / len);
          }
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2500 + Math.random() * 1500;
          filter.Q.value = 0.8;
          const gain = ctx.createGain();
          gain.gain.value = 0.18;
          src.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          src.start(now);
          break;
        }

        case 'stamp': {
          // Dentuman stempel berat
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
          gain.gain.setValueAtTime(0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'whoosh': {
          // Efek suara menghindar / pergerakan cepat
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'cheer': {
          // Melodi perayaan akord gembira
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.25, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.6);
          });
          break;
        }
      }
    } catch (e) {
      console.warn("Audio SFX Error:", e);
    }
  }
};

