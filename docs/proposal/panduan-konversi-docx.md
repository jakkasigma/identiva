# Panduan Konversi Proposal Markdown ke DOCX

## File Sumber & Target

- **Sumber:** `docs/proposal/proposal-lokaid.md`
- **Target:** `docs/lokaid/Proposal IoT.docx`

---

## Langkah Konversi

### 1. Buka Template DOCX

Buka `docs/lokaid/Proposal IoT.docx` di Microsoft Word.

Template ini punya struktur judul placeholder:
- ACCESSGATE IOT: SISTEM VERIFIKASI BERBASIS IDENTITAS TERINTEGRASI WEB SOEPATMEN
- DESKRIPSI SINGKAT IDE
- LATAR BELAKANG
- TUJUAN DAN MANFAAT IDE
- dst.

### 2. Ganti Judul Utama

**Di DOCX (halaman pertama):**
- Ganti: `ACCESSGATE IOT: SISTEM VERIFIKASI BERBASIS IDENTITAS TERINTEGRASI WEB SOEPATMEN`
- Jadi: `LokaID: Platform Layanan Masyarakat Lokal Berbasis Identitas Digital dan IoT`

**Di DOCX (info tim):**
- Tetap: `TIM SOEPATMEN`
- Tetap: Afriza Marshal Verdiasta, Rio Ardiansyah, Virgie Herwan Zakka Shaputra
- Tetap: Universitas Mercu Buana Yogyakarta

### 3. Copy Section per Section

Buka `proposal-lokaid.md` di editor teks (VS Code, Notepad++, dll).

#### Section 1: DESKRIPSI SINGKAT IDE

**Di Markdown (baris 9-53):**
```
## 1. DESKRIPSI SINGKAT IDE
...
```

**Copy dari Markdown:**
- Semua paragraf di bawah heading "1. DESKRIPSI SINGKAT IDE"
- Sampai sebelum "## 2. LATAR BELAKANG"

**Paste ke DOCX:**
- Cari heading "DESKRIPSI SINGKAT IDE"
- Hapus placeholder text di bawahnya
- Paste isi dari Markdown
- **Catatan:** untuk tabel Markdown (misalnya tabel "Aspek | Deskripsi"), copy manual baris per baris ke tabel Word atau convert ke paragraph list

#### Section 2: LATAR BELAKANG

**Di Markdown (baris 55-95):**
```
## 2. LATAR BELAKANG
...
```

**Copy & Paste** ke bagian "LATAR BELAKANG" di DOCX.

#### Section 3: TUJUAN DAN MANFAAT IDE

**Di Markdown (baris 97-150):**
```
## 3. TUJUAN DAN MANFAAT IDE
...
```

**Copy & Paste** ke bagian "TUJUAN DAN MANFAAT IDE" di DOCX.

**Handling sub-sections:**
- Markdown: `### 3.1 Tujuan Umum` → Word: gunakan style "Heading 3" atau bold
- Markdown: tabel `| Aktor | Manfaat |` → Word: buat tabel 2 kolom atau convert ke bullet list

#### Section 4: BATASAN DAN SASARAN PENGGUNA

**Di Markdown (baris 152-199):**
```
## 4. BATASAN DAN SASARAN PENGGUNA
...
```

**Copy & Paste** ke bagian "BATASAN DAN SASARAN PENGGUNA" di DOCX.

#### Section 5: ANALISIS

**Di Markdown (baris 201-241):**
```
## 5. ANALISIS
...
```

**Copy & Paste** ke bagian "ANALISIS" di DOCX.

**Sub-sections:**
- 5.1 Analisis Alat dan Bahan
- 5.2 Konsep yang Diterapkan
- 5.3 Komponen Sistem
- 5.4 Analisis SWOT
- 5.5 Risiko dan Mitigasi
- 5.6 Status Implementasi Prototype

**Handling tabel:**
- Tabel di Markdown → buat tabel di Word dengan kolom/row yang sesuai

#### Section 6: IMPLEMENTASI DAN CARA KERJA

**Di Markdown (baris 244-435):**
```
## 6. IMPLEMENTASI DAN CARA KERJA
...
```

**Copy & Paste** ke bagian "IMPLEMENTASI DAN CARA KERJA" di DOCX.

**Sub-sections:**
- 6.1 Gambaran Umum Alur Sistem
- 6.2 Siklus Kerja LokaID End-to-End
- 6.3 DFD Level 0
- 6.4 DFD Level 1 — Posyandu Balita
- 6.5 Cara Kerja Program Posyandu
- 6.6 Cara Kerja Program Bansos Sembako
- 6.7 Algoritma Validasi Peserta
- 6.8 Output Sistem

**Handling code blocks (```text ... ```):**
- Copy isi code block → paste ke Word → set font "Courier New" atau "Consolas" (monospace)
- Atau: screenshot code block dari Markdown preview → insert image ke Word

#### Section 7: DESAIN

**Di Markdown (baris 437-536):**
```
## 7. DESAIN
...
```

**Copy & Paste** ke bagian "DESAIN" di DOCX.

**Sub-sections:**
- 7.1 Desain Software
- 7.2 Arsitektur Perangkat Keras
- 7.3 Representasi User Interface
- 7.4 Desain Data Utama
- 7.5 Desain Alur Demo

**Handling gambar (placeholder):**
- `![Dashboard LokaID](aset/dashboard-lokaid.png)` → Insert → Picture di Word
- Jika file gambar belum ada, sisakan ruang kosong atau insert placeholder text "[Gambar: Dashboard LokaID]"

#### Section 8: DAFTAR PUSTAKA

**Di Markdown (baris 540-552):**
```
## 8. DAFTAR PUSTAKA
...
```

**Copy & Paste** ke bagian "DAFTAR PUSTAKA" di DOCX.

**Format numbered list:**
- 1. Arduino. (2024). ...
- 2. MDN Web Docs. (2024). ...
- dst.

#### Section 9: LAMPIRAN

**Di Markdown (baris 556-655+):**
```
## 9. LAMPIRAN
...
```

**Copy & Paste** ke bagian "LAMPIRAN" di DOCX.

**Sub-sections:**
- Lampiran A — Screenshot Aplikasi (A.1 - A.7)
- Lampiran B — Diagram Sistem (B.1 - B.3)
- Lampiran C — Data Demo (C.1 - C.4)

**Handling:**
- Screenshot: Insert → Picture (jika file sudah ada di `docs/proposal/aset/`)
- Diagram text/ASCII: copy → paste dengan font monospace (Courier New)
- Tabel: convert ke tabel Word

---

## Tips Formatting

1. **Heading levels:**
   - `## 1. JUDUL BAB` → Word Style "Heading 1"
   - `### 1.1 Sub-judul` → Word Style "Heading 2"
   - `#### A.1 Detail` → Word Style "Heading 3"

2. **Tabel Markdown → Word:**
   - Insert Table di Word
   - Copy header row → paste ke Word table row 1
   - Copy data rows → paste ke Word table rows berikutnya
   - Apply table style "Grid Table" atau sejenisnya

3. **Code blocks:**
   - Font: Courier New atau Consolas
   - Size: 9-10pt
   - Background: abu-abu muda (optional)

4. **Gambar:**
   - Insert → Pictures → pilih file dari `docs/proposal/aset/`
   - Resize sesuai kebutuhan (biasanya width 80-90% halaman)
   - Add caption: "Gambar X. [caption]"

5. **Bullet/Numbered Lists:**
   - Markdown `- item` → Word bullet list
   - Markdown `1. item` → Word numbered list

---

## Checklist Akhir

Setelah selesai copy-paste, cek:

- [ ] Judul utama sudah diganti ke "LokaID: Platform Layanan..."
- [ ] Semua 9 bab sudah dicopy (Deskripsi Singkat s.d. Lampiran)
- [ ] Tabel sudah diconvert ke tabel Word (bukan plain text)
- [ ] Code blocks sudah diformat monospace
- [ ] Placeholder gambar sudah diinsert (atau dikosongkan dengan caption)
- [ ] Heading styles sudah diapply (Heading 1, 2, 3)
- [ ] Page numbers sudah otomatis (biasanya template sudah set)
- [ ] Footer/header team name masih "TIM SOEPATMEN"
- [ ] Daftar pustaka sudah numbered list
- [ ] Lampiran sudah lengkap (A, B, C)

---

## Alternatif: Konversi Otomatis (Pandoc)

Jika kamu punya Pandoc installed:

```bash
pandoc docs/proposal/proposal-lokaid.md -o docs/proposal/proposal-lokaid-output.docx --reference-doc="docs/lokaid/Proposal IoT.docx"
```

**Catatan:** hasil Pandoc perlu manual review karena formatting mungkin tidak sempurna (tabel, code blocks, gambar placeholder).

---

## File yang Dihasilkan

Setelah selesai, save as:
- `docs/lokaid/Proposal IoT - LokaID Final.docx`
- atau overwrite `Proposal IoT.docx` langsung

Backup file asli sebelum overwrite jika perlu.
