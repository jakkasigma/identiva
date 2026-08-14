# DEMO LOKAID — POSYANDU BALITA & BANSOS SEMBAKO

> Dokumen ini berisi alur demo LokaID untuk presentasi/lomba. Fokus demo dibuat sengaja sempit agar produk terasa jelas: **Posyandu Balita** sebagai demo utama dan **Bansos Sembako** sebagai demo pembanding.

---

## BAGIAN 1: TUJUAN DEMO

Tujuan demo bukan menampilkan semua fitur LokaID, tetapi membuktikan tiga hal:

1. LokaID dapat membuat program layanan lokal secara dinamis.
2. Data warga memakai identitas terpusat dari Identiva.
3. Aktivitas lapangan dapat dicatat melalui scan/manual dan terlihat di dashboard.

Kalimat pembuka demo:

> Di sini kami tidak membuat aplikasi posyandu yang hardcoded. Kami membuat LokaID, platform layanan lokal dinamis. Jika hari ini programnya Posyandu Balita, besok bisa menjadi Bansos Sembako, Pendataan UMKM, atau Peminjaman Fasilitas tanpa membuat aplikasi baru dari awal.

---

## BAGIAN 2: DEMO UTAMA — POSYANDU BALITA

### 2.1 Alasan Memilih Posyandu

Posyandu Balita adalah use case paling kuat karena menunjukkan fitur unik LokaID:

- Program Wizard.
- Sasaran anak.
- Relasi wali-anak.
- Form Builder untuk data kesehatan.
- Check-in kegiatan.
- Aktivitas tercatat.
- Bisa memakai scan Citizen ID wali.

### 2.2 Masalah yang Diceritakan

Masalah lapangan:

```text
Data posyandu sering dicatat manual.
Data anak terpisah dari data wali.
Riwayat kehadiran dan pengukuran sulit dilihat ulang.
Petugas harus membawa kertas atau input ulang berkali-kali.
```

Solusi LokaID:

```text
Wali memakai Citizen ID.
Anak terhubung sebagai dependent.
Program Posyandu dibuat melalui wizard.
Field BB/TB/catatan dibuat lewat Form Builder.
Check-in dan pendataan tercatat sebagai aktivitas.
```

### 2.3 Flow Demo Step-by-Step

```text
1. Admin wilayah login.
2. Buka menu Program LokaID.
3. Buat Program Posyandu Balita.
4. Pilih tujuan: Kegiatan.
5. Pilih sasaran: Anak.
6. Tambahkan data tambahan: Berat Badan, Tinggi Badan, Catatan Kesehatan.
7. Simpan program.
8. Daftarkan wali dari data Penduduk pusat.
9. Tambahkan anak/dependent ke wali.
10. Simulasikan warga datang ke Posyandu.
11. Scan Citizen ID wali melalui alat RFID/NFC (koneksi USB/Bluetooth). Karena perangkat fisik belum tersedia saat ini, UID dapat disimulasikan pada tab "Scan Terbaru" di menu Peserta; tersedia fallback input manual.
12. Pilih anak.
13. Catat check-in.
14. Isi data kesehatan.
15. Buka riwayat aktivitas.
16. Tunjukkan aktivitas tercatat di dashboard.
```

### 2.4 Script Narasi Saat Demo

```text
Pertama, admin wilayah membuat Program Posyandu Balita.
Di LokaID, program tidak hardcoded. Admin memilih tujuan program dan sasaran peserta.

Karena sasaran program ini adalah anak, LokaID menghubungkan anak dengan wali yang memiliki Citizen ID.
Jadi kartu identitas tetap dipegang wali, tetapi aktivitas yang dicatat bisa milik anak.

Admin juga dapat menambahkan field data kesehatan seperti berat badan dan tinggi badan.
Field ini tidak perlu dibuat di database baru, karena LokaID memakai Form Builder.

Saat warga datang ke posyandu, petugas memindai kartu wali pada alat RFID/NFC berbasis ESP32 melalui koneksi USB/Bluetooth. UID hasil scan tampil pada tab "Scan Terbaru" untuk dilengkapi, atau petugas memakai input manual sebagai fallback.
Setelah itu sistem mencatat check-in anak dan data kesehatan.

Hasilnya, aktivitas posyandu tidak lagi tersebar di kertas, tetapi tersimpan sebagai riwayat digital.
```

### 2.5 Bagian yang Harus Ditekankan

Tekankan:

- Anak tidak harus punya kartu sendiri.
- Citizen ID wali menjadi penghubung.
- Field data kesehatan dibuat dinamis.
- Posyandu hanya salah satu contoh program.

Jangan terlalu lama membahas:

- Semua jenis aktivitas lain.
- Semua jenis field future.
- Detail teknis database terlalu dalam.

---

## BAGIAN 3: DEMO PEMBANDING — BANSOS SEMBAKO

### 3.1 Alasan Memilih Bansos

Bansos Sembako dipakai sebagai pembanding karena mudah dipahami dan dekat dengan konteks subsidi/bantuan.

Nilai yang ditunjukkan:

- Program bantuan.
- Peserta dari data penduduk pusat.
- Status penerimaan.
- Aktivitas distribusi.

### 3.2 Flow Demo Ringkas

```text
1. Admin membuat Program Bansos Sembako.
2. Pilih tujuan: Bantuan.
3. Pilih aktivitas: Verifikasi + Distribusi.
4. Daftarkan warga dari data Penduduk pusat.
5. Warga datang mengambil bantuan.
6. Petugas scan Citizen ID via alat / pilih manual.
7. Sistem cek peserta program.
8. Petugas catat distribusi.
9. Status peserta berubah menjadi sudah menerima.
10. Aktivitas distribusi muncul di dashboard.
```

### 3.3 Script Narasi Bansos

```text
Setelah Posyandu, contoh kedua adalah Bansos Sembako.
Ini menunjukkan bahwa LokaID tidak hanya untuk kegiatan kesehatan.

Admin dapat membuat program bantuan dengan aktivitas verifikasi dan distribusi.
Warga yang sudah terdaftar di data pusat tidak perlu diinput ulang.

Saat warga datang, petugas cukup memverifikasi identitas lalu mencatat distribusi.
Status penerimaan tersimpan sehingga rekap bantuan lebih transparan.
```

---

## BAGIAN 4: URUTAN PRESENTASI YANG DISARANKAN

Gunakan urutan ini agar demo terasa mengalir:

```text
1. Jelaskan masalah layanan lokal manual.
2. Jelaskan Identiva sebagai fondasi identitas.
3. Perkenalkan LokaID sebagai program builder layanan lokal.
4. Demo Posyandu Balita.
5. Tunjukkan data wali-anak dan Form Builder.
6. Tunjukkan aktivitas check-in/pendataan.
7. Demo singkat Bansos Sembako sebagai pembanding.
8. Tutup dengan positioning: satu identitas, banyak layanan lokal.
```

### Script Penutup

```text
Dari dua contoh ini, LokaID terlihat bukan aplikasi satu fungsi.
Posyandu dan Bansos memakai platform yang sama, tetapi konfigurasinya berbeda.

Inilah kekuatan LokaID: satu identitas warga dapat dipakai untuk berbagai layanan lokal,
sementara admin cukup membuat program sesuai kebutuhan wilayah.
```

---

## BAGIAN 5: FALLBACK DEMO

Demo lapangan bisa terganggu oleh perangkat, browser, atau koneksi. Siapkan fallback berikut.

| Risiko | Fallback |
| :--- | :--- |
| Alat ESP32 belum tersedia | Simulasikan UID pada tab "Scan Terbaru" atau input UID/NIK manual |
| HP tidak support NFC | HP NFC bersifat opsional; pakai input manual UID/NIK |
| HTTPS tidak tersedia | Jelaskan HP NFC butuh HTTPS, tampilkan flow manual |
| QR tidak bisa dimuat | Pakai link `/scan/[token]` langsung |
| Data dummy tidak muncul | Siapkan peserta manual di dashboard |
| Internet lambat | Gunakan data yang sudah seed/local |

Kalimat aman saat fallback:

> Untuk demo offline/perangkat scanner yang belum tersedia, LokaID menyediakan input manual atau simulasi UID pada tab "Scan Terbaru" sebagai fallback. Di produksi, alat ESP32 terhubung lewat koneksi USB/Bluetooth ke bridge PC; HP NFC menjadi alternatif opsional untuk operasional lapangan.

---

## BAGIAN 6: DATA DUMMY YANG DISARANKAN

### Posyandu Balita

```text
Wali:
Nama: Siti Aminah
NIK: 3273010101900001
UID: UID-SITI-001

Anak:
Nama: Aisyah Putri
Tanggal lahir: 2022-08-12
Jenis kelamin: P

Field kesehatan:
Berat badan: 12.4 kg
Tinggi badan: 88 cm
Catatan: Sehat, perlu vitamin rutin
```

### Bansos Sembako

```text
Penerima:
Nama: Budi Santoso
NIK: 3273011502850002
UID: UID-BUDI-002

Program:
Bansos Sembako Agustus

Status:
Belum menerima -> Sudah menerima
```

---

## BAGIAN 7: HAL YANG JANGAN DIOVERCLAIM

Jangan klaim:

- Semua dynamic engine sudah final.
- Semua workflow bisa bebas tanpa batas.
- Semua perangkat IoT sudah dimonitor online/offline.
- Alat ESP32 sudah terpasang dan beroperasi penuh di lapangan.
- Semua tipe data seperti image/file/location sudah siap.
- Web NFC pasti berjalan di semua HP.

Gunakan kalimat aman:

> Implementasi saat ini sudah mencakup fondasi Dynamic Program Builder. Beberapa engine lanjutan seperti Dynamic Question Engine penuh, Workflow Engine generik, Device Monitoring, dan Report Builder masih menjadi roadmap.

---

## BAGIAN 8: CHECKLIST SEBELUM DEMO

- [ ] Akun admin LokaID bisa login.
- [ ] Program Posyandu tersedia atau bisa dibuat.
- [ ] Data wali tersedia.
- [ ] Data anak/dependent tersedia.
- [ ] Field BB/TB/catatan tersedia.
- [ ] Aktivitas check-in bisa dicatat.
- [ ] Bansos Sembako tersedia sebagai pembanding.
- [ ] Tab "Scan Terbaru" berisi UID dummy dari alat.
- [ ] Fallback manual siap.
- [ ] Narasi batasan alat (USB/Bluetooth) & HP NFC siap.
- [ ] Dashboard aktivitas bisa ditunjukkan.
