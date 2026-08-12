# Sistem Preferensi Scan Multi-Metode

Identiva mendukung **3 metode scan kartu RFID** untuk fleksibilitas operasional berbagai jenis mitra.

---

## Metode Scan yang Tersedia

### 1. Alat ESP32 (`alat_esp32`)

**Hardware:** RFID reader RC522/PN532 + ESP32 microcontroller

**Koneksi:**
- ESP32 → Bluetooth → PC bridge → HTTP API server
- Fallback: ESP32 → USB Serial → PC bridge → HTTP API

**Use Case:**
- Lokasi tetap (kantor kelurahan, SPBU)
- Transaksi BBM (butuh konsistensi & audit)
- Volume tinggi (ratusan scan per hari)

**Kelebihan:**
- Dedicated hardware (reliable)
- Tidak bergantung HP/laptop petugas
- Bisa standalone (display + button di alat)

**Kekurangan:**
- Biaya hardware (~$15-30 per unit)
- Setup awal (pairing Bluetooth, install bridge)
- Tidak mobile (terikat lokasi)

**Auth:** Token cabang (hardcoded di firmware ESP32)

**API:** `POST /api/uid-scan` → `ScanPending` → petugas lengkapi di dashboard

---

### 2. HP NFC (`hp_nfc`)

**Hardware:** Smartphone dengan NFC (Android/iOS)

**Koneksi:**
- Browser HP → Web NFC API → langsung HTTPS ke server

**Use Case:**
- Mobile fieldwork (posyandu, kunjungan rumah, event outdoor)
- Mitra tanpa budget hardware
- Pendataan fleksibel (tidak terikat lokasi)

**Kelebihan:**
- Biaya nol (pakai HP yang ada)
- Setup cepat (scan QR → langsung bisa)
- Mobile (bawa kemana saja)

**Kekurangan:**
- Butuh HP dengan NFC (tidak semua HP support)
- Browser terbatas (Chrome Android 89+, iOS Safari tidak support)
- Butuh sinyal internet (atau PWA offline mode)

**Auth:** QR token (expire 30 hari, tied to program+cabang)

**API:** `POST /api/lokaid/qr/:token/scan-register` → langsung daftar peserta

**Alur:**
```
Admin generate QR per program 
  → Petugas scan QR 
  → Buka halaman scan NFC 
  → Tap kartu ke HP 
  → Peserta terdaftar
```

---

### 3. Input Manual (`manual`)

**Hardware:** Keyboard (laptop/PC/tablet)

**Use Case:**
- Fallback jika hardware tidak tersedia
- Mitra kecil (warung, toko, RT kecil)
- Troubleshooting (alat rusak, HP tidak support NFC)

**Kelebihan:**
- Tidak butuh hardware tambahan
- Selalu available (fallback universal)

**Kekurangan:**
- Lambat (ketik UID manual)
- Error-prone (typo UID)
- Tidak praktis untuk volume tinggi

**Auth:** Session login petugas (dashboard)

**API:** Form dashboard → `POST /api/lokaid/peserta` (isi UID manual)

---

## Sistem 2-Level Preference

### Level 1: Platform → Mitra (Izin Global)

**Admin platform** set metode apa yang **diizinkan** per mitra.

**Field:** `Mitra.metodeScanDiizinkan` (array)  
**Contoh:** `["alat_esp32", "hp_nfc"]`

**Default per tipe:**
- SPBU (`tipeMitra: "subsidi"`) → `["alat_esp32"]` wajib alat
- LokaID (`tipeMitra: "lokaid"`) → `["alat_esp32", "hp_nfc"]` fleksibel
- Mitra lain → `["manual"]` default fallback

**Enforcement:**
- Admin mitra **tidak bisa** aktifkan metode yang tidak ada di array ini
- UI dashboard mitra: dropdown metode **filtered** by diizinkan
- API guard: reject jika metode tidak diizinkan

---

### Level 2: Mitra → Cabang (Aktivasi Lokal)

**Admin mitra** pilih metode mana yang **aktif** per cabang/wilayah.

**Field:** `Cabang.metodeScanAktif` (single string)  
**Contoh:** `"hp_nfc"`

**Logika:**
```ts
if (!mitra.metodeScanDiizinkan.includes(cabang.metodeScanAktif)) {
  return 403 "Metode tidak diizinkan untuk mitra ini"
}
```

**Use Case:**
- SPBU Fatmawati → `"alat_esp32"` (ada alat dedicated)
- SPBU Sudirman → `"alat_esp32"` (ada alat dedicated)
- Kecamatan Sukasari → `"hp_nfc"` (mobile fieldwork)
- Kecamatan Coblong → `"alat_esp32"` (kantor tetap)

**Conditional UI:**
```tsx
{cabang.metodeScanAktif === "alat_esp32" && <Tab>Scan Terbaru</Tab>}
{cabang.metodeScanAktif === "hp_nfc" && <Button>Generate QR</Button>}
```

---

## Alur Lengkap

### Skenario 1: SPBU (Alat ESP32 Only)

```
Onboarding Mitra
  → Admin platform set: metodeScanDiizinkan = ["alat_esp32"]

Setup Cabang
  → Admin SPBU set: cabang.metodeScanAktif = "alat_esp32"
  → Dashboard tampil tab "Scan Terbaru"
  → Button "Generate QR" TIDAK tampil (hidden)

Operasional
  → Alat ESP32 scan kartu → POST /api/uid-scan → ScanPending
  → Petugas buka dashboard → tab Scan Terbaru → lengkapi form
  → Warga terdaftar
```

### Skenario 2: LokaID (Fleksibel Alat + HP)

```
Onboarding Mitra
  → Admin platform set: metodeScanDiizinkan = ["alat_esp32", "hp_nfc"]

Setup Cabang A (Kantor Tetap)
  → Admin LokaID set: cabangA.metodeScanAktif = "alat_esp32"
  → Dashboard tampil tab "Scan Terbaru"
  → Button "Generate QR" TIDAK tampil

Setup Cabang B (Mobile Fieldwork)
  → Admin LokaID set: cabangB.metodeScanAktif = "hp_nfc"
  → Dashboard TIDAK tampil tab "Scan Terbaru"
  → Button "Generate QR" tampil

Operasional Cabang A (Kantor)
  → Sama seperti SPBU (pakai alat ESP32)

Operasional Cabang B (Lapangan)
  → Admin generate QR per program
  → Petugas scan QR di HP → halaman scan NFC
  → Tap kartu → peserta terdaftar langsung
```

### Skenario 3: Mitra Kecil (Manual Only)

```
Onboarding Mitra
  → Admin platform set: metodeScanDiizinkan = ["manual"]

Setup Cabang
  → cabang.metodeScanAktif = "manual" (default)
  → Dashboard: tab "Scan Terbaru" TIDAK tampil
  → Dashboard: button "Generate QR" TIDAK tampil
  → Dashboard: form "Daftar Baru" → input UID manual (keyboard)

Operasional
  → Petugas buka form → ketik UID manual → isi data → simpan
```

---

## API Guards & Validation

### Middleware `validateScanMethod`

```ts
// lib/scan-guard.ts
export async function validateScanMethod(
  cabangId: number,
  method: "alat_esp32" | "hp_nfc"
): Promise<{ allowed: boolean; error?: string }> {
  const cabang = await prisma.cabang.findUnique({
    where: { id: cabangId },
    include: { mitra: { select: { metodeScanDiizinkan: true } } }
  });
  
  if (!cabang) return { allowed: false, error: "Cabang tidak ditemukan" };
  
  // Check 1: cabang aktif metode ini?
  if (cabang.metodeScanAktif !== method) {
    return { 
      allowed: false, 
      error: `Cabang ini menggunakan metode ${cabang.metodeScanAktif}` 
    };
  }
  
  // Check 2: mitra izinkan metode ini?
  if (!cabang.mitra.metodeScanDiizinkan.includes(method)) {
    return { 
      allowed: false, 
      error: "Mitra tidak diizinkan menggunakan metode ini" 
    };
  }
  
  return { allowed: true };
}
```

### Dipasang di API

**Alat ESP32:**
```ts
// POST /api/uid-scan
const cabang = await getCabangByToken(body.token);
const validation = await validateScanMethod(cabang.id, "alat_esp32");
if (!validation.allowed) {
  return Response.json({ error: validation.error }, { status: 403 });
}
```

**HP NFC:**
```ts
// POST /api/lokaid/qr/:token/scan-register
const qrToken = await getQRToken(params.token);
const validation = await validateScanMethod(qrToken.cabangId, "hp_nfc");
if (!validation.allowed) {
  return Response.json({ error: validation.error }, { status: 403 });
}
```

---

## Migration Data Existing

Setelah schema update, butuh migration data untuk set default:

```sql
-- Set default metodeScanDiizinkan by tipeMitra
UPDATE `mitra` 
SET `metode_scan_diizinkan` = '["alat_esp32"]' 
WHERE `tipe_mitra` = 'subsidi';

UPDATE `mitra` 
SET `metode_scan_diizinkan` = '["alat_esp32","hp_nfc"]' 
WHERE `tipe_mitra` = 'lokaid';

-- Auto-enable metodeScanAktif by tipeMitra
UPDATE `cabang` c 
JOIN `mitra` m ON c.mitra_id = m.id 
SET c.metode_scan_aktif = 'alat_esp32' 
WHERE m.tipe_mitra = 'subsidi';

UPDATE `cabang` c 
JOIN `mitra` m ON c.mitra_id = m.id 
SET c.metode_scan_aktif = 'hp_nfc' 
WHERE m.tipe_mitra = 'lokaid';
```

**Alasan auto-enable:**
- SPBU existing → sudah pakai alat (sesuai kebutuhan)
- LokaID existing → default HP (mobile-first, alat masih development)
- Tidak break existing workflow

---

## FAQ

### Q: Bisa ganti metode aktif per program (bukan per cabang)?

**A:** Tidak. Preferensi scan di level **cabang** (operasional unit), bukan program. Alasannya:
- Hardware (alat/HP) dipegang cabang, bukan program
- Satu cabang bisa handle banyak program dengan metode sama
- Lebih sederhana (tidak overload konfigurasi)

Jika butuh metode berbeda, buat cabang terpisah.

### Q: Bisa pakai 2 metode sekaligus (alat + HP) di satu cabang?

**A:** Tidak secara simultan. `metodeScanAktif` single value. Tapi admin mitra bisa **ganti metode** kapan saja (edit cabang → ganti dropdown → simpan).

**Use case:** Alat rusak → ganti ke HP sementara → setelah alat fixed, ganti balik.

### Q: Bagaimana jika cabang coba scan dengan metode yang tidak aktif?

**A:** API guard reject dengan **403 Forbidden** + error message jelas.

UI dashboard juga hide feature yang tidak aktif (conditional render).

### Q: Apa bedanya `manual` vs metode lain?

**A:** `manual` adalah **fallback universal** — tidak butuh hardware, selalu available. Tapi lambat & error-prone. Biasanya dipakai:
- Troubleshooting (alat/HP tidak jalan)
- Mitra kecil tanpa budget
- Volume rendah (puluhan scan per hari, bukan ratusan)

---

## Dokumentasi Terkait

- [Dashboard Admin Platform](./admin-platform.md)
- [Pendataan Mobile (HP NFC)](../lokaid/rencana.md#iterasi-v8)
- [Alat ESP32 (Hardware Setup)](../hardware/esp32-setup.md) *(future)*
