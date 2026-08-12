# RENCANA PROYEK WEB IDENTIVA

Dokumen ini berisi rencana implementasi web **Identiva** — platform distribusi subsidi berbasis identitas digital. Web dibangun di `lomba/web/` menggunakan blueprint dari `web-modul.md` dan `desain-web.md`.

---

## STACK TEKNOLOGI

| Layer | Teknologi |
| :--- | :--- |
| Frontend + Backend | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MySQL 8.4 (Laragon, port 3306, user `root`) |
| ORM | Prisma |
| Auth | NextAuth v5 (Credentials + JWT) |
| Form | react-hook-form + zod |
| Tabel Data | TanStack Table |

---

## STRUKTUR FOLDER TARGET

```
lomba/web/
├── package.json / next.config.ts / tsconfig.json
├── .env
├── prisma/
│   ├── schema.prisma             ← 8 tabel
│   └── seed.ts                   ← data dummy
└── src/
    ├── middleware.ts             ← proteksi /dashboard
    ├── lib/
    │   ├── prisma.ts             ← koneksi DB singleton
    │   ├── auth.ts               ← NextAuth config
    │   ├── auth-api.ts           ← validasi token mitra (API IoT)
    │   └── format.ts             ← format rupiah, tanggal, CSV
    ├── components/
    │   ├── RfidCard.tsx           ← signature kartu + animasi
    │   ├── StatCard.tsx           ← kartu statistik dashboard
    │   ├── warga/                 ← WargaTable, ScanTerbaruPanel, WargaForm
    │   ├── program/               ← ProgramTable, ProgramForm
    │   ├── rekap/                 ← RekapTable, ExportCSV
    │   └── ui/                    ← komponen shadcn
    ├── app/
    │   ├── layout.tsx / globals.css
    │   ├── page.tsx               ← Landing (publik)
    │   ├── login/page.tsx
    │   ├── dashboard/
    │   │   ├── layout.tsx         ← sidebar + topbar
    │   │   ├── page.tsx           ← ringkasan
    │   │   ├── warga/page.tsx
    │   │   ├── program/page.tsx
    │   │   └── rekap/page.tsx
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       ├── check-quota/route.ts
    │       ├── transaksi/route.ts
    │       ├── uid-scan/route.ts
    │       ├── rekap/route.ts
    │       ├── warga/route.ts
    │       └── program/route.ts
```

---

## PRIORITAS PEMBANGUNAN

### P0 — Fondasi

| # | Langkah | Detail |
| :--- | :--- | :--- |
| 1 | Scaffold Next.js | `create-next-app` — App Router, TypeScript, Tailwind, src/ |
| 2 | Install dependencies | Prisma, NextAuth, react-hook-form, zod, TanStack Table, bcryptjs |
| 3 | Setup shadcn/ui | Init + install 13 komponen (Button, Input, Label, Card, Badge, Dialog, Select, Tabs, Table, Sheet, DropdownMenu, Toast, Skeleton) |
| 4 | Design tokens | Override CSS variables sesuai palet Identiva (#0E5A50, #F7F5F0, #E5A33D, dst.) + self-host font (Newsreader, Public Sans, IBM Plex Mono) |
| 5 | Environment | `.env` — DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL |
| 6 | Prisma schema | 8 tabel: User, Mitra, ProgramSubsidi, Penduduk, Warga, Kuota, Transaksi, ScanPending — semua relasi + index + enum + `@@map` snake_case |
| 7 | Seed data | 2 mitra, 2 user (admin/mitra123), 3–4 program, 6 penduduk, enrollment + kuota, ~10 transaksi, 2 scan_pending |
| 8 | Migrate + seed | `prisma migrate dev` → `prisma db seed` |
| 9 | Prisma singleton | `src/lib/prisma.ts` — cegah koneksi berlebih saat dev |
| 10 | Helper utilities | `format.ts` (rupiah, tanggal, CSV) + `auth-api.ts` (validasi token mitra) |
| 11 | API check-quota | `POST /api/check-quota` — validasi kartu + kuota + hitung diskon, **tanpa simpan** |
| 12 | API transaksi | `POST /api/transaksi` — simpan transaksi + increment kuota |
| 13 | API uid-scan | `POST /api/uid-scan` — simpan UID dari Alat B ke scan_pending |
| 14 | Test API | Verifikasi ketiga endpoint via Postman/curl dengan data seed |

### P1 — Dashboard Mitra

| # | Langkah | Detail |
| :--- | :--- | :--- |
| 15 | NextAuth config | Credentials provider + bcrypt + JWT + session callback (role, mitraId) |
| 16 | Middleware | Proteksi `/dashboard/*` → redirect `/login` jika belum login |
| 17 | Login page | Card center: username + password + error message jelas |
| 18 | Dashboard layout | Sidebar (Ringkasan, Warga, Program, Rekap) + topbar (nama mitra, logout) + Sheet mobile |
| 19 | Halaman Warga | 3 Tabs: Warga Mitra (tabel + cari) · Scan Terbaru (dari Alat B) · Daftar Baru (form + cek NIK di main). Validasi NIK 16 digit. API: `/api/warga` |
| 20 | Halaman Program | Tabel program + Dialog form edit diskon. API: `/api/program` |
| 21 | Halaman Rekap | Filter tanggal + metode → 3 StatCard → TanStack Table → tombol Export CSV (UTF-8 BOM). API: `/api/rekap` |

### P2 — Presentasi & Polish

| # | Langkah | Detail |
| :--- | :--- | :--- |
| 22 | Komponen RFID Card | Kartu rounded bg teal, chip amber, gelombang NFC, garis scan animasi CSS. `prefers-reduced-motion` dihormati. |
| 23 | Landing page | Navbar → Hero RFID + tagline → Cara Kerja (1-2-3) → Program Subsidi → Keunggulan → CTA → Footer |
| 24 | Ringkasan dashboard | 4 StatCard: transaksi hari ini, total nominal, total diskon, kuota terpakai |
| 25 | Polish | Skeleton loading, empty states ("Belum ada warga, scan kartu dulu"), responsive mobile, favicon |

---

## SKEMA DATABASE

### Enum

```
Role: admin_mitra, admin_platform
StatusMitra: pending, aktif, diblokir
StatusWarga: aktif, diblokir
MetodeBayar: cash, qris
PeriodeReset: harian, mingguan, bulanan
```

### Relasi Utama

```
User ──→ Mitra (1 user = 1 mitra)
Mitra ──→ ProgramSubsidi (1:N)
Mitra ──→ Warga (1:N)
Mitra ──→ Transaksi (1:N)
Mitra ──→ ScanPending (1:N)
Penduduk ──→ Warga (1:N — 1 penduduk bisa di banyak mitra)
Warga ──→ ProgramSubsidi (N:1)
Warga ──→ Kuota (1:1)
Warga ──→ Transaksi (1:N)
```

### Constraint Penting

- `Penduduk.nik` — UNIQUE, immutable
- `Penduduk.uid_kartu` — UNIQUE, immutable
- `Mitra.token_api` — UNIQUE
- `Warga` — UNIQUE [pendudukId, mitraId, programSubsidiId] (cegah duplikat enrollment)
- `Transaksi` — INDEX [mitraId, waktu] (performa rekap)

---

## LOGIKA BISNIS KUNCI

### Reset Kuota Otomatis
- Saat transaksi/check-quota, server cek `Kuota.periode` vs periode sekarang
- Jika berganti periode → `kuota_terpakai` direset ke 0, `periode` diupdate
- Format periode: harian = "2026-08-07", mingguan = "2026-W32", bulanan = "2026-08"

### Pemisahan Validasi & Simpan
- `check-quota`: hanya validasi + hitung diskon — **tidak** memotong kuota
- `transaksi`: simpan transaksi + potong kuota — hanya dipanggil saat petugas tekan `D`

### Multi-tenant
- Setiap query dashboard di-filter by `mitraId` dari session
- Mitra hanya lihat penduduk yang sudah ditautkan ke mitranya

### Pendataan 2 Jalur
- **Jalur A**: Alat B scan UID → `scan_pending` → petugas lengkapi form di web
- **Jalur B**: Input manual form di web → cek NIK di main → create/link

---

## VERIFIKASI

| Fase | Cara Tes |
| :--- | :--- |
| P0 | `npx prisma studio` → cek tabel + data seed. Hit 3 API endpoint via Postman dengan token mitra dari seed. |
| P1 | Login admin/mitra123 → navigasi semua halaman → tambah warga → buat transaksi via API → cek rekap → export CSV. |
| P2 | Buka `/` → landing responsive → animasi kartu RFID → ringkasan dashboard terisi data. |
| Final | `npm run build` harus sukses tanpa error. |

---

## SEED AKUN

| Username | Password | Role | Mitra |
| :--- | :--- | :--- | :--- |
| `admin` | `mitra123` | admin_mitra | Toko Berkah |
| `admin2` | `mitra123` | admin_mitra | Kios Makmur |
