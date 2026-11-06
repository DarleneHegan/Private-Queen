# 💌 Interactive Date Invitation Web App (Struktur Modular)

Aplikasi web interaktif modern dan eye-catching untuk mengajak pasangan kencan dengan pendekatan **editorial storytelling**, **gamifikasi**, dan **komedi romantis**. 

Proyek ini telah disusun secara **modular dan terpisah di setiap halamannya**, sehingga sangat rapi dan mudah untuk diedit per bagian tanpa harus membuka file raksasa.

---

## 📁 Struktur File & Halaman

```
c:\Project\Date Invitation\
├── index.html            👉 [Tahap 1] Hero & Pengantar Proposal Kencan
├── surat-izin.html       👉 [Tahap 2] 3D Amplop & Surat Keputusan Resmi Ortu
├── rundown.html          👉 [Tahap 3] Dossier Boarding Pass & Pertanyaan Final (Tombol Kabur)
├── tiket.html            👉 [Tahap 4] Tiket VIP Digital & Konfirmasi WhatsApp
├── css/
│   └── style.css         👉 Styling terpusat (Tekstur kertas, 3D envelope, stempel, animasi)
└── js/
    ├── state.js          👉 Sinkronisasi nama pasangan & state antar halaman
    ├── audio.js          👉 Web Audio API Synthesizer (SFX mandiri tanpa file MP3 eksternal)
    └── evasive.js        👉 Logika matematis tombol 'Gak Mau' yang menghindar
```

---

## 📝 Panduan Mengedit Konten Sesuai Halaman

Jika Anda ingin mengubah isi konten, cukup buka file yang sesuai:

### 1. Mengubah Teks Pengantar / Hero (`index.html`)
- Buka `index.html`.
- Anda dapat mengubah judul proposal (*"A Very Formal & Completely Non-Negotiable Date Proposal"*), teks pembuka, maupun badge kerahasiaan.
- Nama default juga tersimpan di `js/state.js` atau dapat langsung diganti lewat tombol pensil di navbar.

### 2. Mengubah Isi Surat Keputusan Ortu (`surat-izin.html`)
- Buka `surat-izin.html`.
- Cari variabel `letterParagraph` di bagian `<script>`:
  ```javascript
  const letterParagraph = `Berdasarkan pengamatan intensif, saudari ${AppState.recipientName} telah memenuhi seluruh syarat kegemasan nasional...`;
  ```
  Anda bisa menyesuaikan alasan atau kata-kata lucu sesuai gaya Anda dan pasangan!

### 3. Mengubah Jadwal & Rincian Rundown (`rundown.html`)
- Buka `rundown.html`.
- Cari elemen `#timelineList`. Anda bisa mengubah jam (misal `15:30 WIB`), emoji, judul kegiatan, dan deskripsi acara kencan.
- Kalimat-kalimat pada tombol yang kabur (*"Gak Mau"*) dapat Anda tambahkan di file `js/evasive.js`.

### 4. Mengubah Tiket VIP & Format WhatsApp (`tiket.html`)
- Buka `tiket.html`.
- Anda bisa mengubah detail nomor kursi, syarat kencan, dan template pesan WhatsApp di fungsi `sendWhatsAppConfirmation()`:
  ```javascript
  const message = `Halo! 🌹 Proposal kencannya udah aku baca dan aku ACC resmi nih! ✨\n\nTiket VIP atas nama "${AppState.recipientName}" sudah terbit...`;
  ```

### 5. Mengubah Tampilan Visual & Warna (`css/style.css`)
- Buka `css/style.css` untuk mengatur ukuran amplop 3D, rotasi stempel, bayangan kertas, atau durasi transisi.

---

## 🚀 Cara Menjalankan

Aplikasi ini menggunakan tautan HTML standar, sehingga dapat dijalankan dengan 2 cara:

### Cara 1: Langsung Buka File (Paling Praktis)
Cukup **klik ganda (double click)** file `index.html` dari Windows Explorer Anda! Browser (Chrome, Edge, Firefox, Safari) akan langsung membukanya dan semua navigasi antar halaman akan berjalan lancar.

### Cara 2: Menjalankan dengan Local Web Server
Jika ingin dites di HP melalui satu jaringan WiFi:
```bash
python -m http.server 3000
```
Buka browser di HP/Laptop melalui `http://localhost:3000` (atau IP laptop Anda).

---

## ✨ Fitur-Fitur Spesial

1. **Sinkronisasi Otomatis Nama Pasangan:**
   Ketika nama diganti di Halaman 1 atau lewat modal ganti nama, nama tersebut **otomatis tersimpan dan tersinkronisasi** ke halaman surat izin, rundown, tiket, hingga draft pesan WhatsApp.
2. **Support Parameter URL Langsung:**
   Anda bisa mengirim link langsung dengan nama pasangan yang sudah terisi otomatis, contoh:
   `index.html?to=Clara` atau `index.html?to=Sayang`
3. **Download Gambar Tiket:**
   Pada halaman `tiket.html`, penerima dapat mengunduh tiket dalam format gambar PNG resolusi tinggi untuk disimpan ke galeri ponsel mereka.
