# IDENTIVA — KONSEP PLATFORM SUBSIDI BERBASIS IDENTITAS

> **Catatan penting:** Dokumen ini adalah **dokumen konsep/eksplorasi terpisah** dari proyek IoT utama (`modul.md`). Proyek IoT koper trainer kit tetap utuh dan tidak dirombak. Dokumen ini menggambarkan arah pengembangan platform lebih luas di masa depan.

---

## BAGIAN 1: GAMBARAN UMUM

**Identiva** adalah platform distribusi subsidi berbasis identitas digital. Konsep intinya:

* **Satu kartu untuk semua** — warga memegang satu kartu identitas (RFID/NFC sebagai simulasi KTP) yang berlaku di semua titik layanan subsidi.
* **Multi-jenis subsidi** — tidak terbatas pada BBM/SPBU, tetapi juga bansos sembako, gas LPG 3 kg, pupuk, dan jenis subsidi lain.
* **Mitra beragam skala** — dari SPBU nasional hingga organisasi skala kecil (RT, kecamatan, komunitas) dapat menjadi mitra penyalur.
* **Berbasis cloud & IoT** — verifikasi kuota real-time melalui cloud, eksekusi fisik melalui perangkat IoT di lokasi.

### Nilai Utama (Value Proposition)

| Masalah di lapangan | Solusi Identiva |
| :--- | :--- |
| Subsidi tidak tepat sasaran | Verifikasi identitas terpusat dengan status warga aktif/diblokir |
| Kuota ganda (ambil berulang di lokasi berbeda) | Kuota real-time tersinkronisasi cloud, otomatis dipotong |
| Pencatatan manual & tidak transparan | Riwayat transaksi digital, bisa dimonitor warga & pengelola |

---

## BAGIAN 2: EKOSISTEM & AKTOR

```
                        ┌──────────────────────┐
                        │   ADMIN PLATFORM      │
                        │   (Identiva Pusat)    │
                        └──────────┬───────────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
      ┌───────┴───────┐   ┌───────┴───────┐   ┌─────────┴─────────┐
      │ MITRA BESAR    │   │ MITRA KECIL   │   │ WARGA (PENERIMA)  │
      │ SPBU / Retail  │   │ RT / Kecamatan│   │ Pemegang kartu    │
      │                │   │ / Organisasi  │   │                    │
      │ Terminal IoT   │   │ Admin daftar  │   │ Cek saldo via HP   │
      │ (koper kit)    │   │ warga via NFC │   │ NFC / web          │
      └────────────────┘   └───────────────┘   └────────────────────┘
```

1. **Warga (Penerima Subsidi)** — pemegang kartu identitas; tap kartu untuk mengambil subsidi; cek saldo via HP.
2. **Admin Mitra Kecil** — pihak RT/kecamatan/organisasi yang terdaftar; mendaftarkan warganya yang berhak subsidi.
3. **Mitra Besar** — SPBU, minimarket, gudang pupuk; menyediakan titik layanan dengan terminal.
4. **Admin Platform** — mengelola approval mitra, program subsidi, dan data pusat.

---

## BAGIAN 3: FITUR UTAMA PLATFORM

### 3.1 Landing Page (Web)
* Informasi program, keunggulan Identiva, cara daftar mitra, cara daftar warga.
* Halaman publik yang menanamkan kepercayaan (transparansi, mitra resmi).

### 3.2 Pengajuan & Langganan Mitra
* Mitra mendaftar lewat web/app (form: nama organisasi, skala, jenis layanan, area).
* Admin platform melakukan **approval**.
* **Model langganan** (subscription): mitra berlangganan kuota/penyaluran per periode — menjadi dasar monetisasi platform.
* Konsep primer/sekunder:
  * **Skala besar (primer)** — butuh approval & audit lebih ketat oleh admin pusat.
  * **Skala kecil (sekunder)** — self-service, bisa aktif lebih cepat.
  * *Status: masih konsep, perlu dikaji saat implementasi.*

### 3.3 Pendaftaran Warga oleh Admin Mitra
* Admin mitra membuka web/PWA di HP-nya.
* **Scan KTP (NFC)** warga → data identitas terbaca otomatis.
* Admin input kategori subsidi yang berhak → warga resmi terdaftar di **ruang data mitra** tersebut.

### 3.4 Cek Saldo & Riwayat oleh Warga
* Warga buka web/PWA di HP → **tap kartu NFC** → lihat saldo subsidi, kuota tersisa, dan riwayat transaksi.
* Tanpa perlu menginstal aplikasi (berbasis web).

### 3.5 Perangkat IoT (2 perangkat, 1 koper 2 mode)
* **Alat A — Terminal Pembayaran:** perangkat IoT (ESP32 + RFID + Keypad + LCD) sebagai **terminal verifikasi subsidi** di titik layanan (tanpa aktuator/relay). Petugas input nominal → tap kartu → verifikasi cloud → jika valid & kuota cukup, sistem menampilkan diskon & total bayar → petugas pilih metode (cash/QRIS) → transaksi tercatat.
* **Alat B — Terminal Pendataan:** perangkat IoT (ESP32 + RFID + LCD) untuk **pendaftaran warga**. Scan kartu → UID masuk web (*Scan Terbaru*) → petugas melengkapi data KTP di web.
* **Koneksi:** Bluetooth ke PC (pairing ala printer) → program bridge di PC meneruskan ke API (token mitra). Rincian di `modul.md` & `../web/docs/web-modul.md`.

---

## BAGIAN 4: ALUR LENGKAP SISTEM

```
[Mitra daftar via web]
        │
        ▼
[Admin platform approve] ────── (skala besar: audit lebih ketat)
        │
        ▼
[Admin mitra daftar warga]
        │  scan kartu (Alat B) / form web
        ▼
[Data warga terpusat di main + enrollment mitra] ── (terisolasi per mitra)
        │
        ├───────────────────────────────────────┐
        ▼                                       ▼
[Warga ambil subsidi]                    [Warga cek saldo]
   Alat A (terminal pembayaran)              HP (PWA + NFC)
   input nominal (keypad)                    lihat saldo & riwayat
   tap kartu ──► cloud verifikasi           tanpa perlu ke lokasi
   valid + kuota?
      │
      ├─ VALID  ► tampil diskon & total bayar, pilih metode (cash/QRIS), kuota dipotong
      └─ INVALID ► "Akses Ditolak", transaksi tidak tercatat
        │
        ▼
[Transaksi tercatat (dgn metode bayar) & transparan]
        ▼
[Rekap harian per metode + klaim subsidi di dashboard mitra]
```

---

## BAGIAN 5: SKEMA DATA MULTI-TENANT (KONSEP)

Setiap mitra memiliki **ruang datanya sendiri** (`mitra_id`). Data KTP warga **disimpan terpusat di `penduduk` (main)** — bukan disalin per mitra. Mitra memakai data main dan menautkannya ke mitranya (enrollment). Data yang ditautkan tidak bercampur antar-mitra.

### Tabel Konsep

| Tabel | Field Utama |
| :--- | :--- |
| **mitra** | `id`, `nama`, `skala` (besar/kecil), `jenis_layanan`, `langganan`, `status` (pending/aktif/diblokir) |
| **penduduk** *(main)* | `id`, `nik` (UNIQUE, paten), `nama`, `alamat`, `uid_kartu` (UNIQUE, paten) |
| **warga** *(enrollment)* | `id`, `penduduk_id`, `mitra_id`, `program_subsidi_id`, `status` |
| **program_subsidi** | `id`, `nama` (BBM/Bansos/LPG/Pupuk), `satuan`, `periode`, `diskon` (%) diatur admin |
| **kuota** | `id`, `warga_id`, `kuota_total`, `kuota_terpakai`, `periode` |
| **transaksi** | `id`, `warga_id`, `mitra_id`, `waktu`, `nominal`, `diskon`, `total_bayar`, `metode_bayar` (cash/qris), `jenis` |

*`nik` dan `uid_kartu` paten (immutable) untuk siapa pun; data deskriptif (`nama`, `alamat`) hanya bisa dikoreksi admin platform. Rincian implementasi di `../web/docs/web-modul.md`.*

### Contoh Endpoint (Konsep)
* `POST /api/check-quota` — verifikasi UID kartu di terminal IoT.
* `POST /api/mitra/register` — pengajuan mitra baru.
* `POST /api/mitra/:id/warga` — admin mitra daftarkan warga (scan NFC).
* `GET /api/warga/saldo` — cek saldo lewat HP.

---

## BAGIAN 6: ROADMAP PENGEMBANGAN

### Fase A — Proyek IoT Inti (sudah ada di `modul.md`)
1. Uji komponen lokal → 2. integrasi koneksi ke PC (bridge Bluetooth/USB) → 3. server mockup → 4. logika, keypad & tampilan (2 mode) → 5. uji alur ujung-ke-ujung → 6. mockup fisik.

### Fase B — Pondasi Platform
6. Landing page statis (gambaran produk).
7. Backend cloud multi-tenant + skema data dasar.

### Fase C — Fitur Mitra
8. Pengajuan mitra via web + approval admin (termasuk **onboarding/survei setting** per mitra: `periode_reset`, `kuota_total`, `satuan`, `diskon`).
9. Dashboard admin mitra (kelola warga & program).
10. Halaman **Rekap & Laporan** di dashboard mitra: filter per hari & per metode (cash/QRIS), total nominal, total diskon (dasar klaim subsidi), total diterima per metode, daftar transaksi (UID, nama, nominal, diskon, total, metode, waktu), tombol export CSV — dipakai petugas untuk rekap kas harian & pengajuan klaim subsidi ke admin platform.

### Fase D — Fitur Warga
11. Pendaftaran warga via scan NFC di HP (PWA).
12. Cek saldo & riwayat via HP (PWA + NFC).

### Fase E — Integrasi IoT
13. Alat A & Alat B terhubung ke backend platform via **bridge PC** (Bluetooth + token mitra) — bukan server mockup.
14. Riwayat transaksi real-time dari terminal (termasuk `metode_bayar`) → dashboard & rekap; UID scan pendataan → panel **Scan Terbaru**.

---

## BAGIAN 7: CATATAN & BATASAN

* **Keamanan:** UID kartu RFID/NFC dapat dipalsukan — untuk produksi nyata diperlukan autentikasi lebih kuat (HTTPS, enkripsi, dsb.). Pada tahap prototipe/lomba cukup sebagai simulasi.
* **Data warga:** data KTP disimpan **terpusat di `penduduk` (main)**; mitra menautkan data main ke mitranya (enrollment) dan data yang ditautkan terisolasi per mitra. Mitra tidak dapat mengubah data KTP; koreksi hanya oleh admin platform. Rincian di `../web/docs/web-modul.md`.
* **NFC vs RFID:** kartu trainer kit saat ini RFID-RC522; pembacaan di HP membutuhkan kartu berbasis NFC (kompatibel 13,56 MHz). Perlu penyesuaian kartu jika fitur HP diaktifkan.
* **Status konsep:** alur mitra primer/sekunder dan langganan masih ide awal, perlu diuji kelayakannya.
* **Tidak mengubah proyek IoT:** dokumen ini murni eksplorasi platform; koper trainer kit tetap berjalan sesuai `modul.md`.
