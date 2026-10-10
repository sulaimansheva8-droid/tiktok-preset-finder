# TikTok Preset Finder

Website pencari preset dari link TikTok, menggunakan API SynoxCloud.

## Jalankan di komputer/VPS
Butuh Node.js 18 atau lebih baru.

```bash
npm install
npm start
```

Buka `http://localhost:3000`.

## Deploy ke Vercel
1. Upload isi folder ini ke repository GitHub.
2. Import repository tersebut di Vercel.
3. Deploy. File `vercel.json` sudah disertakan.

## Catatan
- Pencarian API dilakukan dari backend `/api/search` agar browser tidak perlu memanggil API pihak ketiga secara langsung.
- API upstream memakai `apikey=FREE`, mengikuti contoh yang diberikan. Ketersediaan, batas penggunaan, dan ketentuan API ditentukan oleh penyedia SynoxCloud.
- Jika format respons API berubah, sesuaikan `public/script.js`.
