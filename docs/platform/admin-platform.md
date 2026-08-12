# Dashboard Admin Platform Identiva

Admin platform (`admin_platform`) adalah **pengelola pusat Identiva** — platform distribusi subsidi berbasis identitas digital.

## Akses & Role

**Role:** `admin_platform`  
**Scope:** Semua mitra, semua cabang, pengaturan global sistem  
**Login:** `/login` (sama seperti role lain)

### Akun Demo
- **Username:** `platform`
- **Password:** `mitra123` *(ganti di production)*

**Catatan:** User admin platform tidak terikat ke mitra tertentu (`mitraId = null`). Dashboard platform bisa melihat & edit semua mitra.

---

## Dashboard Platform

### Menu Navigasi

```
Dashboard Platform
├── Ringkasan      → Statistik agregat semua mitra
├── Mitra          → List & kelola mitra (preferensi scan, status, dll)
└── Statistik      → Analytics platform (transaksi, peserta, dll)
```

### Halaman Ringkasan (`/dashboard/platform`)

**Statistik Agregat:**
- Total mitra (aktif/pending/diblokir)
- Total cabang/wilayah
- Total peserta (SPBU + LokaID)
- Total transaksi (hari ini, bulan ini)
- Total aktivitas LokaID (hari ini)

**Chart/Tabel:**
- Top 5 mitra by transaksi
- Metode scan usage (berapa mitra pakai alat vs HP vs manual)
- Onboarding timeline (mitra baru per bulan)

### Halaman Mitra (`/dashboard/platform/mitra`)

**Tabel List Mitra:**

| Kolom | Deskripsi |
|-------|-----------|
| Nama | Nama mitra |
| Tipe | `subsidi` (SPBU) / `lokaid` |
| Kode | Kode mitra (misal: `SPBU-PERTA`) |
| Metode Scan | Ikon/badge metode yang diizinkan |
| Cabang | Jumlah cabang/wilayah |
| Status | pending / aktif / diblokir |
| Aksi | [Detail] [Edit] [Blokir] |

**Fitur:**
- Search mitra by nama/kode
- Filter by tipe/status
- Sort by nama/tanggal dibuat

### Halaman Detail Mitra (`/dashboard/platform/mitra/[id]`)

**Section 1: Info Dasar**
- Nama, Kode, Tipe Mitra
- Jenis Layanan (BBM, Sembako, dll)
- Skala (besar/kecil)
- Status (aktif/pending/diblokir) + toggle
- Tanggal dibuat

**Section 2: Preferensi Scan** *(fokus V7)*
```
Metode Scan yang Diizinkan:
[ ] Alat ESP32      — RFID reader dedicated
[ ] HP NFC          — Smartphone NFC (Web NFC API)
[x] Manual          — Input keyboard (fallback)

Catatan: Mitra hanya bisa aktifkan metode yang dicentang di sini.
Default per tipe:
- SPBU → [x] Alat ESP32
- LokaID → [x] Alat ESP32  [x] HP NFC

[Simpan Perubahan]
```

**Section 3: Cabang/Wilayah**
Tabel list cabang mitra ini:
- Nama cabang
- Kode cabang
- Metode scan aktif (dropdown edit — filtered by diizinkan)
- Status cabang
- Token API
- Aksi [Edit] [Nonaktifkan]

**Section 4: Statistik Mitra**
- Total transaksi (SPBU) / aktivitas (LokaID)
- Total peserta/warga
- Saldo default (SPBU)
- Program aktif

---

## Fitur Admin Platform

### 1. Kelola Preferensi Scan *(V7)*

**Alur:**
1. Admin platform buka detail mitra
2. Edit checkbox "Metode Scan yang Diizinkan"
3. Simpan → `PATCH /api/platform/mitra/:id`
4. Mitra (admin_mitra) sekarang hanya bisa pilih metode yang dicentang saat edit cabang

**Use Case:**
- SPBU baru onboarding → default `["alat_esp32"]` wajib alat (konsistensi transaksi BBM)
- LokaID baru → default `["alat_esp32", "hp_nfc"]` fleksibel (fieldwork mobile)
- Mitra kecil tanpa hardware → `["manual"]` saja

**Enforcement:**
- API guard di `/api/uid-scan` (alat ESP32) dan `/api/lokaid/qr/.../scan-register` (HP NFC)
- Jika cabang coba scan dengan metode tidak diizinkan → 403 Forbidden
- UI dashboard mitra: hide tabs/buttons untuk metode yang tidak aktif

### 2. Onboarding Mitra Baru *(fase lanjutan)*

**Form onboarding:**
- Nama, Kode, Tipe Mitra, Jenis Layanan
- Metode scan yang diizinkan (checkbox)
- Saldo default (jika SPBU)
- Status awal (pending/aktif)
- Token API mitra induk (auto-generate)

**Setelah onboarding:**
- Create mitra
- Create user admin_mitra (username/password)
- Kirim notifikasi/email credentials (future)

### 3. Approve Mitra *(fase lanjutan)*

**Alur:**
- Mitra submit registrasi via form publik (future)
- Masuk status `pending`
- Admin platform review → approve/reject
- Jika approve → status `aktif`, mitra bisa login

### 4. Koreksi Data KTP *(fase lanjutan)*

**Scope:** Admin platform bisa edit `Penduduk.nama` dan `Penduduk.alamat` (koreksi typo).  
**Restriction:** `Penduduk.nik` dan `Penduduk.uidKartu` **paten** (tidak bisa diubah siapa pun).

**Alur:**
- Admin platform buka halaman "Data Penduduk" (future)
- Search by NIK/UID/nama
- Edit nama/alamat → audit log
- Simpan → notifikasi ke mitra terkait (future)

---

## API Endpoints (Admin Platform)

| Endpoint | Method | Fungsi | Auth |
|----------|--------|--------|------|
| `/api/platform/mitra` | GET | List semua mitra | admin_platform |
| `/api/platform/mitra/:id` | GET | Detail mitra + cabang + stats | admin_platform |
| `/api/platform/mitra/:id` | PATCH | Edit mitra (preferensi scan, status, dll) | admin_platform |
| `/api/platform/mitra` | POST | Onboarding mitra baru *(future)* | admin_platform |
| `/api/platform/stats` | GET | Statistik agregat platform | admin_platform |
| `/api/platform/penduduk` | GET | Search data KTP *(future)* | admin_platform |
| `/api/platform/penduduk/:id` | PATCH | Koreksi data KTP (nama/alamat) *(future)* | admin_platform |

---

## Security & Permissions

### Guard Dashboard

```tsx
// dashboard/layout.tsx
const isPlatform = session.user.role === "admin_platform";
if (!isPlatform && !session.user.mitraId) redirect("/login");
```

Admin platform tidak punya `mitraId` → skip check mitra. Tapi tetap harus login.

### API Guard

```ts
// Middleware checkPlatformAdmin
if (session.user.role !== "admin_platform") {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

Semua API `/api/platform/*` wajib role `admin_platform`.

### Audit Log *(future)*

Semua aksi admin platform dicatat:
- Edit preferensi scan mitra X
- Approve/reject mitra Y
- Koreksi KTP Z (nama/alamat)
- Blokir cabang A

---

## Fase Implementasi

### V7 (Dashboard Platform + Preferensi Scan)
✅ Dashboard platform (ringkasan, list mitra, detail mitra)  
✅ Edit preferensi scan per mitra  
✅ API guards enforcement  
✅ Conditional UI dashboard mitra  

### Fase Lanjutan (Post-V8)
- Onboarding mitra baru (form publik + approval)
- Koreksi data KTP (search + edit penduduk)
- Audit log (track semua aksi platform admin)
- Notifikasi/email (credentials mitra baru, perubahan data KTP)
- Analytics advanced (chart, export, trends)
