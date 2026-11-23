# MDF Telegram Portfolio Bot

Serverless Telegram Bot yang berjalan di atas Cloudflare Workers dan Cloudflare KV untuk mengelola data portofolio (Proyek, Sertifikasi, Pengalaman Kerja, Media Sosial, dan Profil) secara real-time langsung ke GitHub repository.

## Fitur Utama

- **Zero Traditional Database**: Menyimpan pembaruan langsung ke repositori GitHub via GitHub REST API, memicu auto-deploy instan di Vercel (~30 detik).
- **State Machine Multi-Langkah**: Wizard interaktif langkah demi langkah didukung Cloudflare KV Storage dengan auto-expire TTL.
- **Dukungan CRUD Lengkap**:
  - Proyek (Title, Deskripsi Bilingual, Kategori, Tech Stack, Link, Status)
  - Sertifikasi (Judul, Penerbit, Tanggal, Verifikasi)
  - Pengalaman Kerja (Posisi, Perusahaan, Periode, Deskripsi, Tipe Remote/On-site)
  - Media Sosial (Platform, Nama Akun, URL Profil)
  - Profil (Bio & Deskripsi Bilingual)
- **Inline Keyboard & Quick Commands**: Antarmuka responsif dan ramah pengguna di Telegram.
- **Keamanan & Otorisasi**: Proteksi akses perintah khusus username Telegram yang diizinkan (`TELEGRAM_ALLOWED_USER`).

## Struktur File

```
workers/telegram-bot/
├── index.js          # Core logic, state machine & GitHub API integration
├── wrangler.toml      # Konfigurasi multi-environment (prod, staging, testing)
├── package.json      # Scripts dan metadata
├── .gitignore        # Mengabaikan file env & build cache
└── README.md         # Dokumentasi repositori
```

## Perintah Bot

| Perintah | Fungsi |
|---|---|
| `/start` | Membuka menu utama interaktif |
| `/help` | Menampilkan panduan dan opsi menu |
| `/profile` | Melihat dan mengedit profil portofolio |
| `/listprojects` | Melihat daftar proyek terdaftar |
| `/listcerts` | Melihat daftar sertifikat aktif |
| `/status` | Mengecek status koneksi worker dan branch GitHub |

## Menjalankan & Deploy

1. Pastikan telah memasang Cloudflare Wrangler:
   ```bash
   npm install
   ```

2. Konfigurasi secret variabel di Cloudflare:
   ```bash
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_ALLOWED_USER
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler secret put GITHUB_REPO
   ```

3. Deploy ke environment production:
   ```bash
   npm run deploy
   ```

## Lisensi

Dibuat oleh Muhammad Dava Fahreza. Didistribusikan di bawah lisensi terbuka untuk keperluan portofolio pribadi.

