# MODUL DESAIN WEB — IDENTIVA ("KARTU & JARINGAN")

Dokumen ini berisi cetak biru desain visual & UI web Identiva (dasar implementasi: Next.js + Tailwind CSS + shadcn/ui). Seluruh keputusan warna, tipografi, dan komponen bersumber dari sini.

---

## 1. IDENTITAS VISUAL

* **Kesan:** layanan publik yang tepercaya, modern, "satu kartu untuk semua".
* **Subjek:** kartu identitas (simulasi KTP/RFID), verifikasi kuota subsidi terpusat.
* **Signature:** **ilustrasi Kartu RFID** — kartu rounded dengan chip + gelombang NFC + garis scan berjalan (animasi CSS). Dipakai di hero landing dan sebagai motif logo. Elemen inilah yang diingat; sisanya tenang dan disiplin.

---

## 2. PALET (TOKEN WARNA)

| Token | Hex | Pemakaian |
| :--- | :--- | :--- |
| `primary` (teal tua) | `#0E5A50` | brand, tombol utama, navbar |
| `teal terang` | `#1F8A79` | hover / active |
| `background` (paper) | `#F7F5F0` | latar landing & dashboard |
| `surface` | `#FFFFFF` | kartu / panel |
| `ink` | `#14211F` | teks utama |
| `muted` | `#5A6B66` | teks sekunder |
| `accent` (amber) | `#E5A33D` | hak/kuota, highlight |
| `success` | `#2E7D32` | status aktif / valid |
| `destructive` | `#C0403C` | error / ditolak |
| `border` | `#DDE5E1` | garis halus |

*Aturan aksen:* amber hanya untuk "hak/kuota"; teal untuk aksi; tanpa dekorasi yang tak berfungsi.

---

## 3. TIPOGRAFI

| Peran | Font | Pemakaian |
| :--- | :--- | :--- |
| Display | *Newsreader* (serif berkarakter) | hero, angka besar, judul section |
| Body | *Public Sans* (font resmi pemerintahan) | semua teks UI |
| Mono | *IBM Plex Mono* | UID kartu, NIK, nominal, kode (data tabular) |

**Skala:** Display 48–64px · H2 24–32 · Body 16 · Small 13 · Mono 13–14.

*Catatan:* font di-*self-host* atau pakai fallback sistem agar demo offline tetap rapi (Google Fonts butuh internet).

---

## 4. PEMETAAN TOKEN SHADCN (CSS VARIABLES, MODE TERANG)

Komponen shadcn membaca token HSL berikut — semua bersumber dari palet di atas (default zinc dibuang):

| Variabel | Nilai (HSL) |
| :--- | :--- |
| `--background` | paper `#F7F5F0` |
| `--foreground` | ink `#14211F` |
| `--card` | `#FFFFFF` |
| `--popover` | `#FFFFFF` |
| `--primary` | teal `#0E5A50` |
| `--primary-foreground` | paper terang |
| `--secondary` | abu-hijau lembut |
| `--muted` | muted `#5A6B66` |
| `--accent` | amber `#E5A33D` |
| `--border` | `#DDE5E1` |
| `--ring` | primary teal |
| `--destructive` | `#C0403C` |

---

## 5. KOMPONEN SHADCN YANG DIGUNAKAN

**Global:** `Button`, `Input`, `Label`, `Card`, `Badge`, `Dialog`, `Select`, `Tabs`, `Table`, `Sheet` (sidebar mobile), `DropdownMenu`, `Toast`, `Skeleton`.

**Tabel rekap:** `Table` + **TanStack Table** (sort/filter) + tombol **Export CSV**.

**Form:** `react-hook-form` + `zod` (validasi NIK 16 digit).

---

## 6. DESAIN PER HALAMAN

### Landing `/` (publik)
* Nav minimal → **hero kartu RFID + garis scan** + tagline "Satu Kartu untuk Semua Subsidi" → section **Cara Kerja** (urutan 1-2-3, karena proses nyata) → program subsidi (Badge/card) → keunggulan mitra & warga → CTA daftar mitra + footer.

### Login `/login`
* Card tengah: Input username/password, tombol primary, pesan error jelas (bukan generik).

### Layout Dashboard
* Sidebar (nav: Ringkasan, Warga, Program, Rekap) + topbar (nama mitra, role, logout); `Sheet` saat mobile.

### Ringkasan `/dashboard`
* Grid **StatCard**: transaksi hari ini, total nominal, total diskon (dasar klaim), sisa kuota terpakai.

### Warga `/dashboard/warga`
* Tabs: *Warga Mitra* (tabel + cari) · *Scan Terbaru* (dari Alat B) · *Daftar Baru*.
* Dialog form (NIK tampil mono, validasi zod), Badge status aktif/diblokir.

### Program `/dashboard/program`
* Tabel/daftar program + Dialog edit diskon (Input + Select satuan).

### Rekap `/dashboard/rekap`
* Filter (hari + metode Select) → 3 StatCard (total nominal, diskon, diterima per metode) → tabel transaksi (nominal mono) → tombol Export CSV.

---

## 7. SIGNATURE: KOMPONEN "KARTU RFID"

* Kartu rounded, bg teal, chip amber, gelombang NFC, **garis scan berjalan** (CSS).
* Menghormati `prefers-reduced-motion` (animasi dimatikan bila disetel).
* Dipakai: hero landing (besar), favicon/logo, dan ikon kosong di dashboard ("scan kartu dulu").

---

## 8. PRINSIP DESAIN

* **Responsif** sampai mobile; **focus ring** jelas; animasi minim & bermakna (satu signature, sisanya tenang).
* Kesalahan/emptiness sebagai petunjuk arah, bukan mood: "Data kosong → ajakan mengisi".
* Tombol menyatakan aksi nyata: "Simpan Warga", bukan "Submit"; istilah konsisten di seluruh alur.
* Salin (copy) dari sisi pengguna: mitra mengelola "warga & program", bukan "CRUD record".

---

## 9. IMPLEMENTASI (DI-MERGE KE PRIORITAS)

* **P0/P1:** setup token CSS + instal shadcn (Button, Input, Card, Table, Dialog, Tabs, Badge, Select, Sheet, Toast), landing skeleton, dashboard (sidebar, tabel, dialog form).
* **P2:** hero kartu RFID + animasi + polish landing + halaman ringkasan (StatCard).
