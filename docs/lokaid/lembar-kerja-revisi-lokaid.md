# LEMBAR KERJA PROGRES REVISI LOKAID

> Lembar kerja ini dipakai untuk memantau progres revisi dokumen dan persiapan proposal/demo LokaID. Status dibuat agar jelas mana yang sudah selesai, masih parsial, dan belum dikerjakan.

---

## STATUS LEGEND

| Status | Arti |
| :--- | :--- |
| Selesai | Sudah dikerjakan dan sudah masuk dokumen |
| Parsial | Sudah ada, tetapi masih perlu diperkuat/dirapikan |
| Belum | Belum dikerjakan |
| Future | Tidak wajib untuk proposal/demo sekarang, masuk roadmap |

---

## BAGIAN 1: DOKUMEN YANG SUDAH ADA

| File | Fungsi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| `docs/lokaid/ide.md` | Konsep besar LokaID | Selesai | Sudah ditambah ringkasan eksekutif, status implementasi, posisi LokaID dalam Identiva |
| `docs/lokaid/rencana.md` | Rencana implementasi teknis V1-V8 | Selesai | Sudah ditambah ringkasan status, tabel modul, fokus demo, roadmap lanjutan; typo `untu` dihapus |
| `docs/lokaid/analisis-lokaid.md` | Analisis lengkap LokaID | Selesai | Sudah ada masalah-solusi, gap, arsitektur, use case, SWOT, rekomendasi, risiko-mitigasi, roadmap revisi |
| `docs/lokaid/revisi-kerja-lokaid.md` | Catatan revisi kerja detail | Selesai | Sudah menjelaskan arah revisi, prioritas, batasan, dan future scope |
| `docs/lokaid/demo-lokaid.md` | Alur demo LokaID | Selesai | Sudah ada demo Posyandu Balita, Bansos Sembako, fallback, data dummy, checklist |
| `docs/platform/analisis-identiva.md` | Analisis Identiva | Selesai | Dipakai sebagai referensi fondasi Identiva, bukan fokus utama proposal LokaID |
| `docs/proposal/proposal-lokaid.md` | Draft proposal utama | Selesai | Draft Markdown sudah diperkuat dengan status implementasi, siklus kerja end-to-end, alur Posyandu, dan alur klaim Bansos lokal; belum dipindah ke `.docx` |

---

## BAGIAN 2: PROGRES REVISI KONSEP LOKAID

| No | Item Revisi | Status | Bukti / File | Next Action |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Samakan nama resmi LokaID | Selesai | `ide.md`, `analisis-lokaid.md`, `demo-lokaid.md` | Pastikan saat proposal final tidak menulis `local id` |
| 2 | Jelaskan posisi LokaID dalam Identiva | Selesai | `ide.md`, `analisis-lokaid.md`, `proposal-lokaid.md` | Ringkas ulang saat masuk `.docx` |
| 3 | Tambahkan ringkasan eksekutif | Selesai | `ide.md` | Bisa dipakai sebagai sumber abstrak proposal |
| 4 | Tambahkan status implementasi | Selesai | `ide.md`, `rencana.md`, `analisis-lokaid.md` | Samakan versi tabel jika nanti ada perubahan |
| 5 | Bedakan sudah/parsial/future | Selesai | `ide.md`, `revisi-kerja-lokaid.md` | Jaga agar tidak overclaim di proposal |
| 6 | Fokus demo Posyandu + Bansos | Selesai | `demo-lokaid.md`, `rencana.md`, `proposal-lokaid.md` | Siapkan data dummy yang sama dengan aplikasi |
| 7 | Hilangkan fokus subsidi BBM | Selesai | `proposal-lokaid.md` | Jangan jadikan BBM sebagai alur utama |

---

## BAGIAN 3: PROGRES DOKUMEN PROPOSAL

| No | Bab Proposal | Status | File Sumber | Catatan / Next Action |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Judul | Selesai | `proposal-lokaid.md` | Judul sementara: LokaID: Platform Layanan Masyarakat Lokal Berbasis Identitas Digital dan IoT |
| 2 | Deskripsi Singkat Ide | Selesai | `proposal-lokaid.md` | Sudah padat untuk draft; cek lagi saat pindah ke `.docx` agar maksimal 1 halaman |
| 3 | Latar Belakang | Selesai | `proposal-lokaid.md` | Sudah fokus layanan lokal manual |
| 4 | Tujuan dan Manfaat | Selesai | `proposal-lokaid.md` | Sudah dibagi per aktor |
| 5 | Batasan dan Sasaran Pengguna | Selesai | `proposal-lokaid.md` | Sudah jujur soal prototype, NFC, Dukcapil, data sensitif |
| 6 | Analisis Alat dan Bahan | Selesai | `proposal-lokaid.md` | Bisa diperkuat dengan alasan teknis lebih detail jika perlu |
| 7 | Konsep yang Diterapkan | Selesai | `proposal-lokaid.md` | Sudah ada Citizen ID, Identiva, Program Builder, Form Builder, IoT |
| 8 | SWOT | Selesai | `proposal-lokaid.md` | SWOT ringkas sudah cukup untuk proposal; dapat diperluas jika diminta |
| 9 | Implementasi dan Cara Kerja | Selesai | `proposal-lokaid.md` | Sudah ada DFD level 0, siklus kerja end-to-end, alur Posyandu, dan alur klaim Bansos lokal |
| 10 | Desain Software | Selesai | `proposal-lokaid.md` | Perlu diagram gambar jika masuk proposal final |
| 11 | Desain Hardware | Selesai | `proposal-lokaid.md` | Perlu gambar/foto alat jika tersedia |
| 12 | Representasi UI | Parsial | `proposal-lokaid.md` | Perlu screenshot dashboard/program/scan |
| 13 | Daftar Pustaka | Parsial | `proposal-lokaid.md` | Perlu cek format dan tambah sumber lokal/e-government |
| 14 | Lampiran | Parsial | `proposal-lokaid.md` | Perlu kumpulkan screenshot, diagram, foto alat, data dummy |
| 15 | Konversi ke `.docx` | Belum | `Proposal IoT.docx` | Setelah asset/screenshot siap atau isi disetujui, pindahkan ke template |

---

## BAGIAN 4: PROGRES DEMO LOKAID

| No | Item Demo | Status | Catatan / Next Action |
| :--- | :--- | :--- | :--- |
| 1 | Flow demo Posyandu Balita | Selesai | Sudah di `demo-lokaid.md` |
| 2 | Flow demo Bansos Sembako | Selesai | Sebagai pembanding, bukan fokus utama |
| 3 | Script narasi demo | Selesai | Sudah di `demo-lokaid.md` |
| 4 | Fallback demo NFC/manual | Selesai | Sudah ada tabel fallback |
| 5 | Data dummy Posyandu | Parsial | Sudah ada contoh, belum disamakan dengan seed/aplikasi |
| 6 | Data dummy Bansos | Parsial | Sudah ada contoh, belum disamakan dengan seed/aplikasi |
| 7 | Screenshot dashboard | Belum | Perlu jalankan aplikasi dan ambil screenshot |
| 8 | Screenshot Program Wizard | Belum | Perlu jalankan aplikasi dan ambil screenshot |
| 9 | Screenshot detail Posyandu | Belum | Perlu jalankan aplikasi dan ambil screenshot |
| 10 | Screenshot scan QR/HP NFC | Belum | Perlu jalankan aplikasi dan ambil screenshot |
| 11 | Foto alat IoT | Belum | Perlu dokumentasi perangkat fisik jika tersedia |

---

## BAGIAN 5: PROGRES TEKNIS APLIKASI

| No | Item Teknis | Status | Catatan / Next Action |
| :--- | :--- | :--- | :--- |
| 1 | Build aplikasi | Selesai | Sukses setelah perbaikan: `supermemory.ts` pakai `deleteBulk` + `experimental.workerThreads: false` (RAM terbatas) |
| 2 | Login akun demo LokaID | Selesai | `kelurahan` & `sukasari` / `mitra123` berhasil via NextAuth credentials (session JWT) |
| 3 | Program Posyandu tersedia | Selesai | Seed punya `Posyandu Balita Agustus` (Sukasari, sasaran anak) |
| 4 | Program Bansos tersedia | Selesai | Seed punya `Bantuan Sembako Agustus` (Sukasari, tujuan bantuan) |
| 5 | Flow daftar wali-anak | Selesai | API `/program/[id]/dependent` berhasil (4 wali, 5 anak); field values BB/TB/Gizi terbaca |
| 6 | Flow check-in anak | Selesai | API `/checkin` berhasil catat aktivitas wali ke-4 (Dewi, tidak_hadir → hadir) |
| 7 | Flow distribusi Bansos | Selesai | API `/distribusi` berhasil (Eko belum → sudah); klaim ganda ditolak (`kuota_habis`) |
| 8 | QR/HP NFC | Selesai | Generate QR token + validate berhasil; scan_url `/scan/[token]` ready; butuh test browser untuk NFC penuh |
| 9 | Fallback manual | Selesai | API `/cari-penduduk` (by UID/NIK) + pendaftaran peserta manual berhasil |

---

## BAGIAN 6: PRIORITAS EKSEKUSI BERIKUTNYA

### Prioritas 1 — Finalisasi Proposal Markdown (✅ Selesai)

1. ✅ Review final `docs/proposal/proposal-lokaid.md` — sudah diperkuat dengan status implementasi, siklus end-to-end, alur Bansos lokal.
2. ✅ Placeholder screenshot UI (7 gambar) sudah ditambahkan di Bab 7.3 + Lampiran A.
3. ✅ Diagram arsitektur + DFD Level 0 + DFD Level 1 Posyandu sudah ditambahkan di Lampiran B (format text/ASCII).
4. ⏳ Screenshot manual (7 gambar) — menunggu user ambil screenshot dan simpan ke `docs/proposal/aset/`.
5. ⏳ Rapikan Daftar Pustaka jika format lomba menentukan.
6. ⏳ Setelah screenshot selesai, pindahkan isi ke `Proposal IoT.docx`.

### Prioritas 2 — Verifikasi Aplikasi (✅ Selesai)

1. ✅ Build aplikasi sukses (production).
2. ✅ Login demo `kelurahan`, `sukasari`, `coblong` berhasil.
3. ✅ Seed data LokaID lengkap: 6 program, 13 peserta, 10 aktivitas, 5 dependent.
4. ✅ Test flow API (10 test) — 9 passed, 1 acceptable (klaim ganda ditolak dengan `kuota_habis`).
5. ✅ Flow utama berfungsi: cari penduduk → daftar peserta → scan/distribusi/checkin → status → aktivitas → QR token.

### Prioritas 3 — Asset Proposal

1. Ambil screenshot UI.
2. Buat diagram final arsitektur.
3. Buat DFD final yang rapi.
4. Kumpulkan foto alat IoT.
5. Siapkan lampiran.

### Prioritas 4 — Masukkan ke Template `.docx` (⏳ Siap Eksekusi)

1. ✅ Panduan konversi manual dibuat: `docs/proposal/panduan-konversi-docx.md`
2. ⏳ Copy-paste isi proposal dari `proposal-lokaid.md` ke `Proposal IoT.docx` (manual, mengikuti panduan)
3. ⏳ Insert gambar screenshot ke bagian Desain + Lampiran (setelah screenshot selesai)
4. ⏳ Insert diagram ASCII ke Lampiran B (atau convert ke gambar)
5. ⏳ Format tabel, heading, code blocks di Word
6. ⏳ Cek page numbers, footer, daftar isi (jika ada)
7. ⏳ Save final: `Proposal IoT - LokaID Final.docx`

---

## BAGIAN 7: NEXT ACTION YANG DISARANKAN

Langkah berikutnya yang paling masuk akal:

1. Cek aplikasi dan data demo.
2. Ambil screenshot dashboard, Program Wizard, detail Posyandu, aktivitas, dan scan QR/HP NFC.
3. Buat diagram final arsitektur dan DFD yang siap ditempel ke proposal.
4. Setelah asset siap, pindahkan isi `proposal-lokaid.md` ke template `Proposal IoT.docx`.

Alasan:

- Isi proposal Markdown sudah cukup matang untuk menjadi sumber utama.
- Asset visual masih dibutuhkan agar proposal `.docx` terlihat lengkap.
- Pindah ke `.docx` sebaiknya dilakukan setelah screenshot/diagram siap.
