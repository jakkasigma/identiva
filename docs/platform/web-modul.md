# MODUL PENGEMBANGAN WEB: IDENTIVA PLATFORM SUBSIDI BERBASIS IDENTITAS

Dokumen ini berisi cetak biru (*blueprint*) pengembangan web **Identiva** — implementasi dari konsep pada `../../docx/identiva-platform.md`. Web dibangun terpisah dari proyek IoT inti (`../../docx/modul.md`) dan dapat berjalan mandiri dengan data dummy; integrasi terminal IoT dilakukan melalui API. Panduan desain visual ada di `desain-web.md`.

---

## BAGIAN 1: GAMBARAN UMUM

Web Identiva adalah platform distribusi subsidi berbasis identitas digital. Peran web:

* Menampilkan informasi program kepada publik (landing page).
* Menjadi tempat admin mitra mendata warga (data tersimpan **terpusat di main/pusat**), mengelola program subsidi, dan melakukan rekap harian.
* Menyediakan API untuk terminal IoT (via bridge PC): `/check-quota` (validasi), `/transaksi` (simpan), `/uid-scan` (pendataan).

**Stack:**
* **Frontend & Backend:** Next.js (App Router, TypeScript, Tailwind CSS).
* **Database:** MySQL 8.4 (via Laragon, port 3306, user `root`).
* **ORM:** Prisma.
* **Auth:** NextAuth (session, credentials) — **otentikasi ganda**: sesi untuk halaman web, **token mitra** untuk API alat (lihat Bagian 3).

---

## BAGIAN 2: PERAN & HAK AKSES

Terdapat **3 peran** pengguna:

| Peran | Deskripsi | Akses |
| :--- | :--- | :--- |
| **Warga (publik)** | Penerima subsidi, pemegang kartu | Hanya landing page (belum login). Ke depan: cek saldo & riwayat via HP. |
| **Admin Mitra** | Petugas/operator mitra penyalur | Login → dashboard data **mitranya sendiri** saja (multi-tenant). Bisa **membuat** data KTP baru di main, tapi **tidak bisa mengubah** data KTP siapa pun. |
| **Admin Platform** | Pengelola pusat (main) | Akses **semua** data + approve mitra + atur program global + **koreksi data KTP** (terbatas, lihat bawah). |

### Matriks Akses

| Halaman / Aksi | Warga (publik) | Admin Mitra | Admin Platform |
| :--- | :---: | :---: | :---: |
| Landing `/` | ✓ | ✓ | ✓ |
| Login `/login` | — | ✓ | ✓ |
| `/dashboard` ringkasan | ✗ | ✓ (mitranya) | ✓ (semua) |
| Kelola warga (tautkan program) | ✗ | ✓ (mitranya) | ✓ |
| Buat data KTP baru di main | ✗ | ✓ | ✓ |
| Edit data KTP (`nama`, `alamat`) | ✗ | ✗ | ✓ (koreksi saja) |
| Edit `nik` / `uid_kartu` | ✗ | ✗ | ✗ **paten** |
| Atur diskon program | ✗ | ✓ (miliknya) | ✓ (global) |
| Rekap & laporan | ✗ | ✓ (mitranya) | ✓ (semua) |
| Approve mitra | ✗ | ✗ | ✓ |

### Model Akun

* **1 akun = 1 mitra.** Akun login terikat ke `mitra_id` tertentu; data yang diakses hanya milik mitra tersebut.
* Field `role` pada tabel user bernilai `admin_mitra` / `admin_platform`.

### Prinsip Data KTP (main)

* Data KTP warga disimpan **terpusat di tabel `penduduk`** (main/pusat), bukan disalin per mitra.
* Mitra mendata warga baru → data masuk ke main; mitra lain yang mendaftarkan KTP yang sama **memakai data main yang sudah ada** dan tinggal menambahkan tautan mitra baru (enrollment).
* `nik` dan `uid_kartu` bersifat **paten (immutable)** — tidak bisa diubah oleh siapa pun.
* `nama`, `alamat` (data deskriptif) hanya bisa **dikoreksi oleh admin platform** (misal perbaikan typo). Mitra tidak bisa.

---

## BAGIAN 3: STRUKTUR FOLDER

```
lomba/web/
├── package.json / next.config.ts / tsconfig.json
├── .env                          ← DATABASE_URL (MySQL) + AUTH_SECRET
├── prisma/
│   ├── schema.prisma             ← 7 tabel (user, mitra, program_subsidi, penduduk, warga, kuota, transaksi)
│   └── seed.ts                   ← data dummy
└── src/
    ├── middleware.ts             ← proteksi route /dashboard (harus login)
    ├── lib/
    │   ├── prisma.ts             ← koneksi DB
    │   ├── auth.ts               ← NextAuth config (credentials)
    │   └── format.ts             ← format rupiah, tanggal, CSV
    ├── components/
    │   ├── Navbar.tsx, Footer.tsx
    │   ├── WargaTable.tsx, ProgramForm.tsx
    │   └── RekapTable.tsx        ← tabel rekap + tombol export CSV
    ├── app/
    │   ├── layout.tsx / globals.css / page.tsx        ← Landing (publik)
    │   ├── login/page.tsx                             ← Login mitra
    │   ├── dashboard/layout.tsx                       ← Sidebar mitra
    │   ├── dashboard/page.tsx                         ← Ringkasan (total transaksi hari ini, dll)
    │   ├── dashboard/warga/page.tsx                   ← Kelola warga (cari & tautkan dari main)
    │   ├── dashboard/program/page.tsx                 ← Kelola program (atur diskon)
    │   ├── dashboard/rekap/page.tsx                   ← Rekap & Laporan (filter hari/metode, export CSV)
    │   └── api/
    │       ├── check-quota/route.ts   ← POST /api/check-quota (validasi, tanpa simpan)
    │       ├── transaksi/route.ts     ← POST /api/transaksi (simpan, saat tombol D)
    │       ├── uid-scan/route.ts      ← POST /api/uid-scan (pendataan, Mode Alat B)
    │       ├── auth/[...nextauth]/route.ts
    │       ├── rekap/route.ts         ← data rekap buat tabel + CSV
    │       ├── warga/route.ts         ← cari/tautkan warga dari main
    │       └── program/route.ts       ← CRUD program (diskon)
```

---

## BAGIAN 4: SKEMA DATABASE

Nama database: **`identiva`** (MySQL 8.4).

### Tabel `user`
* `id` (PK), `username`, `password_hash`, `role` (`admin_mitra` / `admin_platform`), `mitra_id` (FK → mitra, nullable untuk admin platform)

### Tabel `mitra`
* `id` (PK), `nama`, `skala` (besar/kecil), `jenis_layanan`, `status` (pending/aktif/diblokir)
* `token_api` (**token mitra** untuk otentikasi API alat/bridge — di-generate saat onboarding; alat tak perlu login)

### Tabel `program_subsidi`
* `id` (PK), `nama` (BBM/Bansos/LPG/Pupuk), `satuan` (liter/kg/rupiah), `diskon` (%) diatur admin, `mitra_id` (FK → mitra)
* **Pengaturan per mitra** (ditentukan saat **onboarding** mitra berdasar survei kebutuhan, bukan hardcoded): `periode_reset` (hari/minggu/bulan), `kuota_total` default

### Tabel `penduduk` (main / data KTP terpusat)
* `id` (PK)
* `nik` (**UNIQUE**, paten — tak bisa diubah; **validasi format** NIK 16 digit saat input)
* `nama` (bisa dikoreksi admin platform)
* `alamat` (bisa dikoreksi admin platform)
* `uid_kartu` (**UNIQUE**, paten — identitas kartu global)
* `created_at`, `updated_at`

### Tabel `warga` (enrollment / tautan mitra)
* `id` (PK)
* `penduduk_id` (FK → penduduk)
* `mitra_id` (FK → mitra)
* `program_subsidi_id` (FK)
* `status` (aktif/diblokir)

### Tabel `kuota`
* `id` (PK), `warga_id` (FK → warga/enrollment), `kuota_total`, `kuota_terpakai`, `periode`
* **Reset otomatis per periode** sesuai `periode_reset` mitra: saat transaksi, server cek periode sekarang vs tersimpan — jika berganti → `kuota_terpakai` direset ke 0.

### Tabel `transaksi`
* `id` (PK), `warga_id` (FK → warga/enrollment), `mitra_id` (FK), `waktu`, `nominal`, `diskon`, `total_bayar`, `metode_bayar` (`cash`/`qris`)

### Tabel `scan_pending` (Mode Pendataan)
* `id` (PK), `mitra_id` (FK), `uid_kartu`, `waktu_scan`
* Menampung UID hasil scan Alat B yang belum dilengkapi datanya; **kedaluwarsa otomatis** (dihapus/diabaikan) jika tidak diproses dalam jangka waktu tertentu agar tidak menggantung.

---

## BAGIAN 5: ALUR PENDATAAN WARGA

Pendataan bisa dilakukan dengan **2 jalur**: lewat **Mode Pendataan (Alat B)** atau **form manual**.

### Jalur A — Mode Pendataan (Alat B)
1. Petugas menjalankan Alat B (Mode Pendataan) → warga menempelkan kartu → alat mengirim UID ke server (via bridge) → masuk tabel `scan_pending` mitra tersebut.
2. Petugas login web → `/dashboard/warga` → **panel "Scan Terbaru"** berisi UID hasil scan.
3. Klik UID → form terbuka dengan UID **terisi otomatis** → lengkapi NIK, nama, alamat → pilih program → Simpan.
4. Data tersimpan di `penduduk` (main) + enrollment. UID kini aktif untuk Mode Pembayaran.

### Jalur B — Form manual
1. Mitra buka `/dashboard/warga` → "Daftar Warga Baru".
2. Isi form: NIK, nama, alamat, UID kartu.
3. Sistem cek NIK (dan UID) di `penduduk`: **belum ada** → simpan ke `penduduk` (main) → otomatis buat enrollment (`warga`) ke mitra yang sedang login → pilih program.
4. Warga terdaftar untuk mitra tersebut; data KTP tinggal di main.

### Kasus 2 — KTP sudah terdaftar (oleh mitra lain)
1. Mitra buka `/dashboard/warga` → pencarian NIK / UID di `penduduk` (main).
2. **Ditemukan** → tampilkan data KTP (nama, alamat) → tombol "Tautkan ke Mitra Saya" → pilih program.
3. Enrollment baru dibuat (`warga`: `penduduk_id` + `mitra_id` baru). **Tidak membuat data KTP ulang.**

### Aturan
* Duplikat dicegah oleh `UNIQUE` pada `nik` dan `uid_kartu`.
* Mitra hanya melihat data KTP yang sudah ditautkan ke mitranya (privasi), bukan seluruh database main.
* Mitra **tidak bisa mengubah** data KTP; koreksi hanya oleh admin platform.
* NIK divalidasi format (16 digit) saat input.
* Scan `scan_pending` yang tak diproses kedaluwarsa otomatis.

---

## BAGIAN 6: PRIORITAS PEMBANGUNAN

### P0 — Fondasi (wajib, paling awal)
1. Setup Next.js + TypeScript + Tailwind + Prisma + koneksi MySQL.
2. Migrate database + **seed data dummy** (penduduk/main, mitra, program diskon, enrollment warga, kuota, contoh transaksi, akun login).
3. API IoT: `POST /api/check-quota` (validasi) + `POST /api/transaksi` (simpan) — bisa dites via Postman/browser tanpa hardware.

### P1 — Dashboard Mitra (jualan utama demo)
4. Login mitra (NextAuth, session).
5. `/dashboard/warga` — cari & tautkan dari main + panel **Scan Terbaru** (Alat B).
6. `/dashboard/program` — kelola program, atur diskon.
7. `/dashboard/rekap` — filter per hari & per metode (cash/QRIS), total nominal, total diskon (dasar klaim subsidi), total diterima per metode, daftar transaksi, export CSV.

### P2 — Presentasi & Polish
8. Landing page `/` (informasi program, keunggulan, cara daftar).
9. `/dashboard` ringkasan (total transaksi hari ini, kuota terpakai).
10. Program **bridge** di PC (baca Bluetooth → kirim API token) + `POST /api/uid-scan`.

### Bukan Prioritas (cicilan berikutnya)
* Admin platform (approve mitra, onboarding mitra + survei setting, program global, koreksi data KTP).
* Pengajuan mitra via web.
* Cek saldo & riwayat warga via HP (PWA + NFC).
* Chart, PDF export, notifikasi, log edit data KTP.

**Aturan kerja:** P0 → P1 → P2. Setiap tahap selesai dan berjalan dulu sebelum lanjut ke tahap berikutnya.

---

## BAGIAN 7: LOGIKA ENDPOINT API

### `POST /api/check-quota` — validasi saja (tanpa simpan)
Menerima `{"token": "<token mitra>", "uid": "...", "nominal": 20000}`:

1. Cek `token_api` mitra valid. Jika tidak → `401`.
2. Cari `penduduk` berdasarkan `uid_kartu`. Jika tidak ada → `{"status":"invalid","alasan":"tidak_terdaftar"}`.
3. Cari enrollment `warga` aktif untuk penduduk + mitra pemilik token. Jika tidak ada/diblokir → `{"status":"invalid","alasan":"terblokir"}`.
4. Cek/reset kuota per periode (`periode_reset` mitra). Jika `sisa_kuota <= 0` → `{"status":"invalid","alasan":"kuota_habis"}`.
5. Ambil `diskon` dari program, hitung `total_bayar = nominal - (nominal * diskon / 100)`.
6. Respons: `{"status":"valid","nominal":20000,"diskon":30,"total_bayar":14000,"sisa_kuota":19}` — **tanpa** memotong kuota/mencatat transaksi.

### `POST /api/transaksi` — menyimpan (dipanggil saat tombol `D`)
Menerima `{"token": "<token mitra>", "uid": "...", "nominal": 20000, "metode_bayar": "cash"|"qris"}`:

1. Otentikasi token → cek ulang penduduk + enrollment aktif + kuota.
2. Increment `kuota_terpakai` + catat transaksi (nominal, diskon, total_bayar, metode, waktu).
3. Respons: `{"status":"ok"}`.

### `POST /api/uid-scan` — pendataan (Alat B)
Menerima `{"token": "<token mitra>", "uid": "..."}` → simpan ke `scan_pending` mitra → `{"status":"ok"}`.

*Diskon dihitung di server (bukan alat) agar konsisten dengan kuota dan rekap. Pemisahan validasi & simpan memastikan transaksi hanya tercatat saat petugas menekan `D` di alat.*

---

## BAGIAN 8: CATATAN

* Web dibangun mandiri dengan data dummy; integrasi alat IoT dilakukan lewat API (`/check-quota`, `/transaksi`, `/uid-scan`) via bridge PC.
* **Konektivitas:** alat terhubung ke PC via **Bluetooth** (pairing ala printer) → program bridge di PC meneruskan ke API memakai **token mitra** (`mitra.token_api`); fallback USB serial.
* **Otentikasi ganda:** sesi NextAuth untuk halaman web; token mitra untuk API alat.
* **Reset kuota:** otomatis per periode sesuai `periode_reset` yang dikonfigurasi per mitra saat onboarding (hasil survei kebutuhan mitra).
* Data KTP dikelola mandiri (registry internal) karena proyek berskala kecil/mandiri tanpa integrasi Dukcapil. Desain `penduduk` meniru "satu sumber data terpusat" sehingga jika kelak ingin resmi, cukup mengganti sumber input dari manual menjadi integrasi data kependudukan tanpa mengubah skema inti.
* **Batasan konsep (transparan):**
  * **Trust petugas:** sistem tidak dapat memverifikasi kesesuaian nominal dengan barang yang diserahkan, maupun pembayaran cash/QRIS yang sebenarnya — pembayaran berlangsung di luar sistem.
  * **UID RFID dapat dipalsukan (clone):** untuk produksi nyata diperlukan autentikasi lebih kuat (HTTPS, enkripsi kartu).
* Akun mitra contoh (seed): `admin` / `mitra123`.
