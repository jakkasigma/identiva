# REVISI KERJA LOKAID

> Dokumen ini berisi catatan revisi kerja untuk LokaID setelah dilakukan analisis terhadap konsep (`ide.md`), rencana implementasi (`rencana.md`), dan kondisi implementasi aktual di kode. Tujuannya bukan mengganti konsep utama LokaID, tetapi merapikan arah kerja, narasi, prioritas demo, batasan, dan bagian yang masih perlu diperjelas.

---

## BAGIAN 1: RINGKASAN REVISI

LokaID sudah berkembang cukup jauh dari konsep awal. Fitur seperti Program Wizard, multi-aktivitas, Form Builder, relasi wali-anak, wilayah, operator wilayah, QR token, dan HP NFC sudah tersedia. Namun, konsep di `ide.md` masih sangat luas dan menggambarkan LokaID sebagai engine generik penuh.

Masalah utama yang perlu direvisi bukan karena implementasi buruk, tetapi karena **narasi konsep lebih luas daripada implementasi aktual**. Jika tidak dirapikan, LokaID bisa terlihat overclaim saat dijelaskan ke juri atau pembaca dokumen.

Fokus revisi:

1. Menyamakan istilah dan nama produk.
2. Memisahkan konsep ideal, implementasi saat ini, dan rencana lanjutan.
3. Menentukan flow demo utama agar tidak melebar.
4. Menjelaskan batasan secara jujur tetapi aman.
5. Menandai status fitur: sudah ada, parsial, atau future.
6. Merapikan narasi teknis agar tidak terlihat seperti fitur yang belum ada sudah selesai.

---

## BAGIAN 2: REVISI NAMA DAN ISTILAH

### 2.1 Nama Resmi

Gunakan nama **LokaID**, bukan `local id`, `LocalID`, atau `localid`.

Alasan:

- Nama resmi di dokumen konsep adalah `LokaID`.
- Konsisten dengan folder `docs/lokaid` dan model `ProgramLokaID`, `PesertaLokaID`, `AktivitasLokaID`.
- Lebih terlihat sebagai brand produk, bukan istilah umum.

Revisi penulisan:

| Salah / Kurang Konsisten | Benar |
| :--- | :--- |
| local id | LokaID |
| Local ID | LokaID |
| localid | LokaID |
| loka id | LokaID |

### 2.2 Istilah Wilayah dan Cabang

Di kode, wilayah LokaID memakai model `Cabang`. Secara UI dan narasi, istilah yang dipakai adalah **Wilayah** atau **Kecamatan**.

Revisi narasi:

> Secara teknis, LokaID memakai model `Cabang` untuk merepresentasikan wilayah/kecamatan. Di UI dan dokumentasi pengguna, entitas ini disebut **Wilayah** agar sesuai dengan konteks LokaID.

Tujuan revisi ini adalah mencegah pembaca bingung ketika melihat kode memakai `Cabang`, tetapi dokumen menyebut `Wilayah`.

### 2.3 Istilah Engine

Dokumen `ide.md` menyebut beberapa engine:

- Subject Engine
- Form Engine
- Workflow Engine
- Activity Engine
- Device Engine
- Dynamic Question Engine

Revisi yang disarankan: gunakan istilah engine sebagai **arah arsitektur**, bukan klaim fitur final.

Kalimat aman:

> LokaID sudah mengimplementasikan fondasi beberapa engine utama, terutama Program Builder, Form Engine dasar, Activity Engine dasar, dan Subject Engine untuk warga/anak. Beberapa engine lain seperti Dynamic Question Engine penuh, Workflow Engine generik, dan Device Monitoring masih menjadi pengembangan lanjutan.

---

## BAGIAN 3: REVISI NARASI PRODUK

### 3.1 Masalah Narasi Saat Ini

Konsep LokaID sangat luas. Jika semua fitur dijelaskan sekaligus, pembaca bisa menangkap LokaID sebagai produk yang tidak fokus.

Contoh area yang terlalu banyak jika dibahas bersamaan:

- Bansos
- Posyandu
- Peminjaman fasilitas
- Pendataan UMKM
- Pendaftaran warga
- Perpustakaan
- Kegiatan komunitas
- IoT monitoring
- Form builder
- Workflow engine
- Dynamic question engine

Semua ini benar sebagai visi, tetapi terlalu banyak untuk satu narasi demo.

### 3.2 Revisi Positioning

Positioning yang disarankan:

> **LokaID adalah platform layanan masyarakat lokal berbasis identitas digital yang memungkinkan kelurahan, desa, komunitas, atau wilayah layanan membuat program secara dinamis tanpa membangun aplikasi baru dari awal.**

Versi singkat untuk pitch:

> **LokaID — Satu Identitas, Berbagai Layanan Lokal.**

Versi teknis:

> LokaID memanfaatkan data identitas dari Identiva, lalu menyediakan Program Wizard, Form Builder, aktivitas program, dan pencatatan lapangan agar layanan lokal dapat dijalankan secara digital.

### 3.3 Narasi yang Harus Dihindari

Hindari mengatakan:

> LokaID sudah menjadi engine universal untuk semua jenis layanan lokal.

Kalimat itu terlalu besar karena beberapa bagian masih parsial.

Gunakan:

> LokaID sudah memiliki fondasi Dynamic Program Builder dan dapat menjalankan beberapa jenis layanan lokal seperti posyandu, bansos, pendataan, dan peminjaman fasilitas. Beberapa engine generik masih disiapkan sebagai pengembangan lanjutan.

---

## BAGIAN 4: REVISI STATUS IMPLEMENTASI

Bagian ini penting agar dokumen jujur dan mudah dipahami. Setiap fitur perlu diberi status.

| Modul | Status | Catatan Revisi |
| :--- | :--- | :--- |
| Program Wizard | Sudah | Sudah menjadi fondasi Dynamic Program Builder |
| Multi-aktivitas | Sudah | Aktivitas fixed set: check-in, distribusi, pengajuan, dll. |
| Dashboard program adaptif | Sudah | View berbeda per tujuan program |
| Form Builder | Sudah | Tipe field masih terbatas |
| Field value per peserta | Sudah | Mendukung data tambahan per program |
| Relasi wali-anak | Sudah | Cocok untuk Posyandu Balita |
| Wilayah/kecamatan | Sudah | Teknis memakai model `Cabang` |
| Operator wilayah | Sudah | Admin induk dapat kelola operator |
| Pendaftaran peserta cerdas | Sudah | Cek `Penduduk` pusat, hindari input ulang |
| Scan ESP32 | Sudah/parsial | Ada jalur `uid-scan`, tergantung hardware |
| HP NFC via QR | Sudah | Butuh HTTPS + Chrome Android |
| Dynamic Question Engine | Parsial | Wizard belum rule engine penuh |
| Workflow Engine generik | Parsial | Multi-aktivitas ada, workflow graph belum ada |
| Device Monitoring | Future | Belum monitoring online/offline device penuh |
| Report Builder generik | Future | Aktivitas & statistik ada, report builder belum penuh |
| File/image/location field | Future | Belum menjadi tipe field khusus |

Revisi dokumen disarankan menaruh tabel ini di bagian awal atau akhir agar pembaca tahu mana yang sudah selesai dan mana yang rencana.

---

## BAGIAN 5: REVISI FLOW DEMO

### 5.1 Masalah Flow Demo Jika Terlalu Banyak

LokaID punya banyak use case. Jika semua didemokan, produk bisa terlihat tidak fokus dan waktu demo habis untuk pindah-pindah menu.

Use case yang tidak perlu didemokan semua:

- Bansos
- Posyandu
- Peminjaman aula
- Pendataan UMKM
- Pendaftaran warga
- Kegiatan komunitas

### 5.2 Flow Demo Utama yang Disarankan

Flow utama: **Posyandu Balita**.

Alasan:

- Menunjukkan fitur yang paling berbeda dari aplikasi biasa.
- Memakai relasi wali-anak.
- Memakai Form Builder.
- Memakai check-in/aktivitas.
- Cocok dengan konteks layanan lokal.
- Lebih kuat daripada sekadar bansos karena menunjukkan LokaID benar-benar dinamis.

Flow demo:

```text
Admin wilayah login
  -> buka Program
  -> buat Program Posyandu Balita
  -> pilih tujuan: kegiatan
  -> pilih sasaran: anak
  -> tambah field: berat badan, tinggi badan, catatan kesehatan
  -> daftarkan wali dan anak
  -> scan kartu wali / pilih peserta
  -> check-in anak
  -> isi data kesehatan
  -> lihat aktivitas tercatat
```

### 5.3 Flow Pembanding

Flow pembanding: **Bansos Sembako**.

Alasan:

- Mudah dipahami juri.
- Relevan dengan subsidi/bantuan.
- Menunjukkan distribusi bantuan dan status penerimaan.

Flow pembanding:

```text
Admin buat Program Bansos Sembako
  -> pilih tujuan: bantuan
  -> aktivitas: verifikasi + distribusi
  -> daftarkan warga dari data Penduduk pusat
  -> warga datang
  -> scan Citizen ID
  -> distribusi dicatat
  -> status peserta berubah menjadi sudah menerima
```

### 5.4 Flow yang Sebaiknya Tidak Jadi Demo Utama

Peminjaman fasilitas dan pendataan UMKM sebaiknya dijadikan contoh narasi, bukan demo utama.

Alasan:

- Menambah cabang cerita.
- Memperpanjang demo.
- Tidak sekuat posyandu dalam menunjukkan relasi wali-anak.
- Tidak semudah bansos untuk dipahami cepat.

---

## BAGIAN 6: REVISI DOKUMEN `ide.md`

### 6.1 Masalah di `ide.md`

`ide.md` menjelaskan konsep besar LokaID dengan detail sangat luas. Dokumen ini bagus sebagai visi, tetapi kurang membedakan antara fitur yang sudah ada dan fitur masa depan.

Masalah utama:

1. Terlalu panjang untuk pembaca lomba.
2. Banyak engine disebut seperti sudah utuh.
3. Tidak ada status implementasi per fitur.
4. Beberapa field yang disebut belum ada di implementasi.
5. Device monitoring dijelaskan, tetapi belum menjadi fitur penuh.

### 6.2 Revisi yang Disarankan

Tambahkan bagian baru di awal atau akhir `ide.md`:

```text
Status Konsep:
Dokumen ini adalah visi produk LokaID. Implementasi saat ini sudah mencakup Program Wizard, Form Builder dasar, multi-aktivitas, wilayah, operator, wali-anak, dan HP NFC. Beberapa bagian seperti Dynamic Question Engine penuh, Device Monitoring, dan Report Builder generik masih menjadi rencana lanjutan.
```

Tambahkan tabel status fitur seperti pada Bagian 4 dokumen ini.

### 6.3 Bagian yang Perlu Ditandai Future

Tandai sebagai future:

- Subject selain warga dan anak.
- Field image/file/location.
- Workflow graph bebas.
- Device monitoring online/offline.
- Report builder generik.
- Dynamic Question Engine penuh.

---

## BAGIAN 7: REVISI DOKUMEN `rencana.md`

### 7.1 Masalah di `rencana.md`

`rencana.md` sudah sangat baik karena mencatat iterasi V1 sampai V8. Namun ada beberapa revisi kecil.

Catatan:

1. Ada typo `untu` di bagian V3.
2. Beberapa bagian status sudah selesai, tetapi perlu ringkasan final agar pembaca tidak membaca seluruh iterasi panjang.
3. Perlu tabel kesimpulan modul selesai/parsial/future.

### 7.2 Revisi yang Disarankan

Tambahkan bagian ringkasan di atas:

```text
Ringkasan Status LokaID:
- V1: MVP program/peserta/aktivitas selesai.
- V2: Program Wizard + multi-aktivitas selesai.
- V3: Form Builder + wali-anak selesai.
- V4: Wilayah multi-kecamatan selesai.
- V5: Operator wilayah selesai.
- V6: Pendaftaran peserta cerdas selesai.
- V7: Preferensi scan + admin platform selesai.
- V8: HP NFC via QR selesai.

Status umum:
LokaID sudah layak sebagai MVP demo. Pengembangan lanjutan: Dynamic Question Engine penuh, Device Monitoring, Report Builder, PWA offline.
```

### 7.3 Typo yang Perlu Dihapus

Di V3 ada teks:

```text
untu
```

Revisi:

```text
V2 sudah bisa buat program dengan tujuan berbeda dan multi-aktivitas.
```

---

## BAGIAN 8: REVISI TEKNIS LANJUTAN

Revisi teknis ini bukan wajib untuk demo, tetapi penting sebagai catatan roadmap.

### 8.1 Status dan Enum

Saat ini beberapa status disimpan sebagai `String`. Ini fleksibel, tetapi berisiko typo.

Saran:

- Buat kamus status per tujuan program.
- Contoh: `bantuan`: `belum_terima`, `sudah_terima`, `ditolak`.
- Contoh: `kegiatan`: `hadir`, `tidak_hadir`.
- Contoh: `peminjaman`: `diajukan`, `disetujui`, `dipinjam`, `dikembalikan`.

### 8.2 Workflow Engine

Saat ini multi-aktivitas sudah ada, tetapi workflow belum benar-benar graph-based.

Saran future:

```text
program_workflow_step
  -> id
  -> program_id
  -> aktivitas
  -> urutan
  -> next_step
  -> required_status
```

Manfaat:

- Urutan workflow lebih eksplisit.
- Bisa membuat flow bercabang.
- Bisa validasi apakah aktivitas boleh dilakukan.

### 8.3 Form Builder

Saran penambahan tipe field:

- phone
- address
- image
- file
- location
- signature

Untuk demo saat ini, field text/number/date/dropdown/radio/checkbox sudah cukup.

### 8.4 Device Monitoring

Jika IoT menjadi fokus lebih besar, perlu modul:

```text
Device
  -> id
  -> kode
  -> cabang_id
  -> metode
  -> status
  -> last_seen
  -> firmware_version
```

Namun untuk demo sekarang, cukup jelaskan bahwa integrasi perangkat fokus pada scan, bukan monitoring perangkat penuh.

### 8.5 Offline/PWA

HP NFC di lapangan bergantung pada internet dan HTTPS.

Saran future:

- PWA offline queue.
- Simpan scan sementara.
- Sync saat koneksi kembali.

---

## BAGIAN 9: BATASAN YANG PERLU DIJELASKAN

Batasan harus disampaikan sebagai tanda kedewasaan analisis, bukan kelemahan fatal.

### 9.1 Batasan Produk

1. LokaID belum menjadi engine universal penuh.
2. Tidak semua subject di konsep sudah diimplementasikan.
3. Tidak semua tipe field tersedia.
4. Reporting masih berdasarkan aktivitas/statistik, belum report builder generik.

### 9.2 Batasan Teknis

1. Web NFC butuh HTTPS dan browser yang mendukung, terutama Chrome Android.
2. iOS Safari belum mendukung Web NFC secara umum.
3. Scan manual masih rawan typo.
4. Device monitoring belum penuh.
5. Offline mode belum menjadi fitur utama.

### 9.3 Batasan Data dan Privasi

LokaID dapat menyimpan data sensitif seperti data anak dan kesehatan posyandu. Karena itu, perlu dijelaskan bahwa produksi nyata membutuhkan:

- Hak akses ketat.
- Audit log.
- Minimasi data.
- Persetujuan penggunaan data.
- Keamanan penyimpanan.

---

## BAGIAN 10: PRIORITAS REVISI KERJA

### Prioritas 1 — Wajib Sebelum Presentasi

1. Samakan nama LokaID di semua dokumen.
2. Tambahkan tabel status implementasi.
3. Tentukan flow demo utama: Posyandu Balita.
4. Tambahkan batasan dan future scope.
5. Hapus typo di `rencana.md`.

### Prioritas 2 — Bagus Jika Ada Waktu

1. Ringkas `ide.md` agar tidak terlalu panjang untuk pembaca lomba.
2. Tambahkan diagram posisi LokaID dalam Identiva.
3. Tambahkan contoh data dummy realistis.
4. Tambahkan section khusus "alur demo".

### Prioritas 3 — Pengembangan Lanjutan

1. Dynamic Question Engine penuh.
2. Workflow graph.
3. Device registry dan monitoring.
4. Report builder generik.
5. PWA offline queue.
6. Audit log data sensitif.

---

## BAGIAN 11: RANGKUMAN FINAL

LokaID tidak perlu dirombak. Revisi yang paling penting adalah merapikan cara menjelaskan produk.

Kesimpulan revisi:

1. **LokaID sudah kuat sebagai MVP dinamis.**
2. **Konsep di `ide.md` terlalu luas jika dianggap sudah seluruhnya selesai.**
3. **Dokumen perlu memisahkan fitur selesai, parsial, dan future.**
4. **Demo harus fokus ke Posyandu Balita, bukan semua use case.**
5. **Bansos Sembako cukup menjadi pembanding agar hubungan dengan Identiva/subsidi tetap terlihat.**
6. **Batasan seperti Web NFC, privacy, dan device monitoring harus disebutkan agar analisis terlihat matang.**

Kalimat final yang disarankan:

> LokaID adalah platform layanan lokal dinamis berbasis identitas digital. Implementasi saat ini sudah mencakup fondasi utama seperti Program Wizard, Form Builder, multi-aktivitas, wilayah, wali-anak, dan HP NFC. Pengembangan lanjutan diarahkan pada Dynamic Question Engine penuh, Workflow Engine generik, Device Monitoring, dan Report Builder.
