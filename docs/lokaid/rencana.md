# RENCANA IMPLEMENTASI — LOKAID

Dokumen ini adalah rencana teknis implementasi mitra **LokaID** di dalam platform Identiva. Referensi konsep produk ada di `ide.md`.

---

## ITERASI V1 — MVP (Program + Peserta + Aktivitas Dasar)

> **Status: ✅ SELESAI** — Build production sukses, 0 TypeScript error. Migration + seed berhasil.

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Schema Prisma — `ProgramLokaID`, `PesertaLokaID`, `AktivitasLokaID`, `tipeMitra` | ✅ Selesai |
| 2 | Migration init + reset DB | ✅ Selesai |
| 3 | Seed — Kelurahan Sukamakmur, 3 program, peserta, aktivitas | ✅ Selesai |
| 4 | API `GET/POST /api/lokaid/program` | ✅ Selesai |
| 5 | API `GET/POST /api/lokaid/peserta` | ✅ Selesai |
| 6 | API `POST /api/lokaid/checkin` | ✅ Selesai |
| 7 | API `POST /api/lokaid/distribusi` | ✅ Selesai |
| 8 | API `GET /api/lokaid/aktivitas` + export CSV | ✅ Selesai |
| 9 | `DashboardNav` — menu LokaID | ✅ Selesai |
| 10 | `dashboard/layout.tsx` — deteksi `tipeMitra` | ✅ Selesai |
| 11 | `dashboard/page.tsx` — ringkasan LokaID | ✅ Selesai |
| 12 | `dashboard/lokaid/program/page.tsx` | ✅ Selesai |
| 13 | `components/lokaid/ProgramLokaIDForm.tsx` | ✅ Selesai |
| 14 | `dashboard/lokaid/peserta/page.tsx` | ✅ Selesai |
| 15 | `components/lokaid/PesertaLokaIDForm.tsx` | ✅ Selesai |
| 16 | `dashboard/lokaid/aktivitas/page.tsx` | ✅ Selesai |
| 17 | Build & verifikasi | ✅ Selesai |

**Keterbatasan V1:** form buat program masih flat (1 halaman, 1 jenis aktivitas), belum ada wizard, belum ada multi-aktivitas per program, belum ada status peserta per program.

---

## ITERASI V2 — PROGRAM WIZARD + MULTI-AKTIVITAS + STATUS PESERTA

> **Status: ✅ SELESAI** — Build production sukses, 0 TypeScript error. Migration + seed berhasil.

### Latar Belakang

V1 hanya bisa buat program dengan satu jenis aktivitas (distribusi/checkin/pendataan). Faktanya setiap program punya **cara kerja berbeda** tergantung tujuannya:

- **Bansos** → ceklis penerimaan: sudah dapat atau belum
- **Posyandu** → absensi kehadiran: hadir atau tidak hadir per sesi
- **Peminjaman** → status pinjam: tersedia / dipinjam / dikembalikan
- **Pendataan** → kelengkapan data: belum / sedang / lengkap / terverifikasi

V2 menyelesaikan ini dengan dua perubahan utama:
1. **Program Wizard** — form multi-step berbasis pertanyaan, bukan form flat
2. **Multi-aktivitas** — satu program bisa punya kombinasi aktivitas, dashboard menyesuaikan tampilan

---

### A. Peta Tujuan → Aktivitas → Cara Kerja

#### 1. Memberikan Bantuan
*Contoh: Bansos, subsidi sembako, beasiswa, bantuan peralatan*

| | |
|---|---|
| Aktivitas default | Distribusi + (opsional) Verifikasi |
| Cara kerja | Ceklis penerimaan per peserta |
| Status peserta | Terdaftar → Terverifikasi → **Sudah Terima** → Selesai |
| Kolom tabel | NIK · Nama · Status Penerimaan · Aksi [Catat Distribusi] |
| Kuota | 1x per periode (default), bisa diubah |
| Pertanyaan wizard tambahan | Perlu verifikasi kelayakan dulu? / Ada syarat penerima? (usia, wilayah) |

#### 2. Mengadakan Kegiatan
*Contoh: Posyandu, seminar, pelatihan, kerja bakti, lomba*

| | |
|---|---|
| Aktivitas default | Check-in + (opsional) Pendataan |
| Cara kerja | Absensi kehadiran per sesi |
| Status peserta | Terdaftar → **Hadir / Tidak Hadir** (per sesi/periode) |
| Kolom tabel | NIK · Nama · Hadir Bulan Ini · Total Hadir · Aksi [Absen] |
| Kuota | Bisa 1x per periode atau tidak terbatas |
| Pertanyaan wizard tambahan | Pesertanya siapa? (warga / anak via wali) / Perlu catat data saat kegiatan? |

#### 3. Mengumpulkan Data
*Contoh: Pendataan UMKM, sensus warga, survei, pendataan fasilitas*

| | |
|---|---|
| Aktivitas default | Pendataan + (opsional) Verifikasi data |
| Cara kerja | Kelengkapan pengisian form per peserta |
| Status peserta | Belum Didata → Sedang → **Data Lengkap** → Terverifikasi |
| Kolom tabel | NIK · Nama · Status Data · Terakhir Update · Aksi [Isi Data] |
| Kuota | Tidak ada (data bisa diupdate) |
| Pertanyaan wizard tambahan | Data apa yang dikumpulkan? (→ Form Builder) / Data bisa diupdate setelah diisi? |

#### 4. Meminjamkan Barang / Fasilitas
*Contoh: Peminjaman aula, alat olahraga, buku perpustakaan*

| | |
|---|---|
| Aktivitas default | Pengajuan → Persetujuan → Peminjaman → Pengembalian |
| Cara kerja | Status item: tersedia / diajukan / dipinjam / dikembalikan |
| Status peserta | Mengajukan → Disetujui/Ditolak → **Meminjam** → Dikembalikan |
| Kolom tabel | NIK · Nama · Item · Status · Mulai · Batas · Aksi |
| Kuota | Per item (berapa unit tersedia) |
| Pertanyaan wizard tambahan | Apa yang dipinjamkan? / Perlu persetujuan? / Ada batas durasi? |

#### 5. Mendaftarkan Warga
*Contoh: Daftar anggota RT, daftar peserta vaksin, daftar program baru*

| | |
|---|---|
| Aktivitas default | Pendaftaran + (opsional) Verifikasi |
| Cara kerja | Status daftar: menunggu / approved / aktif / ditolak |
| Status peserta | Mengajukan → **Menunggu Approval** → Aktif / Ditolak |
| Kolom tabel | NIK · Nama · Tanggal Daftar · Status · Aksi [Approve/Tolak] |
| Kuota | Bisa ada kuota maksimal pendaftar |
| Pertanyaan wizard tambahan | Terbuka untuk umum atau by invitation? / Langsung aktif atau menunggu? |

---

### B. Semua Jenis Aktivitas

| Aktivitas | Kode | Dipakai di tujuan |
|---|---|---|
| Check-in / Kehadiran | `checkin` | Kegiatan |
| Distribusi bantuan | `distribusi` | Bantuan |
| Verifikasi kelayakan | `verifikasi` | Bantuan, Pendaftaran |
| Pendataan (isi form) | `pendataan` | Kegiatan, Pengumpulan data |
| Penilaian / Catatan | `penilaian` | Kegiatan |
| Pengajuan pinjam | `pengajuan` | Peminjaman |
| Persetujuan | `persetujuan` | Peminjaman, Pendaftaran |
| Peminjaman | `peminjaman` | Peminjaman |
| Pengembalian | `pengembalian` | Peminjaman |
| Pendaftaran mandiri | `pendaftaran` | Pendaftaran |
| Aktivasi anggota | `aktivasi` | Pendaftaran |

Satu program bisa punya **kombinasi** — misalnya Posyandu pakai `checkin` + `pendataan` sekaligus.

---

### C. Perubahan Schema Database

**Tabel baru `program_aktivitas`** — agar satu program bisa punya banyak aktivitas:

```prisma
model ProgramAktivitasLokaID {
  id        Int    @id @default(autoincrement())
  programId Int    @map("program_id")
  jenis     String @db.VarChar(30)
  urutan    Int    @default(0)  // urutan dalam workflow

  program ProgramLokaID @relation(fields: [programId], references: [id])

  @@unique([programId, jenis])
  @@map("program_aktivitas_lokaid")
}
```

**Tabel baru `status_peserta_lokaid`** — status per peserta per periode (bukan hanya log aktivitas):

```prisma
model StatusPesertaLokaID {
  id        Int      @id @default(autoincrement())
  pesertaId Int      @map("peserta_id")
  programId Int      @map("program_id")
  status    String   @db.VarChar(30)   // tergantung jenis program
  periode   String   @db.VarChar(10)   // "2026-08" / "2026-W32"
  updatedAt DateTime @updatedAt        @map("updated_at")

  peserta PesertaLokaID @relation(fields: [pesertaId], references: [id])
  program ProgramLokaID @relation(fields: [programId], references: [id])

  @@unique([pesertaId, programId, periode])
  @@map("status_peserta_lokaid")
}
```

**Update `ProgramLokaID`** — hapus field `jenis` (pindah ke `program_aktivitas_lokaid`), tambah `tujuan`:

```prisma
tujuan  String  @db.VarChar(30)  // "bantuan" | "kegiatan" | "pendataan" | "peminjaman" | "pendaftaran"
```

---

### D. Program Wizard — Alur & Pertanyaan

Wizard adalah React client component dengan state machine. Tampilan:

```
┌─────────────────────────────────────────────┐
│  ● ─── ○ ─── ○ ─── ○                       │
│  Info  Tujuan Aktivitas Preview             │
└─────────────────────────────────────────────┘
```

**Step 1 — Info Dasar** (selalu tampil)
- Nama program *
- Deskripsi (opsional)
- Tanggal mulai / selesai (opsional)

**Step 2 — Tujuan & Sasaran** (branching dimulai)
- Tujuan: pilih salah satu dari 5 tujuan di atas
- Sasaran: warga / anak (jika anak → muncul pertanyaan ada wali?)
- Pertanyaan khusus per tujuan (lihat bagian A)

**Step 3 — Aktivitas & Konfigurasi** (berdasarkan tujuan)
- Multi-select aktivitas yang disarankan (bisa diedit)
- Kuota per peserta per periode (opsional, null = tidak terbatas)
- Perlu verifikasi peserta? (toggle)
- Metode identifikasi: Citizen ID / Manual

**Step 4 — Preview & Konfirmasi**
- Tampilkan ringkasan semua konfigurasi
- Visualisasi workflow (urutan aktivitas)
- Tombol: Kembali & Edit | Buat Program

---

### E. Dashboard Per Program — Tampilan Adaptif

Setelah program dibuat, halaman detail program menampilkan UI yang berbeda berdasarkan `tujuan` + aktivitas yang dimiliki:

**Program Bantuan:**
```
Sudah Menerima : 187 / 250 (75%) ████████░░
Belum Menerima : 63

[Tabel] NIK · Nama · Status · Aksi [Catat Distribusi]
```

**Program Kegiatan (Posyandu):**
```
Hadir Bulan Ini : 71 / 87 (82%) █████████░
Tidak Hadir     : 16

[Tabel] NIK · Nama · Hadir Bulan Ini · Total Hadir · Aksi [Absen]
```

**Program Peminjaman:**
```
Tersedia : 3 unit
Dipinjam : 2 unit

[Tabel] NIK · Nama · Item · Status · Batas Waktu · Aksi
```

**Program Pendataan:**
```
Data Lengkap : 34 / 50 (68%) ███████░░░
Belum Lengkap: 16

[Tabel] NIK · Nama · Status Data · Aksi [Isi Data]
```

---

### F. Perubahan API

**`POST /api/lokaid/program`** — tambah field `tujuan`, aktivitas sebagai array:

```json
{
  "nama": "Bantuan Sembako Agustus",
  "tujuan": "bantuan",
  "aktivitas": ["verifikasi", "distribusi"],
  "kuotaTotal": 1,
  "periodeReset": "bulanan",
  "perluVerifikasi": true
}
```

**`GET /api/lokaid/program/:id/peserta`** — respons sertakan status peserta periode ini:

```json
{
  "peserta": [
    {
      "id": 1,
      "nama": "Budi Santoso",
      "nik": "...",
      "statusPeriodeIni": "sudah_terima",  // atau "belum" / "hadir" / dll
      "totalAktivitas": 3
    }
  ]
}
```

**Endpoint baru per jenis aktivitas:**
- `POST /api/lokaid/verifikasi` — approve/tolak peserta
- `POST /api/lokaid/pendataan` — simpan data form peserta
- `POST /api/lokaid/pengajuan` — warga ajukan pinjam
- `POST /api/lokaid/persetujuan` — admin approve/tolak pengajuan
- `POST /api/lokaid/pengembalian` — catat barang dikembalikan

---

### G. Urutan Pengerjaan V2

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Schema — tambah `ProgramAktivitasLokaID`, `StatusPesertaLokaID`, update `ProgramLokaID` | ✅ Selesai |
| 2 | Migration + seed update | ✅ Selesai |
| 3 | API `POST /api/lokaid/program` — update terima array aktivitas | ✅ Selesai |
| 4 | API `GET /api/lokaid/program/:id/peserta` — sertakan status periode | ✅ Selesai |
| 5 | API `POST /api/lokaid/verifikasi` | ✅ Selesai |
| 6 | API `POST /api/lokaid/pendataan` | ✅ Selesai |
| 7 | API `POST /api/lokaid/pengajuan` + `persetujuan` + `pengembalian` | ✅ Selesai |
| 8 | `components/lokaid/ProgramWizard.tsx` — wizard 4 step dengan branching | ✅ Selesai |
| 9 | `dashboard/lokaid/program/[id]/page.tsx` — halaman detail program adaptif | ✅ Selesai |
| 10 | Komponen tampilan per tujuan: `BantuanView`, `KegiatanView`, `PeminjamanView`, `PendataanView` | ✅ Selesai |
| 11 | Update seed — contoh program untuk semua 5 tujuan | ✅ Selesai |
| 12 | Build & verifikasi | ✅ Selesai |

---

### H. Keputusan Desain V2

1. **`tujuan` di `ProgramLokaID`** menentukan template tampilan dashboard program — bukan hardcode, tapi switch berdasarkan value.
2. **`program_aktivitas_lokaid`** menyimpan kombinasi aktivitas per program — satu program bisa `checkin` + `pendataan`.
3. **`status_peserta_lokaid`** menyimpan status ringkasan per (peserta + program + periode) — beda dari `aktivitas_lokaid` yang menyimpan log tiap kejadian.
4. **Wizard bukan ganti form** — wizard dipakai saat buat program baru. Edit program tetap pakai form biasa (atau wizard yang bisa di-skip ke step mana saja).
5. **Dashboard program adaptif** — satu halaman `/dashboard/lokaid/program/[id]` yang render komponen berbeda berdasarkan `tujuan` program.
6. **Form Builder ditunda ke V3** — data tambahan per peserta (field dinamis) tidak masuk V2 dulu agar scope tetap manageable.

---

## BAGIAN REFERENSI — V1 DETAIL

### Schema V1 (Aktif)

Tabel: `program_lokaid`, `peserta_lokaid`, `aktivitas_lokaid`. Field `tipeMitra` di `Mitra`.

### Login Demo V1

```
kelurahan / mitra123   → dashboard LokaID
admin / mitra123       → dashboard SPBU Pertamina
fatmawati / mitra123   → dashboard cabang Fatmawati
```

### Token IoT LokaID

```
tok_kelurahan_skmkr_2026_k1e2l3u4
```

API check-in: `POST /api/lokaid/checkin`
API distribusi: `POST /api/lokaid/distribusi`

---

## ITERASI V3 — FORM BUILDER + RELASI WALI-ANAK (FASE LANJUTAN)

> **Status: ✅ SELESAI** — Build production sukses, 0 TypeScript error. Migration + seed berhasil.

### Latar Belakang
untu
V2 sudah bisa buat program dengan tujuan berbeda dan multi-aktivitas. V3 menambahkan dua kapabilitas utama yang membuat LokaID benar-benar **dinamis**:
1. **Form Builder** — admin definisikan field tambahan per program (BB/TB untuk Posyandu, nama usaha untuk UMKM, dll)
2. **Relasi wali-anak** — subjek program bisa berupa anak yang diwakili wali (Posyandu balita, dll)

### Keputusan Desain V3

1. **Field yang didukung**: `text`, `number`, `date`, `dropdown`, `radio`, `checkbox` — upload file/image ditunda
2. **Form Builder masuk wizard sebagai Step 4 baru** — wizard jadi 5 step: Info → Tujuan → Aktivitas → **Data** → Preview
3. **Relasi wali-anak**: satu anak punya satu wali per program
4. **Form Builder opsional** — program tidak wajib punya field tambahan
5. **Sasaran program ditentukan di Step 2** — jika sasaran = "anak", muncul pertanyaan tentang wali

---

### A. Schema Baru

**Tabel `program_field_lokaid`** — definisi field tambahan per program:
```prisma
model ProgramFieldLokaID {
  id        Int     @id @default(autoincrement())
  programId Int     @map("program_id")
  nama      String  @db.VarChar(100)
  kode      String  @db.VarChar(50)
  tipe      String  @db.VarChar(20)   // "text"|"number"|"date"|"dropdown"|"radio"|"checkbox"
  wajib     Boolean @default(false)
  urutan    Int     @default(0)
  opsi      String? @db.Text          // JSON array untuk dropdown/radio/checkbox

  program ProgramLokaID             @relation(fields: [programId], references: [id])
  nilai   PesertaFieldValueLokaID[]

  @@unique([programId, kode])
  @@map("program_field_lokaid")
}
```

**Tabel `peserta_field_value_lokaid`** — nilai field per peserta:
```prisma
model PesertaFieldValueLokaID {
  id        Int      @id @default(autoincrement())
  pesertaId Int      @map("peserta_id")
  fieldId   Int      @map("field_id")
  nilai     String?  @db.Text
  updatedAt DateTime @updatedAt @map("updated_at")

  peserta PesertaLokaID      @relation(fields: [pesertaId], references: [id])
  field   ProgramFieldLokaID @relation(fields: [fieldId], references: [id])

  @@unique([pesertaId, fieldId])
  @@map("peserta_field_value_lokaid")
}
```

**Tabel `dependent_lokaid`** — data anak yang diwakili wali:
```prisma
model DependentLokaID {
  id           Int       @id @default(autoincrement())
  waliId       Int       @map("wali_id")
  nama         String    @db.VarChar(100)
  tanggalLahir DateTime? @map("tanggal_lahir")
  jenisKelamin String?   @db.VarChar(10)   // "L" | "P"
  keterangan   String?   @db.VarChar(255)

  wali PesertaLokaID @relation(fields: [waliId], references: [id])

  createdAt DateTime @default(now()) @map("created_at")

  @@map("dependent_lokaid")
}
```

**Update `ProgramLokaID`** — tambah `sasaran`:
```prisma
sasaran String @default("warga") @db.VarChar(20) // "warga" | "anak"
```

---

### B. Wizard 5 Step

```
● ─── ○ ─── ○ ─── ○ ─── ○
Info  Tujuan Aktivitas Data  Preview
```

**Step 4 — Data Tambahan (baru)**
- Toggle: "Program butuh data tambahan dari peserta?"
- Jika Ya → Form Builder inline:
  - List field yang sudah ditambahkan (bisa reorder, hapus)
  - Tombol "+ Tambah Field" → nama, tipe, wajib/opsional, opsi (jika dropdown/radio/checkbox)
- Jika sasaran = "anak" → field dasar anak sudah pre-filled: nama, tanggal lahir, jenis kelamin

---

### C. Urutan Pengerjaan V3

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Schema — `ProgramFieldLokaID`, `PesertaFieldValueLokaID`, `DependentLokaID`, update `ProgramLokaID` | ✅ Selesai |
| 2 | Migration + update seed (Posyandu sasaran anak + field BB/TB) | ✅ Selesai |
| 3 | API `POST /api/lokaid/program` — tambah `sasaran` + `fields` | ✅ Selesai |
| 4 | API `POST /api/lokaid/peserta/[id]/data` — simpan nilai field | ✅ Selesai |
| 5 | API `POST /api/lokaid/dependent` + `GET /api/lokaid/program/[id]/dependent` | ✅ Selesai |
| 6 | `ProgramWizard.tsx` — tambah Step 4 Form Builder + update Step 2 sasaran | ✅ Selesai |
| 7 | Komponen `FormBuilderStep.tsx` — UI tambah/edit/hapus field | ✅ Selesai |
| 8 | Komponen `DynamicDataForm.tsx` — form render dinamis dari definisi field | ✅ Selesai |
| 9 | Update `KegiatanView` — jika sasaran=anak, tampil grouped wali-anak | ✅ Selesai |
| 10 | Update halaman detail program — tombol "Isi Data" + dialog form dinamis | ✅ Selesai |
| 11 | Update seed Posyandu — tambah dependent (anak-anak wali) | ✅ Selesai |
| 12 | Build & verifikasi | ✅ Selesai |

---

## ITERASI V4 — HIERARKI WILAYAH (MULTI-KECAMATAN)

> **Status: ✅ SELESAI** — Build production sukses, 0 TypeScript error. Migration + seed berhasil.

### Latar Belakang

V1–V3 mengasumsikan LokaID dipakai oleh satu entitas tunggal (satu kelurahan/komunitas). V4 menambahkan konsep **Wilayah** agar satu mitra LokaID bisa mengelola banyak kecamatan/unit sekaligus — mirip konsep Cabang di SPBU, tapi dengan nama dan konteks yang berbeda.

**Prinsip utama:**
- **Penduduk tersimpan terpusat di Identiva** — satu NIK = satu data, tidak duplikasi per wilayah
- **Program dibuat per wilayah** — admin kecamatan buat programnya sendiri
- **Admin induk LokaID hanya memantau** — lihat rekap lintas wilayah, tidak operasional
- **Admin wilayah mengontrol** — kelola program + peserta di wilayahnya sendiri

### Hierarki Akses

```
LokaID Induk (admin_mitra)
    └── Pantau semua wilayah + rekap agregat
    └── Buat wilayah baru

Wilayah / Kecamatan (admin_cabang)
    └── Buat & kelola program sendiri
    └── Daftarkan peserta (ambil dari Penduduk pusat)
    └── Catat aktivitas

Identiva (pusat data)
    └── Tabel Penduduk — satu NIK, satu record, dipakai semua wilayah
```

### Alur Data

```
Kecamatan A scan KTP warga baru
    ↓
Cek tabel Penduduk (pusat Identiva)
    ↓ ada → ambil data langsung
    ↓ belum ada → input + simpan ke Penduduk pusat
    ↓
Daftarkan ke program kecamatan A (PesertaLokaID.cabangId = kecamatan A)

Kecamatan B butuh warga yang sama
    ↓
Cek tabel Penduduk → sudah ada, tidak perlu input ulang
    ↓
Daftarkan ke program kecamatan B
```

### Perubahan Schema

**Update `ProgramLokaID`** — tambah `cabangId`:
```prisma
cabangId Int? @map("cabang_id")  // null = program induk (semua wilayah), ada value = program wilayah
cabang   Cabang? @relation(fields: [cabangId], references: [id])
```

**Update `PesertaLokaID`** — tambah `cabangId`:
```prisma
cabangId Int? @map("cabang_id")  // wilayah mana yang mendaftarkan peserta ini
cabang   Cabang? @relation(fields: [cabangId], references: [id])
```

Tabel `Cabang` yang sudah ada **dipakai ulang** — tidak perlu tabel baru. Perbedaan hanya di label UI: SPBU → "Cabang", LokaID → "Wilayah".

### UI Baru

**Dashboard LokaID Induk — tambah menu "Wilayah":**
- List semua wilayah (nama, kode, admin, jumlah program, jumlah peserta)
- Tombol "Tambah Wilayah" → form (nama, kode, token API)
- Klik wilayah → lihat rekap program + aktivitas wilayah itu

**Dashboard LokaID Wilayah (admin_cabang):**
- Sama seperti sekarang tapi semua data difilter `cabangId = wilayah saya`
- Program yang tampil = program wilayah ini saja
- Tombol buat program → otomatis assign ke wilayah ini

**Filter wilayah di halaman induk:**
- Halaman Program → tambah dropdown filter wilayah
- Halaman Peserta → tambah dropdown filter wilayah
- Halaman Aktivitas → tambah dropdown filter wilayah

### Urutan Pengerjaan V4

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Schema — tambah `cabangId` ke `ProgramLokaID` + `PesertaLokaID` | ✅ Selesai |
| 2 | Migration + seed (2 wilayah contoh, program per wilayah) | ✅ Selesai |
| 3 | API `POST /api/lokaid/program` — handle `cabangId` | ✅ Selesai |
| 4 | API `POST /api/lokaid/peserta` — handle `cabangId` | ✅ Selesai |
| 5 | Halaman `dashboard/lokaid/wilayah/page.tsx` — list + buat wilayah | ✅ Selesai |
| 6 | Halaman `dashboard/lokaid/wilayah/[id]/page.tsx` — detail rekap per wilayah | ✅ Selesai |
| 7 | Update `DashboardNav` — tambah menu "Wilayah" untuk admin induk LokaID | ✅ Selesai |
| 8 | Update dashboard LokaID wilayah (`admin_cabang`) — filter semua data per wilayah | ✅ Selesai |
| 9 | Update halaman program, peserta, aktivitas — tambah filter wilayah untuk admin induk | ✅ Selesai |
| 10 | Build & verifikasi | ✅ Selesai |

### Keputusan Desain V4

1. **Tabel `Cabang` dipakai ulang** — tidak buat tabel baru `Wilayah`. Label di UI saja yang beda.
2. **`ProgramLokaID.cabangId = null`** = program induk, berlaku untuk semua wilayah (admin induk yang buat). Admin wilayah tidak bisa lihat/edit program induk, hanya lihat sebagai referensi.
3. **`ProgramLokaID.cabangId = X`** = program milik wilayah X. Hanya admin wilayah X dan admin induk yang bisa lihat.
4. **Penduduk tetap terpusat** — `PesertaLokaID` hanya referensi ke `Penduduk`, bukan duplikasi.
5. **Token API per wilayah** — setiap wilayah punya token sendiri untuk perangkat IoT di lapangan.

---

## ITERASI V5 — KELOLA AKUN OPERATOR WILAYAH

> **Status: ✅ SELESAI** — Build production sukses, 0 TypeScript error.

### Latar Belakang

Admin induk LokaID perlu bisa mengelola akun login operator wilayah tanpa harus masuk ke database langsung. Fitur ini ditambahkan di halaman detail wilayah `/dashboard/lokaid/wilayah/[id]`.

### Fitur

**Section "Akun Operator" di halaman detail wilayah:**
- Tampilkan username operator aktif
- Tombol **Reset Password** — admin induk bisa set password baru untuk operator
- Tombol **Nonaktifkan / Aktifkan** — blokir akses tanpa hapus akun
- Tombol **+ Buat Akun** — kalau wilayah belum punya operator

### Urutan Pengerjaan V5

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | API `PATCH /api/lokaid/wilayah/[id]/operator` — reset password + toggle aktif | ✅ Selesai |
| 2 | API `POST /api/lokaid/wilayah/[id]/operator` — buat akun baru | ✅ Selesai |
| 3 | Komponen `OperatorWilayahPanel.tsx` — UI kelola akun | ✅ Selesai |
| 4 | Update halaman `dashboard/lokaid/wilayah/[id]/page.tsx` — tambah section operator | ✅ Selesai |
| 5 | Build & verifikasi | ✅ Selesai |

---

## ITERASI V6 — PENDAFTARAN PESERTA CERDAS + FIX WILAYAH

### Latar Belakang

1. **Bug wilayah:** `POST /api/lokaid/peserta` tidak menyimpan `cabangId` → peserta yang didaftarkan admin kecamatan (`admin_cabang`) tidak tampil di daftar/statistik wilayahnya.
2. **Alur pendaftaran belum cerdas:** tidak bisa mengecek apakah KTP sudah ada di `Penduduk` pusat → petugas harus isi ulang nama/alamat padahal data sudah tersimpan.
3. **Scan Alat B belum tersambung** ke halaman peserta LokaID (alur pendataan via scan belum lengkap).

### Perubahan

1. **Fix `POST /api/lokaid/peserta`** — simpan `cabangId` dari session `admin_cabang`; terima `penduduk_id` (mode KTP sudah ada → skip create Penduduk).
2. **API baru `GET /api/lokaid/cari-penduduk`** — cek KTP by `uid` dan/atau `nik`, deteksi konflik, dan status "sudah jadi peserta program" (`program_id` opsional).
3. **`PesertaLokaIDForm` dua mode:**
   - **KTP baru** → form isi lengkap (NIK, UID, Nama, Alamat, Program).
   - **KTP sudah ada** → kartu KTP read-only (dari pusat) + pilih program + tombol "Daftarkan ke Program", tanpa isi ulang.
4. **Konflik NIK vs UID** — tampilkan peringatan data tersimpan vs input + tombol konfirmasi ("Gunakan data tersimpan" / batal).
5. **Duplikat peserta** di program yang sama → info "sudah terdaftar", tombol nonaktif (409 tetap sebagai jaring pengaman).
6. **Halaman peserta** — tab "Scan Terbaru" (panel per scan, UID + scanId diteruskan ke form).

### Urutan Pengerjaan V6

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Fix `api/lokaid/peserta` — set `cabangId`, terima `penduduk_id` | ✅ Selesai |
| 2 | API baru `GET /api/lokaid/cari-penduduk` | ✅ Selesai |
| 3 | `PesertaLokaIDForm` — dua mode + konflik + duplikat | ✅ Selesai |
| 4 | Halaman peserta — tab "Scan Terbaru" | ✅ Selesai |
| 5 | Build & verifikasi | ✅ Selesai |

---

## ITERASI V7 - DASHBOARD ADMIN PLATFORM + SISTEM PREFERENSI SCAN

> **Status: Selesai** - Build production sukses, lint exit 0 (warning lama).

### Latar Belakang

Identiva adalah **platform multi-tenant** yang mendukung berbagai jenis mitra (SPBU, LokaID, dll). Setiap mitra punya kebutuhan operasional berbeda, terutama dalam **metode scan kartu RFID**.

- **SPBU**: butuh konsistensi dan keamanan, wajib pakai alat ESP32 dedicated
- **LokaID**: butuh fleksibilitas lapangan, bisa alat ESP32 atau HP NFC (mobile)
- **Mitra kecil**: tidak punya hardware, input manual saja

**Masalah yang diselesaikan:**
- Tidak ada kontrol pusat untuk atur metode scan per mitra
- Semua mitra bisa akses semua fitur scan (tidak ada enforcement)
- Belum ada dashboard untuk admin platform kelola mitra

**Solusi V7:** Dashboard admin platform + sistem 2-level preference:
1. **Platform ke Mitra**: Admin platform set metode apa yang diizinkan
2. **Mitra ke Cabang**: Admin mitra pilih metode mana yang aktif per cabang

### Konsep Sistem Preferensi Scan

| Metode | Hardware | Use Case | Auth |
|---|---|---|---|
| `alat_esp32` | RFID reader + ESP32 | Lokasi tetap, konsisten | Token cabang |
| `hp_nfc` | Smartphone NFC | Mobile, lapangan | QR token / session |
| `manual` | Keyboard | Fallback, tanpa hardware | Session login |

### Default per Tipe Mitra

| Tipe Mitra | `metodeScanDiizinkan` | Alasan |
|---|---|---|
| SPBU (subsidi) | `["alat_esp32"]` | Transaksi BBM butuh konsistensi dan audit |
| LokaID | `["alat_esp32", "hp_nfc"]` | Fieldwork fleksibel |

### Perubahan Teknis V7

**Database:**
- `Mitra.metodeScanDiizinkan Json @map("metode_scan_diizinkan")`
- `Cabang.metodeScanAktif String @default("manual") @map("metode_scan_aktif")`
- User seed `platform / mitra123` dengan role `admin_platform`

**API:**
- `GET /api/platform/mitra`
- `GET /api/platform/mitra/[id]`
- `PATCH /api/platform/mitra/[id]`
- `GET /api/platform/stats`
- `validateScanMethod()` di `src/lib/scan-guard.ts`
- Guard `POST /api/uid-scan` untuk metode `alat_esp32`

**Frontend:**
- `/dashboard/platform`
- `/dashboard/platform/mitra`
- `/dashboard/platform/mitra/[id]`
- `MitraTable`
- `MitraScanPreference`
- Update `DashboardNav` untuk role `admin_platform`
- Update `dashboard/layout.tsx` supaya `admin_platform` bisa masuk tanpa `mitraId`
- Update `CabangForm` dan `WilayahLokaIDForm` untuk pilih metode scan aktif
- Conditional UI tab Scan Terbaru berdasarkan `metodeScanAktif`

### Urutan Pengerjaan V7

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Schema - add `metodeScanDiizinkan`, `metodeScanAktif` | Selesai |
| 2 | Migration + data migration (set defaults by tipeMitra) | Selesai |
| 3 | Seed - user platform + update mitra/cabang defaults | Selesai |
| 4 | `lib/scan-guard.ts` - validateScanMethod middleware | Selesai |
| 5 | API guards - update uid-scan, prepare for V8 | Selesai |
| 6 | API platform - CRUD mitra, stats | Selesai |
| 7 | Dashboard platform - layout, nav, halaman ringkasan | Selesai |
| 8 | Dashboard platform - halaman mitra (list + detail + edit) | Selesai |
| 9 | Komponen - MitraTable, MitraScanPreference | Selesai |
| 10 | Update dashboard mitra - conditional UI by metodeScanAktif | Selesai |
| 11 | Update CabangForm/WilayahForm - dropdown edit metodeScanAktif | Selesai |
| 12 | Testing - build + lint | Selesai |
| 13 | Build & verifikasi | Selesai |

### Keputusan Desain V7

1. 2-level preference: platform control, mitra flexibility
2. Default auto-enable: SPBU = alat ESP32, LokaID = HP NFC
3. Strict validation: API reject 403 jika metode tidak sesuai preferensi
4. Admin platform scope minimalis: fokus edit preferensi scan; approve mitra ditunda
5. User platform tidak terikat mitra: `mitraId = null`
6. Existing workflow tidak break

### Akun Demo V7

| Username | Password | Role | Akses |
|---|---|---|---|
| `platform` | `mitra123` | admin_platform | Dashboard platform, kelola semua mitra |

---

## ITERASI V8 - PENDATAAN MOBILE (SCAN HP VIA QR CODE)

> **Status: Belum Dimulai** (tunggu V7 selesai)

### Latar Belakang

Alat ESP32 untuk scan RFID masih dalam tahap development hardware. Petugas lapangan LokaID butuh solusi fleksibel untuk pendataan peserta di lokasi kegiatan tanpa hardware tambahan.

**Solusi:** Smartphone dengan NFC, scan kartu via browser (Web NFC API).

### Konsep QR Code sebagai Entry Point

```
Admin Wilayah di Dashboard
  -> Buka program detail
  -> Tombol Generate QR untuk Scan
  -> QR code + link + tombol cetak/copy
  -> Cetak QR, tempel di lokasi kegiatan

Petugas Lapangan
  -> Scan QR pakai kamera HP
  -> Chrome buka /scan/[token]
  -> Tap kartu warga ke HP (NFC)
  -> UID terbaca
  -> Auto-cek KTP di Identiva:
      - KTP belum ada: form isi lengkap
      - KTP sudah ada: kartu info + tombol Daftarkan
  -> Peserta terdaftar (cabangId dari QR token)
```

### Perubahan Teknis V8

**Database:** tabel baru `qr_token`

**API baru:**
- `POST /api/lokaid/program/[id]/qr`
- `GET /api/lokaid/qr/[token]/validate`
- `POST /api/lokaid/qr/[token]/scan-register`

**Frontend baru:**
- `/scan/[token]`
- `QRGenerator`
- `NFCScanUI`
- `ScanResult`
- `src/lib/nfc.ts`
- `src/lib/qr.ts`

### Urutan Pengerjaan V8

| # | Langkah | Status |
| :--- | :--- | :--- |
| 1 | Schema - tabel `qr_token` + migration | Belum |
| 2 | API - POST generate QR | Belum |
| 3 | API - GET validate token | Belum |
| 4 | API - POST scan-register + guard hp_nfc | Belum |
| 5 | Halaman scan publik + Web NFC integration | Belum |
| 6 | Komponen QRGenerator | Belum |
| 7 | Komponen NFCScanUI + ScanResult | Belum |
| 8 | Utility lib/nfc.ts + lib/qr.ts | Belum |
| 9 | Update program detail - button Generate QR | Belum |
| 10 | PWA manifest + service worker (optional) | Belum |
| 11 | Testing - generate QR, scan, tap kartu HP | Belum |
| 12 | Docs - panduan petugas | Belum |
| 13 | Build & verifikasi | Belum |

### Keputusan Desain V8

1. Token scope tied to program+cabang
2. Token expiry 30 hari (configurable)
3. Rate limiting max 100 scan/jam per token
4. Web NFC fallback: input manual jika tidak support
5. Server-side validation
6. Offline queue optional via PWA