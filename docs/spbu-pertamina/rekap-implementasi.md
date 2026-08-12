# REKAP IMPLEMENTASI WEB IDENTIVA

Dokumen ini merekap seluruh pekerjaan yang sudah dilakukan pada bagian **web Identiva**. Isinya fokus pada hasil implementasi aktual: struktur proyek, alur sistem, database, API, halaman web, dashboard, autentikasi, desain UI, seed data, cara menjalankan, dan status verifikasi.

---

## 1. RINGKASAN IMPLEMENTASI

Web **Identiva** sudah dibuat di folder:

```txt
lomba/web/
```

Web ini berfungsi sebagai platform distribusi subsidi berbasis identitas digital. Implementasi sudah mencakup:

- Landing page publik.
- Login admin mitra.
- Dashboard mitra.
- Pendataan warga.
- Pengelolaan program subsidi.
- Rekap transaksi + export CSV.
- API untuk terminal IoT ESP32 / bridge PC.
- Database MySQL via Prisma ORM.
- Seed data demo.
- Desain visual sesuai blueprint Identiva.

---

## 2. STACK TEKNOLOGI YANG DIPAKAI

| Bagian | Teknologi |
| :--- | :--- |
| Framework | Next.js 16 App Router |
| UI Runtime | React 19 |
| Bahasa | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Component | shadcn/ui berbasis Base UI |
| Icon | lucide-react |
| Database | MySQL |
| ORM | Prisma 6 |
| Auth | NextAuth v5 beta Credentials + JWT |
| Validasi | zod |
| Form | react-hook-form tersedia, sebagian form memakai native FormData/client fetch |
| Password Hash | bcryptjs |
| CSV | Utility custom di `src/lib/format.ts` |

Script penting di `package.json`:

```bash
npm run dev      # menjalankan server development
npm run build    # build production
npm run start    # menjalankan production server
npm run lint     # cek ESLint
```

Seed Prisma:

```bash
npx prisma db seed
```

---

## 3. STRUKTUR FOLDER AKTUAL

```txt
web/
├── docs/
│   ├── desain-web.md
│   ├── web-modul.md
│   ├── rencana-projek.md
│   └── rekap-implementasi.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── proxy.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── actions.ts
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── warga/page.tsx
│   │   │   ├── program/page.tsx
│   │   │   └── rekap/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── check-quota/route.ts
│   │       ├── transaksi/route.ts
│   │       ├── uid-scan/route.ts
│   │       ├── warga/route.ts
│   │       ├── program/route.ts
│   │       └── rekap/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── DashboardNav.tsx
│   │   ├── RfidCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── warga/
│   │   │   ├── WargaForm.tsx
│   │   │   ├── WargaTable.tsx
│   │   │   └── ScanTerbaruPanel.tsx
│   │   └── program/
│   │       └── ProgramForm.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── auth-api.ts
│   │   ├── quota.ts
│   │   ├── format.ts
│   │   └── utils.ts
│   ├── fonts/
│   │   └── PublicSans-VariableFont_wght.ttf
│   └── types/
│       └── next-auth.d.ts
├── .env
├── package.json
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

Catatan penting:

- Proteksi route memakai `src/proxy.ts`, bukan `middleware.ts`, karena Next.js 16 memakai konvensi **Proxy**.
- Folder `.next/` dan `node_modules/` adalah hasil build/dependency, bukan source utama.

---

## 4. DATABASE DAN PRISMA

Database memakai MySQL dengan nama:

```txt
identiva
```

Konfigurasi `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/identiva"
AUTH_SECRET="identiva-secret-key-change-in-production-2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 4.1 Enum Database

| Enum | Nilai |
| :--- | :--- |
| `Role` | `admin_mitra`, `admin_platform` |
| `StatusMitra` | `pending`, `aktif`, `diblokir` |
| `StatusWarga` | `aktif`, `diblokir` |
| `MetodeBayar` | `cash`, `qris` |
| `PeriodeReset` | `harian`, `mingguan`, `bulanan` |

### 4.2 Tabel Database

| Tabel Prisma | Tabel MySQL | Fungsi |
| :--- | :--- | :--- |
| `User` | `user` | akun login dashboard |
| `Mitra` | `mitra` | data mitra + token API IoT |
| `ProgramSubsidi` | `program_subsidi` | program subsidi, diskon, kuota, periode reset |
| `Penduduk` | `penduduk` | data KTP terpusat: NIK, nama, alamat, UID kartu |
| `Warga` | `warga` | enrollment penduduk ke mitra + program |
| `Kuota` | `kuota` | kuota total/terpakai per warga |
| `Transaksi` | `transaksi` | catatan transaksi subsidi |
| `ScanPending` | `scan_pending` | UID hasil scan Alat B sebelum dilengkapi data |

### 4.3 Relasi Utama

```txt
User ──→ Mitra
Mitra ──→ ProgramSubsidi
Mitra ──→ Warga
Mitra ──→ Transaksi
Mitra ──→ ScanPending
Penduduk ──→ Warga
Warga ──→ ProgramSubsidi
Warga ──→ Kuota
Warga ──→ Transaksi
```

### 4.4 Constraint Penting

- `User.username` unique.
- `Mitra.token_api` unique.
- `Penduduk.nik` unique.
- `Penduduk.uid_kartu` unique.
- `Warga` unique berdasarkan kombinasi:

```txt
pendudukId + mitraId + programSubsidiId
```

- `Transaksi` punya index:

```txt
mitraId + waktu
```

Dipakai untuk mempercepat rekap transaksi per mitra dan tanggal.

---

## 5. SEED DATA DEMO

Seed dibuat di:

```txt
web/prisma/seed.ts
```

Seed akan menghapus data lama lalu membuat data dummy baru.

### 5.1 Mitra Seed

| Mitra | Skala | Layanan | Token API |
| :--- | :--- | :--- | :--- |
| Toko Berkah | kecil | BBM & LPG | `tok_berkah_2026_abc123def456` |
| Kios Makmur | besar | Sembako & Pupuk | `tok_makmur_2026_xyz789ghi012` |

### 5.2 Akun Login Seed

| Username | Password | Role | Mitra |
| :--- | :--- | :--- | :--- |
| `admin` | `mitra123` | `admin_mitra` | Toko Berkah |
| `admin2` | `mitra123` | `admin_mitra` | Kios Makmur |

Password disimpan sebagai hash bcrypt.

### 5.3 Program Subsidi Seed

| Mitra | Program | Satuan | Diskon | Periode Reset | Kuota |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Toko Berkah | BBM Solar | liter | 30% | bulanan | 50 |
| Toko Berkah | LPG 3kg | kg | 25% | bulanan | 3 |
| Kios Makmur | Pupuk Urea | kg | 40% | bulanan | 100 |
| Kios Makmur | Bansos Sembako | rupiah | 50% | mingguan | 5 |

### 5.4 Data Lain dari Seed

Seed juga membuat:

- 6 data penduduk/KTP.
- 8 enrollment warga.
- Kuota awal per enrollment.
- 10 transaksi contoh hari ini/kemarin.
- 2 data `scan_pending` untuk simulasi Alat B.

---

## 6. ALUR WEB PUBLIK

Route:

```txt
/
```

File:

```txt
src/app/page.tsx
```

Landing page berisi:

1. Navbar Identiva.
2. Hero dengan tagline:

```txt
Satu Kartu untuk Semua Subsidi.
```

3. Komponen visual kartu RFID.
4. CTA ke login/dashboard.
5. Section cara kerja:
   - Scan Kartu.
   - Validasi Kuota.
   - Transaksi Tercatat.
6. Section program subsidi:
   - BBM Solar.
   - LPG 3kg.
   - Pupuk.
   - Bansos Sembako.
7. Section keunggulan:
   - Multi-tenant.
   - Data pusat.
   - API IoT.
8. Footer.

---

## 7. ALUR LOGIN DAN AUTENTIKASI

Route:

```txt
/login
```

File utama:

```txt
src/app/login/page.tsx
src/app/login/LoginForm.tsx
src/app/login/actions.ts
src/lib/auth.ts
src/types/next-auth.d.ts
```

### 7.1 Login Flow

```txt
User buka /login
    ↓
Input username + password
    ↓
Server action loginAction()
    ↓
NextAuth Credentials authorize()
    ↓
Cari user by username di database
    ↓
Cek bcrypt password
    ↓
Jika valid: buat JWT session
    ↓
Redirect ke /dashboard
```

### 7.2 Data Session

Session user berisi:

- `id`
- `username`
- `role`
- `mitraId`
- `mitraNama`

Data ini dipakai untuk filter data dashboard agar setiap mitra hanya melihat data sendiri.

### 7.3 Proteksi Dashboard

File:

```txt
src/proxy.ts
```

Alur:

```txt
Request ke /dashboard/*
    ↓
Cek session auth
    ↓
Jika belum login → redirect /login
    ↓
Jika sudah login → lanjut dashboard
```

---

## 8. ALUR DASHBOARD

Layout dashboard dibuat di:

```txt
src/app/dashboard/layout.tsx
src/components/DashboardNav.tsx
```

Layout menyediakan:

- Sidebar desktop.
- Sheet/sidebar mobile.
- Topbar.
- Nama mitra aktif.
- Badge role.
- Tombol logout.
- Navigasi:
  - Ringkasan.
  - Warga.
  - Program.
  - Rekap.

---

## 9. HALAMAN RINGKASAN DASHBOARD

Route:

```txt
/dashboard
```

File:

```txt
src/app/dashboard/page.tsx
src/components/StatCard.tsx
```

Data yang ditampilkan:

| Komponen | Isi |
| :--- | :--- |
| StatCard Transaksi Hari Ini | jumlah transaksi hari ini |
| StatCard Total Nominal | total nominal transaksi hari ini |
| StatCard Total Diskon | total subsidi/diskon hari ini |
| StatCard Kuota Terpakai | total kuota terpakai / total kuota |
| Tabel Transaksi Terbaru | 5 transaksi terakhir |

Query difilter berdasarkan `mitraId` dari session.

---

## 10. HALAMAN WARGA

Route:

```txt
/dashboard/warga
```

File:

```txt
src/app/dashboard/warga/page.tsx
src/components/warga/WargaTable.tsx
src/components/warga/WargaForm.tsx
src/components/warga/ScanTerbaruPanel.tsx
src/app/api/warga/route.ts
```

### 10.1 Tab Warga Mitra

Menampilkan tabel warga yang sudah terdaftar di mitra aktif.

Kolom:

- NIK.
- Nama + alamat.
- UID kartu.
- Program.
- Kuota terpakai/total.
- Status.

### 10.2 Tab Scan Terbaru

Menampilkan UID yang masuk dari Alat B melalui API:

```txt
POST /api/uid-scan
```

Alur:

```txt
Alat B scan RFID
    ↓
Bridge PC kirim UID ke /api/uid-scan
    ↓
UID masuk scan_pending
    ↓
Petugas buka Dashboard Warga > Scan Terbaru
    ↓
Form warga otomatis terisi UID
    ↓
Petugas isi NIK, nama, alamat, program
    ↓
Simpan warga
```

### 10.3 Tab Daftar Baru

Untuk input manual warga tanpa scan alat.

Input:

- NIK.
- UID kartu.
- Nama.
- Alamat.
- Program subsidi.

Validasi dasar:

- NIK wajib 16 digit.
- UID wajib diisi.
- Program wajib dipilih.

### 10.4 API Warga

Route:

```txt
/api/warga
```

Method:

| Method | Fungsi |
| :--- | :--- |
| GET | ambil list/search warga mitra |
| POST | buat/link penduduk menjadi warga mitra |

Alur POST:

```txt
Cek session login
    ↓
Validasi input zod
    ↓
Cek program milik mitra
    ↓
Upsert penduduk berdasarkan NIK
    ↓
Create warga/enrollment
    ↓
Create kuota awal
    ↓
Jika dari scan_pending, hapus scan_pending
```

---

## 11. HALAMAN PROGRAM

Route:

```txt
/dashboard/program
```

File:

```txt
src/app/dashboard/program/page.tsx
src/components/program/ProgramForm.tsx
src/app/api/program/route.ts
```

Fitur:

- Lihat daftar program milik mitra.
- Tambah program.
- Edit program.
- Atur diskon.
- Atur satuan.
- Atur kuota total.
- Atur periode reset.

Kolom tabel:

- Nama.
- Satuan.
- Diskon.
- Kuota.
- Reset.
- Aksi edit.

### API Program

Route:

```txt
/api/program
```

Method:

| Method | Fungsi |
| :--- | :--- |
| GET | ambil program mitra aktif |
| POST | tambah atau update program |

Semua query difilter dengan `mitraId` session.

---

## 12. HALAMAN REKAP

Route:

```txt
/dashboard/rekap
```

File:

```txt
src/app/dashboard/rekap/page.tsx
src/app/api/rekap/route.ts
src/lib/format.ts
```

Fitur:

- Filter tanggal.
- Filter metode bayar (`cash`, `qris`, semua).
- StatCard total nominal.
- StatCard total diskon.
- StatCard total diterima mitra.
- Tabel transaksi.
- Export CSV.

### 12.1 Query Rekap

Data transaksi difilter:

```txt
mitraId session
waktu >= awal hari
waktu < akhir hari
metodeBayar optional
```

### 12.2 Export CSV

Route:

```txt
/api/rekap?date=YYYY-MM-DD&metode=semua&format=csv
```

Jika `format=csv`, API mengembalikan file CSV dengan header:

- waktu.
- nik.
- nama.
- program.
- nominal.
- diskon_persen.
- total_bayar.
- metode.

CSV diberi UTF-8 BOM agar aman dibuka di Excel.

---

## 13. API IOT

API IoT memakai autentikasi token mitra, bukan session login web.

Helper token:

```txt
src/lib/auth-api.ts
```

Token dicek ke tabel:

```txt
mitra.token_api
```

Mitra juga harus berstatus:

```txt
aktif
```

---

## 14. API CHECK QUOTA

Route:

```txt
POST /api/check-quota
```

File:

```txt
src/app/api/check-quota/route.ts
```

Payload:

```json
{
  "token": "tok_berkah_2026_abc123def456",
  "uid": "A1B2C3D4",
  "nominal": 20000
}
```

Alur:

```txt
Validasi payload zod
    ↓
Cek token mitra
    ↓
Cari penduduk by uid_kartu
    ↓
Cari warga aktif by penduduk + mitra
    ↓
Cek/reset kuota periode sekarang
    ↓
Jika kuota habis → invalid
    ↓
Hitung diskon server-side
    ↓
Return status valid
```

Respons valid contoh:

```json
{
  "status": "valid",
  "uid": "A1B2C3D4",
  "nama": "Budi Santoso",
  "program": "BBM Solar",
  "nominal": 20000,
  "diskon": 30,
  "total_bayar": 14000,
  "sisa_kuota": 38
}
```

Penting:

- Endpoint ini **tidak menyimpan transaksi**.
- Endpoint ini **tidak memotong kuota**.
- Endpoint ini hanya validasi dan hitung harga.

---

## 15. API TRANSAKSI

Route:

```txt
POST /api/transaksi
```

File:

```txt
src/app/api/transaksi/route.ts
```

Payload:

```json
{
  "token": "tok_berkah_2026_abc123def456",
  "uid": "A1B2C3D4",
  "nominal": 20000,
  "metode_bayar": "cash"
}
```

Alur:

```txt
Validasi payload zod
    ↓
Cek token mitra
    ↓
Cari penduduk by uid_kartu
    ↓
Cari warga aktif by penduduk + mitra
    ↓
Cek/reset kuota
    ↓
Hitung diskon dan total bayar
    ↓
Transaction DB:
      - increment kuota_terpakai
      - create transaksi
    ↓
Return status ok
```

Endpoint ini dipakai saat alat/petugas sudah konfirmasi transaksi, misalnya setelah tombol `D` ditekan di terminal.

---

## 16. API UID SCAN

Route:

```txt
POST /api/uid-scan
```

File:

```txt
src/app/api/uid-scan/route.ts
```

Payload:

```json
{
  "token": "tok_berkah_2026_abc123def456",
  "uid": "Y5Z6A7B8"
}
```

Alur:

```txt
Validasi payload zod
    ↓
Cek token mitra
    ↓
Create scan_pending
    ↓
Return scan_id + uid + waktu_scan
```

Dipakai untuk Mode Pendataan / Alat B.

---

## 17. LOGIKA KUOTA

File:

```txt
src/lib/quota.ts
```

Fungsi utama:

```txt
getCurrentPeriode()
ensureCurrentKuota()
```

Format periode:

| Periode Reset | Format |
| :--- | :--- |
| harian | `YYYY-MM-DD` |
| mingguan | `YYYY-Www` |
| bulanan | `YYYY-MM` |

Alur reset:

```txt
Ambil periode sekarang berdasarkan periode_reset program
    ↓
Bandingkan dengan kuota.periode
    ↓
Jika beda:
      - kuota_total disesuaikan dari program
      - kuota_terpakai reset ke 0
      - periode diupdate
    ↓
Jika sama:
      - gunakan kuota berjalan
```

---

## 18. LOGIKA MULTI-TENANT

Multi-tenant diterapkan dengan prinsip:

```txt
1 akun = 1 mitra
```

Data dashboard selalu difilter menggunakan:

```txt
session.user.mitraId
```

Diterapkan pada:

- Dashboard ringkasan.
- Warga.
- Program.
- Rekap.
- API dashboard.

API IoT memakai:

```txt
token_api → mitraId
```

Jadi alat milik satu mitra hanya bisa mengakses data warga yang terdaftar pada mitra tersebut.

---

## 19. DESAIN UI YANG SUDAH DIIMPLEMENTASIKAN

### 19.1 Token Warna

File:

```txt
src/app/globals.css
```

Warna utama:

| Token | Hex | Fungsi |
| :--- | :--- | :--- |
| Primary | `#0E5A50` | brand, tombol utama, sidebar |
| Teal hover | `#1F8A79` | hover/active |
| Background | `#F7F5F0` | latar paper |
| Surface | `#FFFFFF` | card/panel |
| Ink | `#14211F` | teks utama |
| Muted | `#5A6B66` | teks sekunder |
| Accent | `#E5A33D` | kuota/highlight |
| Success | `#2E7D32` | status sukses |
| Destructive | `#C0403C` | error |
| Border | `#DDE5E1` | garis halus |

### 19.2 Font

- Public Sans — self-hosted di `src/fonts/PublicSans-VariableFont_wght.ttf`.
- Newsreader — display font dari `next/font/google`.
- IBM Plex Mono — data teknis seperti NIK, UID, nominal.

### 19.3 Komponen UI

Komponen shadcn/ui yang tersedia:

- Button.
- Input.
- Label.
- Card.
- Badge.
- Dialog.
- Select.
- Tabs.
- Table.
- Sheet.
- Dropdown Menu.
- Toast.
- Skeleton.

### 19.4 Komponen RFID Card

File:

```txt
src/components/RfidCard.tsx
```

Fitur:

- Kartu rounded warna teal.
- Chip amber.
- Gelombang NFC.
- UID contoh.
- Garis scan animasi CSS.
- Menghormati `prefers-reduced-motion`.

---

## 20. FILE UTILITAS INTI

| File | Fungsi |
| :--- | :--- |
| `src/lib/prisma.ts` | Prisma Client singleton untuk development hot reload |
| `src/lib/auth.ts` | konfigurasi NextAuth Credentials + JWT |
| `src/lib/auth-api.ts` | validasi token API mitra untuk alat IoT |
| `src/lib/quota.ts` | hitung periode dan reset kuota otomatis |
| `src/lib/format.ts` | format rupiah, format tanggal, CSV, date range |
| `src/lib/utils.ts` | helper `cn()` untuk className |

---

## 21. CARA MENJALANKAN PROJECT

Masuk folder web:

```bash
cd web
```

Install dependency jika belum:

```bash
npm install
```

Pastikan MySQL/Laragon aktif.

Jalankan migration:

```bash
npx prisma migrate dev
```

Jalankan seed:

```bash
npx prisma db seed
```

Jalankan development server:

```bash
npm run dev
```

Buka browser:

```txt
http://localhost:3000
```

Login:

```txt
http://localhost:3000/login
```

Akun:

```txt
admin / mitra123
admin2 / mitra123
```

---

## 22. CONTOH TEST API IOT

### 22.1 Check Quota

```bash
curl -X POST http://localhost:3000/api/check-quota \
  -H "Content-Type: application/json" \
  -d '{"token":"tok_berkah_2026_abc123def456","uid":"A1B2C3D4","nominal":20000}'
```

### 22.2 Simpan Transaksi

```bash
curl -X POST http://localhost:3000/api/transaksi \
  -H "Content-Type: application/json" \
  -d '{"token":"tok_berkah_2026_abc123def456","uid":"A1B2C3D4","nominal":20000,"metode_bayar":"cash"}'
```

### 22.3 UID Scan

```bash
curl -X POST http://localhost:3000/api/uid-scan \
  -H "Content-Type: application/json" \
  -d '{"token":"tok_berkah_2026_abc123def456","uid":"Y5Z6A7B8"}'
```

---

## 23. VERIFIKASI YANG SUDAH DILAKUKAN

### 23.1 Prisma Migration + Seed

Migration berhasil membuat database MySQL:

```txt
identiva
```

Seed berhasil membuat:

- Mitra.
- User login.
- Program subsidi.
- Penduduk.
- Warga/enrollment.
- Kuota.
- Transaksi contoh.
- Scan pending.

### 23.2 Lint

Command:

```bash
npm run lint
```

Status:

```txt
Sukses, exit_code=0
```

### 23.3 Production Build

Command:

```bash
npm run build
```

Status:

```txt
Sukses, exit_code=0
```

Route yang terdeteksi saat build:

```txt
/
/api/auth/[...nextauth]
/api/check-quota
/api/program
/api/rekap
/api/transaksi
/api/uid-scan
/api/warga
/dashboard
/dashboard/program
/dashboard/rekap
/dashboard/warga
/login
```

---

## 24. STATUS FITUR

| Fitur | Status |
| :--- | :--- |
| Next.js scaffold | Selesai |
| Tailwind + shadcn/ui | Selesai |
| Design token Identiva | Selesai |
| Prisma schema | Selesai |
| MySQL migration | Selesai |
| Seed data dummy | Selesai |
| NextAuth login | Selesai |
| Proteksi dashboard | Selesai |
| Landing page | Selesai |
| Dashboard ringkasan | Selesai |
| Dashboard warga | Selesai |
| Dashboard program | Selesai |
| Dashboard rekap | Selesai |
| Export CSV | Selesai |
| API check-quota | Selesai |
| API transaksi | Selesai |
| API uid-scan | Selesai |
| API warga | Selesai |
| API program | Selesai |
| API rekap | Selesai |
| RFID card animation | Selesai |
| Build production | Selesai |

---

## 25. BATASAN DAN BACKLOG

Belum dibuat / bisa dilanjutkan nanti:

- Program bridge PC Bluetooth → HTTP API.
- Firmware ESP32 final.
- Admin platform untuk approve mitra dan koreksi data KTP.
- Chart laporan.
- Export PDF.
- Notifikasi.
- Audit log perubahan data.
- PWA warga untuk cek saldo/riwayat.
- Browser/manual testing end-to-end dengan server hidup.

---

## 26. KESIMPULAN

Web Identiva sudah berubah dari blueprint menjadi aplikasi Next.js yang dapat dijalankan. Bagian utama sudah tersedia:

```txt
Landing publik
Login mitra
Dashboard mitra
Pendataan warga
Kelola program
Rekap transaksi + CSV
API IoT
Database MySQL + Prisma
Seed demo
Design system Identiva
```

Secara teknis, fondasi P0, dashboard P1, dan presentasi P2 sudah selesai sesuai rencana awal. Langkah berikutnya yang paling masuk akal adalah menjalankan app di browser, melakukan manual testing alur login/dashboard/API, lalu lanjut ke bridge PC Bluetooth untuk integrasi alat IoT.
