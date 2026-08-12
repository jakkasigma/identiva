# RENCANA PERBAIKAN — WEB IDENTIVA

Dokumen ini mencatat semua iterasi perubahan di atas baseline v1 (`rekap-implementasi.md`), beserta status pengerjaannya.

---

## ITERASI V2 — SALDO SUBSIDI RUPIAH + 1 MITRA SPBU PERTAMINA

> **Status: ✅ SELESAI** — Build production sukses, 0 TypeScript error. Migration + seed berhasil.

### Status Pengerjaan V2

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Schema Prisma (Mitra, ProgramSubsidi, Warga, Saldo, Transaksi) | ✅ Selesai |
| 2 | Migration init diganti ke schema v2 + reset DB | ✅ Selesai |
| 3 | `lib/quota.ts` — ganti `ensureCurrentKuota` → `ensureCurrentSaldo` | ✅ Selesai |
| 4 | API `check-quota` — param `program_id`, logika `bersubsidi`, saldo | ✅ Selesai |
| 5 | API `transaksi` — param `program_id`, increment saldo, simpan `diskonRupiah` | ✅ Selesai |
| 6 | API `warga` — hapus `program_subsidi_id`, hapus create kuota | ✅ Selesai |
| 7 | API `program` — hapus `kuota_total`/`satuan`, tambah `bersubsidi` | ✅ Selesai |
| 8 | API `rekap` — fix join path program, tambah `diskon_rupiah` ke rows | ✅ Selesai |
| 9 | Seed ulang — 1 mitra SPBU Pertamina, 3 program, 6 saldo, 10 transaksi | ✅ Selesai |
| 10 | `WargaTable` — hapus kolom Program, ganti Kuota → Saldo rupiah + kotak cari | ✅ Selesai |
| 11 | `WargaForm` — hapus dropdown program | ✅ Selesai |
| 12 | `ScanTerbaruPanel` — hapus prop `programs` | ✅ Selesai |
| 13 | `ProgramForm` — hapus `kuotaTotal`/`satuan`, tambah toggle `bersubsidi` | ✅ Selesai |
| 14 | `dashboard/page.tsx` — ganti StatCard Kuota → Saldo Terpakai | ✅ Selesai |
| 15 | `rekap/page.tsx` — tambah StatCard Total Transaksi, fix join path program | ✅ Selesai |
| 16 | `dashboard/layout.tsx` — query DB mitra, tampilkan token+kode, fix guard | ✅ Selesai |
| 17 | `warga/page.tsx` — query saldo bulan ini, hapus prop `programs` | ✅ Selesai |
| 18 | Build & verifikasi `npm run build` | ✅ Selesai |

### Ringkasan Perubahan V2

**Konsep inti:** Subsidi berubah dari kuota unit/liter per program menjadi saldo rupiah per KTP per mitra. Satu saldo berlaku untuk semua program bersubsidi mitra. Enrollment warga ke mitra saja (tidak per program). Produk non-subsidi (Biosolar) tidak masuk alur saldo.

**Schema:** Hapus `Kuota`, hapus `satuan`/`kuotaTotal` dari `ProgramSubsidi`, hapus `programSubsidiId` dari `Warga`, tambah `Saldo`, `Mitra.kode`, `Mitra.saldoDefault`, `Transaksi.diskonRupiah` + `programSubsidiId`.

**Seed demo:** SPBU Pertamina (1 mitra, 3 program, 6 warga, 10 transaksi tersebar hari ini & kemarin).

**Cara jalankan:**
```bash
cd d:\projek\iot\lomba\web
npm run build
npm start
# Login: admin / mitra123
# Token IoT: tok_spbu_pertamina_2026_a1b2c3d4e5f6
```

---

## ITERASI V3 — SISTEM CABANG SPBU + ROLE ADMIN CABANG

> **Status: ✅ SELESAI** — Build production sukses, 0 TypeScript error. Migration + seed v3 berhasil.

### Latar Belakang

Mitra Pertamina skala besar punya banyak SPBU (cabang). Setiap cabang punya alat IoT sendiri dengan token API sendiri. Laporan perlu bisa dilihat per cabang maupun agregat semua cabang. Operator tiap SPBU punya akun login sendiri yang hanya bisa lihat data cabangnya.

### Konsep Struktur

```
SPBU Pertamina (mitra induk)
├── Kelola program subsidi (berlaku semua cabang)
├── Kelola warga (terdaftar ke mitra induk)
├── Saldo warga (per mitra induk, bisa dipakai di cabang manapun)
├── Monitor semua cabang (agregat + per cabang)
│
├── Cabang: SPBU Fatmawati  (kode: SPBU-PERTA-JKT-001)
│   ├── token API sendiri → dipakai alat ESP32 di SPBU ini
│   └── user: fatmawati / mitra123  (admin_cabang)
│
├── Cabang: SPBU Sudirman   (kode: SPBU-PERTA-JKT-002)
│   ├── token API sendiri
│   └── user: sudirman / mitra123   (admin_cabang)
│
└── Cabang: SPBU Kemang     (kode: SPBU-PERTA-JKT-003)
    ├── token API sendiri
    └── user: kemang / mitra123     (admin_cabang)
```

**Prinsip yang tidak berubah:**
- Warga tetap terdaftar ke **mitra induk** (bukan per cabang)
- Saldo tetap per (penduduk + mitra induk) — satu bucket, berlaku di semua cabang
- Program subsidi tetap diatur oleh mitra induk
- Token yang dipakai alat adalah token **cabang** (bukan mitra induk)

### Role Baru

Tambah `admin_cabang` ke enum `Role`:

| Role | Akses |
| :--- | :--- |
| `admin_mitra_induk` | Semua data mitra induk + semua cabang. Kelola warga, program, cabang. Monitor agregat. |
| `admin_cabang` | Data cabangnya saja. Rekap transaksi cabang, pendataan warga. Tidak bisa kelola program atau cabang lain. |

> Catatan: `admin_mitra` lama di-rename menjadi `admin_mitra_induk` di enum, atau dibiarkan `admin_mitra` dengan logika baru (perlu diputuskan saat implementasi).

### Perubahan Schema

**Tambah model `Cabang`:**

```prisma
model Cabang {
  id       Int         @id @default(autoincrement())
  nama     String      @db.VarChar(100)
  kode     String      @unique @db.VarChar(30)   // "SPBU-PERTA-JKT-001"
  alamat   String?     @db.VarChar(255)
  status   StatusMitra @default(aktif)
  tokenApi String      @unique @map("token_api") @db.VarChar(64)
  mitraId  Int         @map("mitra_id")           // FK ke Mitra induk

  mitra       Mitra         @relation(fields: [mitraId], references: [id])
  users       User[]
  transaksi   Transaksi[]
  scanPending ScanPending[]

  createdAt DateTime @default(now()) @map("created_at")

  @@map("cabang")
}
```

**Ubah model `User`** — tambah `cabangId` (null untuk admin induk):

```prisma
cabangId Int? @map("cabang_id")
cabang   Cabang? @relation(fields: [cabangId], references: [id])
```

**Ubah model `Transaksi`** — tambah `cabangId`:

```prisma
cabangId Int @map("cabang_id")
cabang   Cabang @relation(fields: [cabangId], references: [id])
```

**Ubah model `ScanPending`** — ganti `mitraId` → `cabangId` (scan terjadi di cabang):

```prisma
// Hapus: mitraId
// Tambah:
cabangId Int @map("cabang_id")
cabang   Cabang @relation(fields: [cabangId], references: [id])
```

**Ubah enum `Role`** — tambah nilai:

```prisma
enum Role {
  admin_mitra      // tetap (mitra induk)
  admin_cabang     // baru
  admin_platform   // tetap
}
```

### Perubahan API

**`auth-api.ts`** — `getMitraByToken` sekarang cari di tabel `Cabang`:

```ts
// Sebelum: cari di Mitra.tokenApi
// Sesudah: cari di Cabang.tokenApi, include { mitra: true }
// Return: { cabang, mitra (induk) }
```

**API `check-quota`** — token cabang → ambil mitraId induk dari cabang:

```
token → Cabang → mitra induk
cek program milik mitra induk ✓
cek warga di mitra induk ✓
cek saldo mitra induk ✓
```

**API `transaksi`** — simpan `cabangId` di transaksi:

```ts
Transaksi.create({
  ...,
  mitraId: cabang.mitraId,   // mitra induk
  cabangId: cabang.id,       // cabang yang layani
})
```

**API `uid-scan`** — simpan ke `ScanPending` dengan `cabangId`.

**API `rekap`** — tambah filter opsional `cabang_id`:
- Admin induk: bisa filter per cabang atau lihat semua
- Admin cabang: otomatis filter cabangnya saja

**API `warga`** — filter by `mitraId` induk (tidak berubah).

**API `cabang` (baru)** — `GET` + `POST` untuk kelola cabang:
- `GET /api/cabang` → list cabang milik mitra induk
- `POST /api/cabang` → tambah/edit cabang (hanya admin induk)

### Dashboard per Role

**`admin_mitra` (induk):**

| Halaman | Isi |
| :--- | :--- |
| `/dashboard` | Ringkasan agregat + tabel perbandingan per cabang (transaksi, diskon, nominal hari ini) |
| `/dashboard/cabang` | **Baru** — daftar cabang, statistik per cabang, tambah/edit cabang |
| `/dashboard/warga` | Semua warga mitra induk + pendataan |
| `/dashboard/program` | Kelola program subsidi |
| `/dashboard/rekap` | Rekap dengan filter cabang + tanggal + metode, kolom cabang di tabel |

**`admin_cabang`:**

| Halaman | Isi |
| :--- | :--- |
| `/dashboard` | Ringkasan transaksi cabangnya hari ini (StatCard: transaksi, nominal, diskon, saldo terpakai) |
| `/dashboard/warga` | Daftar warga mitra induk + pendataan (scan terbaru dari alat cabangnya) |
| `/dashboard/rekap` | Rekap otomatis filter cabangnya (tanggal + metode, export CSV) |

Menu yang **tidak tampil** untuk admin cabang: Program, Cabang.

### Perubahan UI

| File | Perubahan |
| :--- | :--- |
| `DashboardNav.tsx` | Tampilkan menu berbeda berdasarkan role dari session |
| `dashboard/layout.tsx` | Query cabang jika `admin_cabang`, tampilkan nama cabang + token di sidebar |
| `dashboard/page.tsx` | Induk: tabel per cabang. Cabang: ringkasan cabangnya saja |
| `dashboard/rekap/page.tsx` | Induk: tambah filter dropdown cabang. Cabang: filter otomatis |
| `dashboard/warga/page.tsx` | ScanTerbaru filter by `cabangId` (scan masuk dari alat cabang itu) |
| `dashboard/cabang/page.tsx` | **Baru** — halaman kelola & monitor cabang (hanya induk) |
| `components/cabang/CabangForm.tsx` | **Baru** — form tambah/edit cabang |

### Seed V3

| Item | Isi |
| :--- | :--- |
| Mitra induk | SPBU Pertamina (sama seperti v2) |
| User induk | `admin` / `mitra123` (role: `admin_mitra`) |
| Cabang 1 | SPBU Fatmawati — kode `SPBU-PERTA-JKT-001`, token `tok_fatmawati_2026_f1a2t3m4a5w6` |
| Cabang 2 | SPBU Sudirman — kode `SPBU-PERTA-JKT-002`, token `tok_sudirman_2026_s1u2d3i4r5m6` |
| Cabang 3 | SPBU Kemang — kode `SPBU-PERTA-JKT-003`, token `tok_kemang_2026_k1e2m3a4n5g6` |
| User cabang | `fatmawati`, `sudirman`, `kemang` / `mitra123` (role: `admin_cabang`) |
| Warga | 6 KTP tetap terdaftar ke mitra induk |
| Saldo | 6 baris tetap per mitra induk |
| Transaksi | 12–15 transaksi tersebar di 3 cabang (bisa dibandingkan di dashboard induk) |
| ScanPending | 1 UID di salah satu cabang |

### Urutan Pengerjaan V3

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Schema Prisma — tambah `Cabang`, `admin_cabang`, update `User`/`Transaksi`/`ScanPending` | ✅ Selesai |
| 2 | Migration reset + seed v3 | ✅ Selesai |
| 3 | `auth-api.ts` — `getCabangByToken` resolve token cabang → mitra induk | ✅ Selesai |
| 4 | `auth.ts` + `next-auth.d.ts` — tambah `cabangId`, `cabangNama`, `cabangKode` ke session JWT | ✅ Selesai |
| 5 | API `check-quota` — token cabang → mitraId induk, respons tambah field `cabang` | ✅ Selesai |
| 6 | API `transaksi` — simpan `cabangId` | ✅ Selesai |
| 7 | API `uid-scan` — simpan ke ScanPending dengan `cabangId` | ✅ Selesai |
| 8 | API `rekap` — tambah filter `cabang_id`, kolom `cabang` di rows | ✅ Selesai |
| 9 | API `cabang` (baru) — GET + POST, hanya `admin_mitra` | ✅ Selesai |
| 10 | `DashboardNav.tsx` — menu berbeda per role (`admin_mitra` vs `admin_cabang`) | ✅ Selesai |
| 11 | `dashboard/layout.tsx` — sidebar berbeda per role, query token cabang | ✅ Selesai |
| 12 | `dashboard/page.tsx` — induk: tabel performa per cabang. Cabang: ringkasan saja | ✅ Selesai |
| 13 | `dashboard/cabang/page.tsx` (baru) — kartu per cabang + statistik + edit | ✅ Selesai |
| 14 | `components/cabang/CabangForm.tsx` (baru) — form tambah/edit cabang | ✅ Selesai |
| 15 | `dashboard/rekap/page.tsx` — filter dropdown cabang untuk induk | ✅ Selesai |
| 16 | `dashboard/warga/page.tsx` + `ScanTerbaruPanel` — scan filter by cabangId, tampilkan nama cabang | ✅ Selesai |
| 17 | `api/warga/route.ts` — hapus filter mitraId lama di deleteMany scanPending | ✅ Selesai |
| 18 | Build & verifikasi `npm run build` | ✅ Selesai — 0 TypeScript error |

### Keputusan Terkunci V3

1. **Warga & saldo** tetap di mitra induk — berlaku di semua cabang.
2. **Token yang dipakai alat** adalah token cabang (bukan mitra induk).
3. **Program subsidi** dikelola oleh mitra induk, berlaku untuk semua cabang.
4. **`admin_mitra`** tetap untuk mitra induk (tidak di-rename agar backward compat).
5. **`admin_cabang`** tidak bisa kelola program dan tidak bisa lihat data cabang lain.
6. **ScanPending** dipindah ke FK `cabangId` (scan terjadi di alat cabang tertentu).
7. Tidak ada akun operator khusus per alat — satu akun per cabang sudah cukup.

---

## BAGIAN REFERENSI — V2 DETAIL

### Schema V2 (Aktif)

Perubahan vs v1: hapus `Kuota`, hapus `satuan`/`kuotaTotal` dari `ProgramSubsidi`, hapus `programSubsidiId` dari `Warga`, tambah `Saldo`, `Mitra.kode`, `Mitra.saldoDefault`, `Transaksi.diskonRupiah` + `programSubsidiId`.

### API V2

`POST /api/check-quota` payload: `{ token, uid, program_id, nominal }`
`POST /api/transaksi` payload: `{ token, uid, program_id, nominal, metode_bayar }`

### Bug Fix V2

| Bug | Status |
| :--- | :--- |
| Guard lemah tanpa `mitraId` | ✅ Diperbaiki |
| Token sidebar placeholder | ✅ Diganti query DB |
| Kotak cari warga tidak ada | ✅ Ditambah di WargaTable |

### Verifikasi V2

```
npm run build → ✅ Sukses, 0 error
npx prisma migrate reset --force → ✅ Migration + seed sukses
Routes: /, /login, /dashboard, /dashboard/program, /dashboard/rekap, /dashboard/warga
API: /api/check-quota, /api/transaksi, /api/uid-scan, /api/warga, /api/program, /api/rekap
```

---

## FASE LANJUTAN (SETELAH V3)

- **Admin Platform**: approve mitra, koreksi data KTP, program global.
- **Bridge PC Bluetooth → HTTP API** (Alat A & Alat B).
- **Chart/grafik laporan** per cabang (tren harian/mingguan).
- **Export PDF**, notifikasi, audit log.
- **PWA warga** untuk cek saldo & riwayat mandiri.
- **Panel setting saldo default** dari UI dashboard.
- **Rekap saldo per warga** (daftar KTP + sisa saldo bulan berjalan).
