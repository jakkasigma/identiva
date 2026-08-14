# LokaID — Dynamic Local Citizen Service Platform

## Ringkasan Eksekutif

**LokaID** adalah platform layanan masyarakat lokal berbasis identitas digital di dalam ekosistem **Identiva**. LokaID membantu kelurahan, desa, komunitas, dan unit layanan lokal membuat program seperti Posyandu, Bansos, Pendataan UMKM, Peminjaman Fasilitas, dan kegiatan masyarakat lain tanpa membangun aplikasi baru dari awal.

LokaID tidak diposisikan sebagai aplikasi tunggal yang hardcoded. LokaID diposisikan sebagai **Dynamic Program Builder**: admin menjawab kebutuhan program melalui wizard, lalu sistem membentuk konfigurasi program berupa sasaran, data tambahan, aktivitas, workflow dasar, wilayah, dan metode scan.

Implementasi saat ini sudah mencakup fondasi utama:

- Program Wizard.
- Multi-aktivitas per program.
- Form Builder dasar.
- Relasi wali-anak untuk Posyandu.
- Hierarki LokaID induk dan wilayah/kecamatan.
- Operator wilayah.
- Pendaftaran peserta cerdas dari data `Penduduk` pusat.
- Scan ESP32, HP NFC via QR, dan manual.

Pengembangan lanjutan yang masih menjadi roadmap:

- Dynamic Question Engine penuh berbasis rule.
- Workflow Engine generik berbasis urutan/graph.
- Device Monitoring online/offline.
- Report Builder generik.
- PWA offline queue untuk lapangan.
- Kontrol privasi dan audit log lebih kuat untuk data sensitif.

> **Status dokumen:** dokumen ini adalah visi produk LokaID. Tidak semua konsep di dalamnya sudah menjadi fitur final. Bagian yang sudah diimplementasikan, parsial, dan future diringkas pada tabel status implementasi berikut.

## Status Implementasi Saat Ini

| Modul | Status | Catatan |
| :--- | :--- | :--- |
| Program Wizard | Sudah | Fondasi Dynamic Program Builder |
| Multi-aktivitas | Sudah | Aktivitas fixed set seperti check-in, distribusi, pengajuan, persetujuan, pengembalian |
| Dashboard program adaptif | Sudah | Tampilan menyesuaikan `tujuan` program |
| Form Builder | Sudah | Field dasar: text, number, date, dropdown, radio, checkbox |
| Relasi wali-anak | Sudah | Mendukung Posyandu Balita dan program anak |
| Wilayah/kecamatan | Sudah | Secara teknis memakai model `Cabang`, di UI disebut Wilayah |
| Operator wilayah | Sudah | Admin induk dapat membuat/reset/nonaktifkan operator |
| HP NFC via QR | Sudah | Butuh HTTPS dan Chrome Android |
| Dynamic Question Engine | Parsial | Wizard belum rule engine penuh |
| Workflow Engine generik | Parsial | Multi-aktivitas sudah ada, graph workflow belum ada |
| Device Monitoring | Future | Belum monitoring online/offline perangkat penuh |
| Report Builder generik | Future | Aktivitas dan statistik ada, builder laporan belum penuh |
| Field file/image/location | Future | Belum menjadi tipe khusus di Form Builder |

## Posisi LokaID dalam Identiva

```text
IDENTIVA
  ├── Identitas warga pusat
  ├── Multi-tenant platform
  ├── Admin platform
  └── Mitra/produk
        ├── SPBU/Subsidi
        └── LokaID/Layanan Lokal
```

| Layer | Fungsi |
| :--- | :--- |
| Identiva | Identitas pusat, multi-tenant, kontrol platform |
| LokaID | Program lokal, peserta, aktivitas, wilayah, form, workflow dasar |
| Wilayah | Unit operasional lapangan seperti kecamatan/kelurahan/unit layanan |
| Warga | Pemilik identitas/Citizen ID yang ikut program |

Kalimat positioning utama:

> **Identiva menyediakan identitas. LokaID menjalankan program lokal.**

---

## 1. Gambaran Umum

**LokaID** merupakan salah satu mitra yang berada di dalam ekosistem **Identiva**. LokaID berfokus pada digitalisasi pendataan, program, dan layanan masyarakat dalam skala lokal seperti kelurahan, desa, komunitas, fasilitas masyarakat, dan wilayah pelayanan tertentu.

LokaID tidak dibuat sebagai aplikasi yang hanya memiliki program tetap seperti bansos, posyandu, atau perpustakaan.

LokaID dirancang sebagai **platform dinamis** yang memungkinkan setiap admin mitra membuat program sesuai kebutuhan client.

Setiap program dapat memiliki:

* Sasaran peserta yang berbeda
* Jenis data yang berbeda
* Metode pendaftaran yang berbeda
* Persyaratan yang berbeda
* Proses verifikasi yang berbeda
* Aktivitas yang berbeda
* Workflow yang berbeda
* Integrasi perangkat IoT yang berbeda

Konsep utama LokaID:

> **Admin cukup menjelaskan kebutuhan program melalui pertanyaan seperti kuisioner, kemudian LokaID menerjemahkan jawaban tersebut menjadi konfigurasi program secara otomatis.**

---

# 2. Posisi LokaID dalam Ekosistem Identiva

Identiva merupakan platform utama yang menyediakan identitas dan integrasi dengan berbagai mitra.

LokaID merupakan salah satu mitra yang berfokus pada digitalisasi layanan masyarakat lokal.

```text
                         IDENTIVA
                    Identity Platform
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Smart Bike   Smart Locker    LokaID
             │            │            │
       Transportasi    Storage      Layanan Lokal
```

LokaID berfokus pada:

```text
Citizen ID
    +
Pendataan
    +
Program Masyarakat
    +
Layanan Lokal
    +
Workflow
    +
IoT
```

---

# 3. Tujuan LokaID

LokaID dibuat untuk membantu client dalam:

1. Mendigitalisasi pendataan masyarakat.
2. Mengurangi pencatatan manual.
3. Menghubungkan layanan dengan identitas warga.
4. Membuat program masyarakat secara fleksibel.
5. Mengelola peserta dan penerima program.
6. Mencatat aktivitas masyarakat.
7. Melakukan verifikasi melalui Citizen ID.
8. Menggunakan perangkat IoT untuk proses tertentu.
9. Menyediakan data dan laporan aktivitas secara terpusat.
10. Memungkinkan setiap client membuat program sesuai kebutuhan tanpa harus membuat sistem baru dari awal.

---

# 4. Konsep Utama LokaID

LokaID menggunakan konsep **Dynamic Program Builder**.

```text
                    LOKAID
                       │
                PROGRAM BUILDER
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Peserta          Data          Aktivitas
        │              │              │
        └──────────────┼──────────────┘
                       │
                   Workflow
                       │
                Citizen ID / IoT
                       │
                       ▼
                  PROGRAM AKTIF
```

LokaID tidak menentukan bahwa sistem hanya dapat digunakan untuk bansos atau posyandu.

Sebaliknya, admin dapat membuat program berdasarkan kebutuhan client.

---

# 5. Prinsip Dynamic Program

Setiap program dapat mempunyai konfigurasi yang berbeda.

## Contoh Program 1 — Bantuan Sembako

```text
Peserta     : Warga
Identitas   : Citizen ID
Pendaftaran: Dipilih admin
Aktivitas   : Verifikasi + Distribusi
IoT         : RFID
```

## Contoh Program 2 — Posyandu Balita

```text
Peserta     : Anak
Penghubung  : Orang tua / wali
Identitas   : Citizen ID wali
Pendaftaran: Orang tua / wali
Aktivitas   : Pendaftaran + Check-in + Pendataan
IoT         : RFID
```

## Contoh Program 3 — Peminjaman Aula

```text
Peserta     : Warga
Identitas   : Citizen ID
Pendaftaran: Pengajuan warga
Aktivitas   : Pengajuan + Persetujuan + Peminjaman + Pengembalian
IoT         : Opsional
```

Ketiga program tersebut menggunakan platform yang sama tetapi mempunyai alur berbeda.

---

# 6. Program Wizard

Untuk membuat program baru, admin tidak diberikan konfigurasi teknis yang rumit.

Admin menggunakan **Program Wizard**.

Admin memilih:

```text
+ Buat Program
```

Kemudian LokaID memberikan serangkaian pertanyaan seperti kuisioner.

```text
Admin
  │
  ▼
+ Buat Program
  │
  ▼
Program Wizard
  │
  ├── Tujuan program?
  ├── Siapa sasaran?
  ├── Bagaimana pendaftaran?
  ├── Data apa yang dibutuhkan?
  ├── Aktivitas apa yang dilakukan?
  ├── Perlu verifikasi?
  ├── Ada persyaratan?
  ├── Perlu Citizen ID?
  └── Perlu IoT?
  │
  ▼
Review
  │
  ▼
Program Aktif
```

Pertanyaan bersifat **dinamis**.

Tidak semua pertanyaan akan ditampilkan kepada admin.

Pertanyaan berikutnya bergantung pada jawaban sebelumnya.

---

# 7. Step 1 — Informasi Dasar Program

Admin mengisi informasi dasar program.

```text
Nama Program
Deskripsi
Kategori
Tanggal Mulai
Tanggal Selesai
Lokasi
Status
```

Kategori dapat digunakan untuk membantu pengelompokan program.

Contoh:

```text
Bantuan
Kegiatan
Pendataan
Peminjaman
Pelayanan
Pendaftaran
Lainnya
```

Kategori tidak mengunci fitur program.

---

# 8. Step 2 — Tujuan Program

LokaID bertanya:

> Apa tujuan program ini?

Pilihan:

```text
○ Memberikan bantuan
○ Mengadakan kegiatan
○ Mengumpulkan data
○ Menyediakan layanan
○ Meminjamkan barang/fasilitas
○ Mendaftarkan warga
○ Lainnya
```

Jawaban ini digunakan sebagai dasar untuk menentukan pertanyaan berikutnya.

---

# 9. Step 3 — Menentukan Sasaran Program

LokaID bertanya:

> Siapa yang menjadi sasaran atau peserta program?

Pilihan:

```text
☐ Warga
☐ Anak
☐ Orang tua / wali
☐ Keluarga
☐ Kelompok masyarakat
☐ Pemilik usaha
☐ Organisasi
☐ Entitas lainnya
```

Admin dapat memilih lebih dari satu.

---

# 10. Konsep Subject / Subjek Program

LokaID membedakan antara beberapa jenis subjek.

## 10.1 Citizen

Citizen merupakan orang yang memiliki identitas pada Identiva.

```text
Citizen
 ├── Citizen ID
 ├── Nama
 ├── NIK
 └── Data dasar
```

## 10.2 Child / Dependent

Child atau Dependent merupakan individu yang dapat dihubungkan dengan Citizen lain sebagai orang tua atau wali.

Contoh:

```text
Ibu Siti
Citizen ID
   │
   └── Aisyah
       Child / Dependent
```

Konsep ini penting untuk program yang tidak menjadikan pemilik Citizen ID sebagai peserta utama.

---

# 11. Contoh Posyandu

Program:

> Posyandu Balita Agustus

Subjek utama:

```text
Child
```

Penghubung:

```text
Parent / Guardian
```

Struktur data:

```text
Ibu Siti
Citizen ID: CID001
     │
     └── Aisyah
         Tanggal lahir: ...
         Jenis kelamin: ...
```

Ketika ibu datang ke lokasi:

```text
Tap Citizen ID Ibu
        ↓
Identifikasi wali
        ↓
Pilih anak
        ↓
Check-in Aisyah
```

Dengan demikian Citizen ID tetap digunakan sebagai identitas utama penghubung, sedangkan anak menjadi peserta program.

---

# 12. Step 4 — Metode Pendaftaran

LokaID bertanya:

> Bagaimana peserta masuk ke program?

Pilihan:

```text
○ Dipilih oleh admin
○ Warga mendaftar sendiri
○ Diundang admin
○ Import data
○ Pendaftaran terbuka
○ Kombinasi
```

## Contoh Bansos

```text
Admin menentukan penerima
```

## Contoh Pelatihan

```text
Warga mendaftar
        ↓
Admin melakukan verifikasi
```

## Contoh Posyandu

```text
Orang tua / wali
        ↓
Mendaftarkan anak
```

---

# 13. Step 5 — Data yang Dibutuhkan

LokaID bertanya:

> Selain data identitas dasar dari Identiva, apakah program membutuhkan data tambahan?

Pilihan:

```text
○ Tidak
● Ya
```

Jika Ya, admin dapat menggunakan **Form Builder**.

```text
+ Tambah Field
```

Jenis field:

```text
Text
Number
Date
Dropdown
Radio
Checkbox
Phone
Address
Image
File
Location
```

Admin dapat menentukan:

```text
Nama Field
Jenis Field
Wajib / Opsional
```

---

# 14. Contoh Form Bansos

Program bantuan sembako dapat menggunakan:

```text
Nama penerima
Alamat
Pekerjaan
Jumlah anggota keluarga
Jenis bantuan
Keterangan
```

---

# 15. Contoh Form Posyandu

Program Posyandu dapat menggunakan:

```text
Nama anak
Tanggal lahir
Jenis kelamin
Nama wali
Hubungan dengan wali
```

Field tambahan dapat ditambahkan sesuai kebutuhan program.

Data sensitif harus menggunakan pengaturan hak akses yang sesuai dan hanya dikumpulkan apabila memang diperlukan oleh program.

---

# 16. Step 6 — Aktivitas Program

LokaID bertanya:

> Apa yang dilakukan peserta dalam program?

Admin dapat memilih satu atau beberapa aktivitas.

```text
☐ Pendaftaran
☐ Check-in
☐ Kehadiran
☐ Verifikasi
☐ Distribusi
☐ Pengambilan barang
☐ Peminjaman
☐ Pengembalian
☐ Pendataan
☐ Penilaian
☐ Persetujuan
☐ Lainnya
```

Aktivitas dapat digabungkan untuk membentuk workflow program.

---

# 17. Contoh Workflow Bansos

Admin memilih:

```text
☑ Verifikasi
☑ Distribusi
```

LokaID membentuk:

```text
Calon Penerima
      ↓
Verifikasi
      ↓
Tap Citizen ID
      ↓
Distribusi Bantuan
      ↓
Konfirmasi
      ↓
Selesai
```

Status:

```text
Calon
Verified
Received
Completed
```

---

# 18. Contoh Workflow Posyandu

Admin memilih:

```text
☑ Pendaftaran
☑ Check-in
☑ Pendataan
```

LokaID membentuk:

```text
Wali
 ↓
Pendaftaran Anak
 ↓
Verifikasi
 ↓
Datang ke Lokasi
 ↓
Tap Citizen ID Wali
 ↓
Check-in Anak
 ↓
Pendataan
 ↓
Selesai
```

---

# 19. Contoh Workflow Peminjaman

Admin memilih:

```text
☑ Pengajuan
☑ Persetujuan
☑ Peminjaman
☑ Pengembalian
```

Workflow:

```text
Pengajuan
 ↓
Review Admin
 ↓
Approved
 ↓
Borrowed
 ↓
Returned
 ↓
Completed
```

---

# 20. Step 7 — Verifikasi

LokaID bertanya:

> Apakah peserta perlu diverifikasi?

Pilihan:

```text
○ Tidak
○ Ya
```

Jika Ya:

```text
Metode:
☑ Admin
☑ Citizen ID
☐ Dokumen
☐ Approval
```

Status peserta:

```text
Pending
   ↓
Verified
   ↓
Active
```

Jika ditolak:

```text
Pending
   ↓
Rejected
```

---

# 21. Step 8 — Persyaratan Program

LokaID bertanya:

> Apakah program memiliki persyaratan tertentu?

Pilihan:

```text
☐ Usia
☐ Wilayah
☐ Status tertentu
☐ Kelompok tertentu
☐ Kuota
☐ Dokumen
☐ Tidak ada
```

## Contoh Posyandu

```text
Usia anak:
0–5 tahun
```

## Contoh Bantuan

```text
Wilayah:
Kelurahan tertentu

Kuota:
250 penerima
```

---

# 22. Step 9 — Identifikasi Peserta

LokaID bertanya:

> Bagaimana peserta akan dikenali?

Pilihan:

```text
☑ Citizen ID
☐ QR Code
☐ Nomor registrasi
☐ Input manual
```

Citizen ID menjadi salah satu metode utama apabila program membutuhkan identifikasi warga.

---

# 23. Step 10 — Integrasi IoT

LokaID bertanya:

> Apakah program menggunakan perangkat di lokasi?

Pilihan:

```text
○ Tidak
● Ya
```

Jika Ya:

```text
☐ RFID / NFC
☐ QR Scanner
☐ Smart Lock
☐ Sensor
☐ GPS
☐ Device lainnya
```

Kemudian admin menentukan kapan perangkat digunakan.

```text
☐ Saat registrasi
☐ Saat verifikasi
☐ Saat check-in
☐ Saat distribusi
☐ Saat pengembalian
```

---

# 24. Contoh IoT pada Bansos

```text
Citizen ID
    ↓
RFID Reader
    ↓
ESP32
    ↓
Server LokaID
    ↓
Verifikasi Penerima
    ↓
Valid
    ↓
Bantuan diberikan
```

---

# 25. Contoh IoT pada Posyandu

```text
Ibu / Wali
    ↓
Tap Citizen ID
    ↓
RFID Reader
    ↓
ESP32
    ↓
Server LokaID
    ↓
Identifikasi Wali
    ↓
Pilih Anak
    ↓
Check-in
```

---

# 26. Program Preview

Sebelum program dibuat, LokaID menampilkan hasil konfigurasi.

Contoh:

## Posyandu Balita Agustus 2026

```text
Sasaran
Anak usia 0–5 tahun

Penghubung
Orang tua / wali

Pendaftaran
Orang tua / wali

Identifikasi
Citizen ID

Aktivitas
✓ Pendaftaran
✓ Check-in
✓ Pendataan

Verifikasi
✓ Admin

Perangkat
RFID + ESP32
```

Admin dapat melihat konfigurasi sebelum membuat program.

```text
[ ← Kembali & Edit ]

[ ✓ Buat Program ]
```

---

# 27. Preview Workflow

Contoh Posyandu:

```text
             ORANG TUA / WALI
                     │
                     ▼
                Citizen ID
                     │
                     ▼
                 Verifikasi
                     │
                     ▼
                  Pilih Anak
                     │
                     ▼
                  Check-in
                     │
                     ▼
                 Pendataan
                     │
                     ▼
                  SELESAI
```

---

# 28. Dynamic Question Engine

Agar Program Wizard mudah digunakan, LokaID menggunakan konsep **Dynamic Question Engine**.

Pertanyaan berikutnya bergantung pada jawaban sebelumnya.

Contoh:

```text
IF target = CHILD
THEN ask guardian

IF activity = DISTRIBUTION
THEN ask distribution type

IF activity = BORROWING
THEN ask return requirement

IF registration = OPEN
THEN ask registration period

IF verification = YES
THEN ask verification method

IF IoT = YES
THEN ask device type
```

Dengan sistem tersebut, admin hanya mendapatkan pertanyaan yang relevan dengan program yang sedang dibuat.

---

# 29. Contoh Alur Dynamic Wizard

Misalnya admin membuat program Posyandu.

### Pertanyaan 1

> Apa tujuan program ini?

Jawaban:

```text
Kegiatan masyarakat
```

### Pertanyaan 2

> Siapa yang menjadi sasaran?

Jawaban:

```text
Anak
```

### Pertanyaan 3

> Apakah anak memiliki orang tua/wali yang perlu dihubungkan?

Jawaban:

```text
Ya
```

### Pertanyaan 4

> Bagaimana wali diidentifikasi?

Jawaban:

```text
Citizen ID
```

### Pertanyaan 5

> Apakah peserta membutuhkan check-in?

Jawaban:

```text
Ya
```

### Pertanyaan 6

> Apakah membutuhkan data tambahan?

Jawaban:

```text
Ya
```

LokaID kemudian menampilkan Form Builder:

```text
+ Nama Anak
+ Tanggal Lahir
+ Jenis Kelamin
+ Hubungan Wali
```

### Pertanyaan 7

> Apakah check-in menggunakan perangkat?

Jawaban:

```text
Ya
```

### Pertanyaan 8

> Pilih perangkat.

Jawaban:

```text
RFID / NFC
```

Setelah semua pertanyaan selesai, LokaID membuat konfigurasi program.

---

# 30. Rekomendasi Otomatis

Setelah admin menjawab pertanyaan, LokaID dapat memberikan rekomendasi.

Contoh:

```text
LokaID mendeteksi:

✓ Peserta berupa anak
✓ Memiliki wali
✓ Membutuhkan pendaftaran
✓ Membutuhkan kehadiran
✓ Membutuhkan pendataan
✓ Menggunakan Citizen ID
```

Kemudian:

> **LokaID menyarankan konfigurasi: Program Kegiatan & Pendataan**

Rekomendasi ini tidak memaksa admin.

Admin tetap dapat mengubah konfigurasi sebelum program dibuat.

---

# 31. Struktur Mesin LokaID

Secara konseptual, LokaID terdiri dari beberapa engine.

```text
                         LOKAID
                            │
                     PROGRAM ENGINE
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
  SUBJECT ENGINE       FORM ENGINE        WORKFLOW ENGINE
       │                    │                    │
   Siapa yang          Data apa yang      Bagaimana proses
   didata?             dikumpulkan?       berlangsung?
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                     ACTIVITY ENGINE
                            │
                            ▼
                      DEVICE ENGINE
                            │
                            ▼
                    ESP32 / RFID / IoT
```

---

# 32. Subject Engine

Mengatur siapa atau apa yang menjadi subjek program.

Contoh:

```text
Citizen
Child
Guardian
Family
Business
Organization
Custom Entity
```

---

# 33. Form Engine

Mengatur data tambahan yang dibutuhkan oleh program.

Contoh field:

```text
Text
Number
Date
Select
Checkbox
Radio
Phone
Address
Image
File
Location
```

Admin dapat membuat field sendiri.

---

# 34. Workflow Engine

Mengatur urutan proses dalam program.

Contoh:

```text
Registration
      ↓
Verification
      ↓
Check-in
      ↓
Activity
      ↓
Completed
```

Workflow dapat berbeda pada setiap program.

---

# 35. Activity Engine

Mengatur aktivitas yang tersedia.

Contoh:

```text
Check-in
Distribution
Borrow
Return
Attendance
Verification
Registration
Data Collection
Approval
```

Satu program dapat menggunakan beberapa aktivitas.

---

# 36. Device Engine

Menghubungkan program dengan perangkat IoT.

Contoh:

```text
RFID
NFC
QR
Sensor
Smart Lock
GPS
ESP32
```

IoT bersifat opsional.

Program tetap dapat berjalan tanpa perangkat IoT.

---

# 37. Dashboard Admin

Setelah program dibuat, admin memiliki dashboard.

```text
LOKAID ADMIN

Dashboard
│
├── Program
│   ├── Aktif
│   ├── Draft
│   └── Selesai
│
├── Peserta
│
├── Pendataan
│
├── Aktivitas
│
├── Perangkat IoT
│
└── Laporan
```

---

# 38. Dashboard Program

Contoh:

```text
POSYANDU BALITA AGUSTUS

Peserta       : 87
Hadir         : 71
Belum Hadir   : 16

Data Lengkap : 68
Data Belum    : 3

Status IoT
ONLINE
```

Dashboard disesuaikan dengan jenis program.

---

# 39. Data Peserta

Admin dapat melihat:

```text
Nama
Citizen ID
Status
Program
Tanggal Daftar
Aktivitas
```

Untuk Posyandu:

```text
Nama Anak
Nama Wali
Citizen ID Wali
Status
Check-in
```

---

# 40. Riwayat Aktivitas

Setiap aktivitas program dapat dicatat.

Contoh:

```text
09:12
Citizen ID: CID001
Program: Posyandu
Activity: Check-in
Participant: Aisyah
Status: Success
Device: RFID-001
```

Contoh Bansos:

```text
10:31
Citizen ID: CID029
Program: Bantuan Sembako
Activity: Distribution
Status: Completed
```

Riwayat aktivitas digunakan untuk audit, monitoring, dan laporan.

---

# 41. Monitoring IoT

Admin dapat memonitor perangkat yang digunakan program.

```text
DEVICE MONITORING

RFID-001
ONLINE

RFID-002
ONLINE

RFID-003
OFFLINE
```

Informasi perangkat:

```text
Device ID
Program
Lokasi
Status
Last Online
Last Activity
```

---

# 42. Laporan

Setiap program dapat menghasilkan laporan sesuai konfigurasi.

## Bansos

```text
Total calon penerima
Total terverifikasi
Total menerima
Belum menerima
```

## Posyandu

```text
Total peserta
Total hadir
Total tidak hadir
Data peserta
```

## Peminjaman

```text
Total pengajuan
Disetujui
Ditolak
Sedang dipinjam
Sudah dikembalikan
```

## Pendataan

```text
Total data
Data lengkap
Data belum lengkap
```

---

# 43. Contoh Program yang Dapat Dibuat

LokaID dapat digunakan untuk berbagai jenis program.

## Bantuan

```text
Bantuan Sembako
Bantuan Pendidikan
Bantuan Perlengkapan
```

## Kegiatan Masyarakat

```text
Posyandu
Kegiatan Pemuda
Kerja Bakti
Seminar Warga
```

## Fasilitas

```text
Perpustakaan
Peminjaman Aula
Peminjaman Lapangan
Peminjaman Peralatan
```

## Pendataan

```text
Pendataan UMKM
Pendataan Warga
Pendataan Fasilitas
Pendataan Komunitas
```

## Program Pengembangan

```text
Pelatihan
Pendaftaran Kegiatan
Lomba Kelurahan
Program Komunitas
```

Daftar tersebut bukan daftar fitur yang dikunci di sistem.

Semua contoh tersebut merupakan **konfigurasi program yang dapat dibuat melalui Program Wizard**.

---

# 44. Keunggulan LokaID

## 44.1 Dinamis

Program dapat dibuat sesuai kebutuhan client.

## 44.2 Tidak Hard-coded

Sistem tidak hanya menyediakan program tertentu.

## 44.3 Mudah digunakan

Admin tidak perlu memahami konfigurasi teknis.

## 44.4 Citizen ID Terintegrasi

Identitas warga dapat digunakan pada berbagai program.

## 44.5 Mendukung Relasi

Contoh:

```text
Ibu → Anak
Wali → Peserta
Pemilik → Usaha
```

## 44.6 Mendukung IoT

Perangkat IoT dapat digunakan jika diperlukan.

## 44.7 Mendukung Workflow

Setiap program dapat mempunyai alur yang berbeda.

## 44.8 Mendukung Pendataan Dinamis

Field dapat dibuat sesuai kebutuhan program.

## 44.9 Mendukung Monitoring

Aktivitas dan perangkat dapat dipantau.

## 44.10 Mendukung Reporting

Data program dapat diolah menjadi laporan.

---

# 45. Arsitektur Konseptual LokaID

```text
                           IDENTIVA
                      Identity Platform
                             │
                         Citizen ID
                             │
                             ▼
                           LOKAID
                             │
                    ┌────────┴────────┐
                    │                 │
               ADMIN MITRA          WARGA
                    │                 │
                    ▼                 │
              PROGRAM WIZARD          │
                    │                 │
                    ▼                 │
             QUESTION ENGINE          │
                    │                 │
          ┌─────────┼─────────┐       │
          ▼         ▼         ▼       │
       SUBJECT     FORM    WORKFLOW   │
          │         │         │       │
          └─────────┼─────────┘       │
                    │                 │
                    ▼                 │
              PROGRAM CONFIG          │
                    │                 │
                    ▼                 │
               ACTIVE PROGRAM ◄───────┘
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Citizen    Activity    IoT
          │         │         │
          │         │      ESP32/RFID
          │         │         │
          └─────────┼─────────┘
                    ▼
                DATABASE
                    │
                    ▼
              ADMIN DASHBOARD
                    │
                    ▼
                 REPORT
```

---

# 46. Contoh Implementasi End-to-End — Bansos

Admin membuat:

```text
Bantuan Sembako Agustus 2026
```

Wizard:

```text
Tujuan
→ Memberikan bantuan

Sasaran
→ Warga

Pendaftaran
→ Dipilih admin

Data
→ Data identitas + data tambahan

Aktivitas
→ Verifikasi + Distribusi

Identifikasi
→ Citizen ID

IoT
→ RFID
```

Program aktif.

Ketika warga datang:

```text
Citizen
 ↓
Tap Citizen ID
 ↓
RFID Reader
 ↓
ESP32
 ↓
LokaID
 ↓
Verifikasi
 ↓
Valid
 ↓
Bantuan diberikan
 ↓
Konfirmasi
 ↓
Status = RECEIVED
```

---

# 47. Contoh Implementasi End-to-End — Posyandu

Admin membuat:

```text
Posyandu Balita Agustus 2026
```

Wizard:

```text
Tujuan
→ Kegiatan masyarakat

Sasaran
→ Anak

Penghubung
→ Orang tua / wali

Pendaftaran
→ Orang tua / wali

Data
→ Data anak

Aktivitas
→ Check-in + Pendataan

Identifikasi
→ Citizen ID wali

IoT
→ RFID
```

Program aktif.

Ketika warga datang:

```text
Ibu
 ↓
Tap Citizen ID
 ↓
RFID Reader
 ↓
LokaID
 ↓
Identifikasi wali
 ↓
Pilih anak
 ↓
Check-in
 ↓
Pendataan
 ↓
Status = COMPLETED
```

---

# 48. Contoh Implementasi End-to-End — Peminjaman Fasilitas

Admin membuat:

```text
Peminjaman Aula Kelurahan
```

Wizard:

```text
Tujuan
→ Menyediakan layanan

Sasaran
→ Warga

Pendaftaran
→ Pengajuan warga

Aktivitas
→ Pengajuan + Persetujuan + Peminjaman + Pengembalian

Identifikasi
→ Citizen ID

IoT
→ Opsional
```

Workflow:

```text
Pengajuan
 ↓
Review Admin
 ↓
Approved
 ↓
Borrowed
 ↓
Returned
 ↓
Completed
```

---

# 49. Konsep Database Dinamis

Secara konseptual, program tidak disimpan sebagai tabel khusus seperti:

```text
bansos
posyandu
perpustakaan
```

Sebaliknya, program menggunakan konfigurasi umum.

Contoh:

```text
program
program_participant
program_field
program_field_value
program_workflow
program_activity
program_requirement
program_device
program_registration
program_verification
program_log
```

Dengan pendekatan tersebut, satu struktur dapat digunakan oleh berbagai jenis program.

---

# 50. Konsep Program Configuration

Setiap program memiliki konfigurasi.

```text
PROGRAM
│
├── Basic Information
│
├── Subject
│
├── Participant
│
├── Registration
│
├── Fields
│
├── Requirements
│
├── Verification
│
├── Workflow
│
├── Activities
│
├── Devices
│
└── Reporting
```

Konfigurasi tersebut dibentuk dari jawaban admin pada Program Wizard.

---

# 51. Prinsip Utama LokaID

LokaID bukan:

> "Aplikasi bansos."

LokaID bukan:

> "Aplikasi posyandu."

LokaID bukan:

> "Aplikasi perpustakaan."

LokaID adalah:

> **Platform untuk membuat dan menjalankan program layanan masyarakat lokal secara dinamis berdasarkan kebutuhan client.**

---

# 52. Konsep Produk

### Nama

**LokaID**

### Kepanjangan Konsep

**Local Identity & Service Platform**

### Posisi

Mitra di dalam ekosistem Identiva.

### Fokus

Digitalisasi program dan layanan masyarakat lokal.

### Target

```text
Kelurahan
Desa
Komunitas
Fasilitas masyarakat
Organisasi lokal
Client pelayanan masyarakat
```

### Teknologi utama

```text
Web Application
Database
Citizen ID
API
IoT
ESP32
RFID / NFC
Dashboard
Dynamic Form
Dynamic Workflow
```

---

# 53. Slogan

> **LokaID — Satu Identitas, Berbagai Layanan Lokal.**

Alternatif:

> **LokaID — Digitalisasi Program Masyarakat dalam Satu Identitas.**

Konsep produk:

> **Create once. Configure dynamically. Serve locally.**

---

# 54. Ringkasan Final

```text
LOKAID
│
├── Platform layanan masyarakat lokal
│
├── Terintegrasi dengan Identiva
│
├── Menggunakan Citizen ID
│
├── Memiliki Dynamic Program Builder
│
├── Admin membuat program melalui Program Wizard
│
├── Wizard menggunakan pertanyaan dinamis
│
├── Jawaban admin menentukan konfigurasi program
│
├── Program dapat menentukan:
│   ├── Sasaran
│   ├── Subjek
│   ├── Relasi
│   ├── Pendaftaran
│   ├── Data
│   ├── Persyaratan
│   ├── Verifikasi
│   ├── Aktivitas
│   ├── Workflow
│   └── IoT
│
├── Mendukung berbagai program
│
├── Mendukung monitoring
│
└── Mendukung reporting
```

## Core Concept

```text
ADMIN
  │
  ▼
PROGRAM WIZARD
  │
  ▼
DYNAMIC QUESTIONS
  │
  ▼
PROGRAM CONFIGURATION
  │
  ├── Participant
  ├── Form
  ├── Requirement
  ├── Verification
  ├── Workflow
  ├── Activity
  └── IoT
  │
  ▼
ACTIVE PROGRAM
  │
  ▼
CITIZEN + LOKAID + IoT
  │
  ▼
DATA + MONITORING + REPORT
```

**Inti dari LokaID adalah fleksibilitas. Admin tidak memilih “aplikasi bansos” atau “aplikasi posyandu”, tetapi menjelaskan kebutuhan program melalui Program Wizard. LokaID kemudian membentuk sistem yang sesuai dengan kebutuhan tersebut.**
