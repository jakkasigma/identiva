# Panduan Hosting Identiva ke Vercel + Supabase

Dokumen ini berisi langkah lengkap migrasi dan deploy web Identiva ke:

- Web hosting: Vercel
- Database: Supabase PostgreSQL
- ORM: Prisma
- Auth: NextAuth

---

## 1. Gambaran Umum

Project saat ini memakai:

- Next.js 16
- React 19
- Prisma
- Database MySQL lokal

Target deployment:

- Next.js deploy ke Vercel
- Database pindah ke Supabase PostgreSQL
- Prisma datasource diubah dari `mysql` ke `postgresql`

Catatan penting:

- Supabase memakai PostgreSQL, bukan MySQL.
- Migration MySQL lama tidak bisa langsung dipakai di PostgreSQL.
- Perlu migration baru khusus PostgreSQL.
- Versi MySQL lama tetap aman di branch `master`.
- Versi deploy Supabase sebaiknya pakai branch baru.

---

## 2. Branch Deployment

Buat branch baru:

```bash
git checkout -b deploy/vercel-supabase
```

Tujuan branch ini:

- Aman untuk migrasi PostgreSQL
- Tidak merusak versi MySQL di `master`
- Bisa deploy Vercel dari branch khusus

---

## 3. Buat Project Supabase

1. Buka Supabase:
   ```txt
   https://supabase.com
   ```
2. Login / register.
3. Klik `New Project`.
4. Isi:
   ```txt
   Project name: identiva
   Database password: simpan baik-baik
   Region: pilih yang dekat, misal Singapore
   ```
5. Tunggu project selesai dibuat.

---

## 4. Ambil Connection String Supabase

Masuk Supabase project:

```txt
Project Settings -> Database
```

Ambil 2 connection string.

### 4.1 DATABASE_URL untuk Runtime

Pakai connection string pooler / transaction pooler.

Contoh bentuk:

```env
DATABASE_URL="postgresql://postgres.xxxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

Dipakai oleh:

- Vercel runtime
- Next.js API routes
- Prisma Client saat app jalan

### 4.2 DIRECT_URL untuk Migration

Pakai direct connection.

Contoh bentuk:

```env
DIRECT_URL="postgresql://postgres:PASSWORD@db.xxxxxx.supabase.co:5432/postgres"
```

Dipakai oleh:

- Prisma migrate
- Prisma deploy migration

---

## 5. Update File `.env` Lokal

File `.env` tidak di-push ke GitHub karena sudah di `.gitignore`.

Isi lokal:

```env
DATABASE_URL="postgresql://...pooler..."
DIRECT_URL="postgresql://...direct..."
AUTH_SECRET="isi-random-panjang"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

Catatan:

- Jangan commit `.env`.
- Jangan share password database.
- `AUTH_SECRET` harus string panjang random.

Contoh generate secret:

```bash
openssl rand -base64 32
```

Kalau tidak ada `openssl`, pakai generator random online.

---

## 6. Update Prisma Datasource

File:

```txt
prisma/schema.prisma
```

Ubah datasource dari MySQL:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

Menjadi PostgreSQL:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 7. Reset Migration MySQL

Migration lama MySQL tidak kompatibel dengan PostgreSQL.

Strategi:

1. Simpan/arsip migration MySQL lama jika perlu.
2. Buat migration baru PostgreSQL.
3. Jangan pakai SQL MySQL lama di Supabase.

Struktur yang disarankan:

```txt
prisma/migrations/
└── 20260812_init_postgres/
    └── migration.sql
```

Migration ini dibuat dari Prisma schema terbaru.

---

## 8. Generate Prisma Client

Jalankan:

```bash
npx prisma generate
```

Kalau sukses, lanjut.

Kalau error, cek:

- `DATABASE_URL`
- `DIRECT_URL`
- provider sudah `postgresql`
- Supabase project aktif

---

## 9. Jalankan Migration ke Supabase

Untuk development branch Supabase:

```bash
npx prisma migrate dev --name init_postgres
```

Kalau production deploy nanti pakai:

```bash
npx prisma migrate deploy
```

Jangan pakai `migrate dev` di production.

---

## 10. Jalankan Seed

Setelah migration sukses:

```bash
npx prisma db seed
```

Seed membuat akun demo:

```txt
platform / mitra123
admin / mitra123
fatmawati / mitra123
sudirman / mitra123
kemang / mitra123
kelurahan / mitra123
sukasari / mitra123
coblong / mitra123
```

Kalau seed gagal, cek:

- urutan delete FK di `prisma/seed.ts`
- tabel `qr_token` sudah ada
- Prisma Client sudah generate

---

## 11. Test Lokal

Jalankan:

```bash
npm run dev
```

Buka:

```txt
http://localhost:3000/login
```

Tes login:

```txt
platform / mitra123
```

Lalu cek:

```txt
/dashboard/platform
/dashboard/lokaid
/dashboard/lokaid/program
```

---

## 12. Build Lokal

Sebelum deploy Vercel, pastikan build sukses:

```bash
npm run lint
npm run build
```

Ekspektasi:

```txt
lint exit 0
build sukses
```

Warning lint lama boleh ada selama exit code 0.

---

## 13. Update `package.json` untuk Vercel

Tambahkan scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed"
  }
}
```

Fungsi:

- `postinstall`: generate Prisma Client otomatis di Vercel
- `db:deploy`: deploy migration production
- `db:seed`: seed database

---

## 14. Push Branch ke GitHub

Commit perubahan:

```bash
git add .
git commit -m "chore: prepare Vercel Supabase deployment"
git push -u origin deploy/vercel-supabase
```

---

## 15. Buat Project Vercel

1. Buka:
   ```txt
   https://vercel.com
   ```
2. Login.
3. Klik `Add New Project`.
4. Import repo:
   ```txt
   jakkasigma/identiva
   ```
5. Pilih branch:
   ```txt
   deploy/vercel-supabase
   ```
6. Framework:
   ```txt
   Next.js
   ```
7. Root directory:
   - Jika repo GitHub isinya langsung project web, kosongkan.
   - Jika project web ada di folder `web`, set:
     ```txt
     web
     ```

Untuk repo sekarang, project root adalah folder web saat local. Pastikan struktur GitHub kamu sesuai.

---

## 16. Set Environment Variables di Vercel

Di Vercel:

```txt
Project Settings -> Environment Variables
```

Tambahkan:

```env
DATABASE_URL="postgresql://...pooler..."
DIRECT_URL="postgresql://...direct..."
AUTH_SECRET="isi-random-panjang"
AUTH_URL="https://nama-project.vercel.app"
NEXTAUTH_URL="https://nama-project.vercel.app"
```

Kalau pakai custom domain:

```env
AUTH_URL="https://domain-kamu.com"
NEXTAUTH_URL="https://domain-kamu.com"
```

---

## 17. Deploy Vercel

Klik `Deploy`.

Vercel akan menjalankan:

```bash
npm install
npm run build
```

Karena ada `postinstall`, Prisma generate jalan otomatis.

---

## 18. Jalankan Migration Production

Setelah deploy, migration harus dijalankan ke Supabase production.

Dari lokal dengan env Supabase:

```bash
npx prisma migrate deploy
```

Atau pakai script:

```bash
npm run db:deploy
```

---

## 19. Jalankan Seed Production

Setelah migration deploy:

```bash
npm run db:seed
```

Catatan:

- Seed akan reset data demo.
- Jangan jalankan seed di database production nyata kalau sudah ada data real.
- Untuk demo lomba, seed aman.

---

## 20. Test Website Vercel

Buka:

```txt
https://nama-project.vercel.app/login
```

Login:

```txt
platform / mitra123
```

Cek:

```txt
/dashboard/platform
```

Login LokaID:

```txt
sukasari / mitra123
```

Cek:

```txt
/dashboard/lokaid/program
```

---

## 21. Test QR Scan HP

1. Login:
   ```txt
   sukasari / mitra123
   ```
2. Buka:
   ```txt
   /dashboard/lokaid/program
   ```
3. Klik detail program.
4. Klik:
   ```txt
   Generate QR Scan HP
   ```
5. QR/link harus pakai domain Vercel:
   ```txt
   https://nama-project.vercel.app/scan/...
   ```
6. Scan QR pakai HP.
7. Di halaman scan:
   - Tes UID manual dulu
   - Lalu tes NFC HP jika tersedia

Contoh UID seed:

```txt
A1B2C3D4
E5F6G7H8
I9J0K1L2
M3N4O5P6
Q7R8S9T0
U1V2W3X4
```

---

## 22. Testing Web NFC

Syarat:

- Android
- Chrome
- NFC aktif
- URL HTTPS

Vercel sudah HTTPS, jadi lebih stabil daripada ngrok.

Langkah:

1. Buka `/scan/[token]` di Chrome Android.
2. Klik:
   ```txt
   Scan NFC HP
   ```
3. Tempel kartu ke belakang HP.
4. UID terbaca.
5. Klik:
   ```txt
   Cek KTP
   ```
6. Daftarkan peserta.

Fallback:

Kalau Web NFC tidak support, isi UID manual.

---

## 23. Troubleshooting

### Login balik localhost

Cek env Vercel:

```env
AUTH_URL
NEXTAUTH_URL
```

Harus domain Vercel, bukan localhost.

### Prisma Client error di Vercel

Pastikan ada:

```json
"postinstall": "prisma generate"
```

Lalu redeploy.

### Migration error

Gunakan:

```bash
npx prisma migrate deploy
```

Jangan `migrate dev` di production.

### Database timeout

Gunakan Supabase pooler untuk `DATABASE_URL`.

Contoh:

```env
DATABASE_URL="postgresql://...pooler...:6543/postgres?pgbouncer=true&connection_limit=1"
```

### Migration tidak jalan dengan pooler

Gunakan direct connection di `DIRECT_URL`.

```env
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### QR masih localhost

Pastikan deploy terbaru sudah jalan dan generate QR dari domain Vercel, bukan local.

### Tombol Generate QR tidak muncul

Cek:

1. Login `platform / mitra123`
2. Buka `/dashboard/platform/mitra`
3. Detail LokaID
4. Pastikan metode scan diizinkan:
   ```txt
   HP NFC
   ```

Lalu:

1. Login `kelurahan` atau `sukasari`
2. Buka `/dashboard/lokaid/wilayah`
3. Edit wilayah
4. Pastikan metode scan aktif:
   ```txt
   HP NFC
   ```

### Seed FK error `program_id`

Pastikan `prisma/seed.ts` menghapus QR token dulu:

```ts
await prisma.qRToken.deleteMany();
```

sebelum:

```ts
await prisma.programLokaID.deleteMany();
```

---

## 24. Checklist Deploy

Gunakan checklist ini:

```txt
[ ] Supabase project dibuat
[ ] DATABASE_URL pooler disiapkan
[ ] DIRECT_URL direct disiapkan
[ ] Prisma provider diubah ke postgresql
[ ] Migration PostgreSQL dibuat
[ ] npx prisma generate sukses
[ ] npx prisma migrate dev sukses
[ ] npx prisma db seed sukses
[ ] npm run lint sukses
[ ] npm run build sukses
[ ] Branch deploy/vercel-supabase push ke GitHub
[ ] Vercel project dibuat
[ ] Env Vercel diisi
[ ] Vercel deploy sukses
[ ] npx prisma migrate deploy sukses
[ ] npx prisma db seed sukses
[ ] Login platform sukses
[ ] Login sukasari sukses
[ ] Generate QR sukses
[ ] /scan/[token] bisa dibuka di HP
[ ] UID manual bisa daftar peserta
[ ] NFC HP dites
```

---

## 25. Catatan Produksi

Untuk demo/lomba:

- Seed demo boleh dipakai
- Password `mitra123` boleh sementara
- Domain `.vercel.app` cukup

Untuk production nyata:

- Ganti semua password
- Jangan jalankan seed reset data
- Tambah audit log
- Tambah rate limit QR
- Tambah revoke QR token
- Tambah backup DB
