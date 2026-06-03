# SnapShot — Web Screenshot Dashboard

Premium web screenshot tool dengan full dashboard UI.
**Stack:** Vanilla JS frontend + Vercel Serverless Functions
**Providers:** Pikwy · Microlink · Vivoldi

---

## 📁 Struktur Project

```
snapshot-web-screenshot/
├── api/                  ← Vercel Serverless Functions
│   ├── pikwy.js          → POST /api/pikwy
│   ├── microlink.js      → POST /api/microlink
│   └── vivoldi.js        → POST /api/vivoldi
├── lib/                  ← Provider logic
│   ├── ssweb.js          (Pikwy)
│   ├── ssweb1.js         (Microlink)
│   └── ssweb2.js         (Vivoldi)
├── public/               ← Static frontend (served langsung)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       └── api.js
├── vercel.json           ← Vercel routing config
├── package.json
└── .gitignore
```

---

## 🚀 Deploy ke GitHub + Vercel (Upload Manual)

### STEP 1 — Buat Repository GitHub

1. Buka **https://github.com/new**
2. Isi:
   - **Repository name:** `snapshot-web-screenshot` (atau nama apapun)
   - **Visibility:** Public ✅ (Vercel free tier butuh public, atau upgrade ke Pro untuk private)
   - **JANGAN centang** "Add a README file" (biar tidak conflict)
3. Klik **"Create repository"**

---

### STEP 2 — Upload Files ke GitHub

Setelah repo dibuat, lo akan lihat halaman kosong dengan instruksi.
Pilih cara **"uploading an existing file"**:

1. Klik link **"uploading an existing file"** di halaman repo
   *(atau klik tombol "Add file" → "Upload files")*

2. **Drag & drop** seluruh folder project ini ke area upload
   > ⚠️ Pastikan upload **semua folder**: `api/`, `lib/`, `public/`, plus file `vercel.json`, `package.json`, `.gitignore`

3. Scroll ke bawah, di bagian **"Commit changes"**:
   - Message: `Initial commit — SnapShot dashboard`
   - Pilih: **"Commit directly to the main branch"**

4. Klik **"Commit changes"** ✅

> 💡 **Tip:** GitHub web upload tidak bisa upload folder kosong. Pastikan semua folder berisi file.

---

### STEP 3 — Connect ke Vercel

1. Buka **https://vercel.com/dashboard**
2. Klik tombol **"Add New..."** → **"Project"**
3. Di bagian **"Import Git Repository"**, pilih repo `snapshot-web-screenshot`
   - Kalau repo-nya tidak muncul, klik **"Adjust GitHub App Permissions"** dan izinkan akses ke repo tersebut
4. Klik **"Import"**

---

### STEP 4 — Configure Project di Vercel

Di halaman "Configure Project", setting berikut:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Other` |
| **Root Directory** | `.` (default, jangan diubah) |
| **Build Command** | *(kosongkan / biarkan default)* |
| **Output Directory** | `public` |
| **Install Command** | `npm install` |

> **Environment Variables:** Project ini tidak butuh env vars. Skip bagian ini.

5. Klik **"Deploy"** 🚀

---

### STEP 5 — Tunggu Deploy Selesai

Vercel akan:
1. Install dependencies (`npm install`)
2. Detect `api/*.js` sebagai Serverless Functions
3. Serve `public/` sebagai static files
4. Generate URL production

Proses ini biasanya **~1-2 menit**.

Setelah selesai, lo akan dapat URL seperti:
```
https://snapshot-web-screenshot.vercel.app
```

---

### STEP 6 — Test di Production

Buka URL Vercel lo, coba capture sebuah website:

1. Ketik URL di input bar, contoh: `https://github.com`
2. Pilih provider (Pikwy / Microlink / Vivoldi)
3. Klik **Capture**
4. Screenshot harusnya muncul di panel preview ✅

---

## 🔄 Update Code (Kalau Ada Perubahan)

Untuk update file setelah sudah deploy:

1. Buka repo GitHub lo
2. Navigate ke file yang mau diubah
3. Klik ikon pensil ✏️ (Edit file)
4. Lakukan perubahan
5. Klik **"Commit changes"**

Vercel akan **auto-redeploy** setiap kali ada commit baru ke branch `main`. ✨

---

## 🛠️ Jalankan Lokal (Development)

```bash
# Install dependencies
npm install

# Install Vercel CLI (opsional, untuk dev mode)
npm install -g vercel

# Jalankan dengan Vercel dev (recommended — simulasi serverless)
vercel dev

# Atau run Express server biasa (perlu server.js terpisah)
node server.js
```

Local URL: **http://localhost:3000**

---

## ⚡ API Endpoints

| Method | Endpoint | Provider |
|--------|----------|----------|
| `POST` | `/api/pikwy` | Pikwy |
| `POST` | `/api/microlink` | Microlink |
| `POST` | `/api/vivoldi` | Vivoldi |

### Contoh Request (Pikwy)
```json
POST /api/pikwy
{
  "input": "https://example.com",
  "delay": 3000,
  "width": 1920,
  "height": 1080,
  "format": "png",
  "fullSize": false,
  "zoom": 100
}
```

---

## ❓ Troubleshooting

**Deploy gagal / error "Cannot find module"**
→ Pastikan folder `lib/` terupload dengan semua 3 file (`ssweb.js`, `ssweb1.js`, `ssweb2.js`)

**Output directory not found**
→ Di Vercel settings, pastikan Output Directory diset ke `public`

**API timeout**
→ Vercel free tier max function duration adalah 10 detik. Untuk screenshot berat, provider bisa timeout. Coba ganti provider atau kurangi delay.

**CORS error**
→ Semua function sudah include CORS headers. Pastikan request dari domain yang sama dengan deployment.

---

Built with ❤️ — SnapShot Dashboard v1.0
