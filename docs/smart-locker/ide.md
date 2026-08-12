# 🔐 SMART LOCKER

## Sistem Penyimpanan Barang Publik Berbasis Identitas Warga, IoT, dan Smart Map

---

# 1. Gambaran Umum

**Smart Locker** adalah sistem penyimpanan barang publik berbasis Internet of Things (IoT) yang memungkinkan masyarakat menggunakan fasilitas locker secara mandiri dengan memanfaatkan identitas warga sebagai metode autentikasi.

Smart Locker dirancang untuk ditempatkan pada fasilitas publik seperti:

* taman kota;
* alun-alun;
* fasilitas olahraga;
* perpustakaan;
* balai warga;
* ruang publik;
* area kegiatan masyarakat;
* fasilitas umum lainnya.

Pengguna dapat mengetahui lokasi Smart Locker melalui peta digital dan melihat ketersediaan locker sebelum datang ke lokasi.

Setelah berada di lokasi, pengguna melakukan autentikasi menggunakan kartu RFID/NFC yang terhubung dengan **Citizen ID**.

Jika autentikasi berhasil, sistem akan memberikan akses kepada locker yang tersedia. Pengunci elektronik kemudian terbuka secara otomatis sehingga pengguna dapat menyimpan barang.

Status setiap locker akan ditampilkan menggunakan indikator LED:

```text
🟢 Hijau  = Locker tersedia
🔴 Merah  = Locker terisi
🟡 Kuning = Maintenance / Error
```

Status tersebut juga dikirimkan oleh perangkat IoT ke server sehingga pengguna dapat melihat ketersediaan locker melalui website secara real-time.

---

# 2. Tujuan

Smart Locker dibuat dengan beberapa tujuan:

1. Menyediakan fasilitas penyimpanan barang pada ruang publik.
2. Mempermudah masyarakat menemukan locker yang tersedia.
3. Menggunakan identitas warga sebagai metode autentikasi.
4. Mengurangi penggunaan kunci fisik.
5. Menggunakan IoT untuk mengontrol sistem penguncian.
6. Menampilkan status locker secara langsung menggunakan LED.
7. Menampilkan lokasi dan ketersediaan locker pada peta digital.
8. Mencatat aktivitas penggunaan locker pada server.
9. Membantu pengelola memonitor seluruh locker.
10. Menyediakan fasilitas publik yang dapat dikembangkan pada skala kelurahan hingga kota.

---

# 3. Sasaran Pengguna

Smart Locker ditujukan untuk:

### Masyarakat

* warga sekitar;
* pengunjung taman;
* pengguna fasilitas olahraga;
* pengunjung perpustakaan;
* pengunjung ruang publik;
* peserta kegiatan masyarakat.

### Pengelola

Pengelola dapat berupa:

* kelurahan;
* pengelola fasilitas publik;
* operator Smart Locker;
* petugas maintenance.

---

# 4. Skala Implementasi

Prototype Smart Locker dibuat dalam skala terbatas.

Contoh:

```text
                    KOTA / WILAYAH
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
         ST-001        ST-002        ST-003
       Taman Kota     Alun-Alun    Balai Warga
             │            │            │
          5 locker      5 locker     5 locker
```

Prototype dapat dimulai dari:

* 1 lokasi;
* 3–5 locker;
* 1 ESP32;
* 1 server;
* 1 dashboard.

Setelah konsep berhasil, sistem dapat dikembangkan menjadi beberapa lokasi dalam satu kelurahan atau kota.

---

# 5. Konsep Utama

Konsep utama Smart Locker:

> **Identitas warga → autentikasi → akses locker → penyimpanan → monitoring IoT → pencatatan server**

Sistem juga memiliki fitur pencarian lokasi:

> **Map → lokasi Smart Locker → jumlah locker tersedia → navigasi**

Arsitektur:

```text
                    👤 WARGA
                       │
                       ▼
                 📱 / 💳 IDENTITAS
                       │
                       ▼
                  CITIZEN ID
                       │
                       ▼
                ┌──────────────┐
                │    SERVER    │
                │  & DATABASE  │
                └──────┬───────┘
                       │
              ┌────────┴─────────┐
              │                  │
              ▼                  ▼
          🗺️ SMART MAP       🔐 SMART LOCKER
                                   │
                                ESP32
                                   │
                        ┌──────────┼──────────┐
                        │          │          │
                        ▼          ▼          ▼
                     RFID      Smart Lock   Sensor
                                             │
                                             ▼
                                           LED
```

---

# 6. Registrasi Pengguna

Smart Locker menggunakan sistem identitas yang sama dengan platform utama.

Pengguna melakukan registrasi melalui website.

Alur:

```text
Pengguna membuka website
        ↓
Pilih "Daftar"
        ↓
Scan KTP menggunakan kamera HP
        ↓
OCR membaca data KTP
        ↓
Data otomatis masuk ke formulir
        ↓
Pengguna melengkapi data
        ↓
Validasi
        ↓
Akun dibuat
        ↓
Citizen ID dibuat
```

Sistem tidak perlu mengambil data langsung dari database Dukcapil pada prototype.

---

# 7. Citizen ID

Setelah registrasi, pengguna memperoleh identitas internal.

Contoh:

```text
Citizen ID : CIT-000127
Nama       : Pengguna
Status     : ACTIVE
```

Pada prototype, Citizen ID dapat dihubungkan dengan kartu RFID/NFC.

```text
RFID Card
    ↓
Card ID
    ↓
Citizen ID
    ↓
User
```

Kartu tidak menyimpan seluruh informasi pribadi pengguna.

---

# 8. Smart Locker Station

Locker tidak berdiri sendiri dalam sistem.

Beberapa locker dikelompokkan menjadi satu **Smart Locker Station**.

Contoh:

```text
ST-001
Taman Kota

L-001 🟢
L-002 🔴
L-003 🟢
L-004 🟢
L-005 🔴
```

Station mempunyai:

```text
Station ID
Nama
Alamat
Latitude
Longitude
Status
```

Data lokasi tersebut digunakan oleh Smart Locker Map.

---

# 9. Smart Locker Map

Pengguna dapat membuka halaman:

> **Cari Smart Locker**

Sistem menampilkan lokasi locker pada peta.

Untuk prototype, teknologi yang dapat digunakan:

* Leaflet;
* OpenStreetMap.

Contoh:

```text
                SMART LOCKER MAP

        📍 ST-001
        Taman Kota
        🟢 4 tersedia

                    📍 ST-002
                    Alun-Alun
                    🟢 2 tersedia

                              📍 ST-003
                              Balai Warga
                              🔴 0 tersedia
```

---

# 10. Informasi pada Map

Ketika pengguna memilih sebuah lokasi:

```text
SMART LOCKER
Taman Kota

Total Locker : 10
Tersedia     : 6
Terisi       : 4

🟢 L-001
🔴 L-002
🟢 L-003
🟢 L-004
🔴 L-005
...

[LIHAT RUTE]
```

Informasi ketersediaan berasal dari server.

---

# 11. Pencarian Locker Terdekat

Website dapat memanfaatkan lokasi pengguna untuk mencari station terdekat.

Alur:

```text
Lokasi pengguna
      ↓
Cari station terdekat
      ↓
Ambil data ketersediaan
      ↓
Urutkan berdasarkan jarak
      ↓
Tampilkan hasil
```

Contoh:

```text
SMART LOCKER TERDEKAT

1. Taman Kota
   350 meter
   🟢 6 locker tersedia

2. Alun-Alun
   700 meter
   🟢 3 locker tersedia

3. Balai Warga
   1.2 km
   🔴 Tidak tersedia
```

---

# 12. Navigasi

Pengguna dapat memilih lokasi locker kemudian menggunakan fitur navigasi.

Contoh:

```text
Taman Kota
350 meter

[ BUKA RUTE ]
```

Prototype dapat menggunakan link navigasi ke aplikasi peta atau sistem map yang digunakan.

---

# 13. Indikator LED

Setiap locker memiliki LED sebagai indikator kondisi.

### 🟢 Hijau

```text
AVAILABLE
```

Artinya locker dapat digunakan.

### 🔴 Merah

```text
OCCUPIED
```

Artinya locker sedang digunakan.

### 🟡 Kuning

```text
MAINTENANCE / ERROR
```

Artinya locker tidak dapat digunakan.

Contoh:

```text
┌─────────┐
│    🟢   │
│  L-001  │
└─────────┘

┌─────────┐
│    🔴   │
│  L-002  │
└─────────┘

┌─────────┐
│    🟡   │
│  L-003  │
└─────────┘
```

---

# 14. Sumber Status Locker

Status LED dan status pada website berasal dari sistem yang sama.

```text
                    DATABASE
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
          WEBSITE              ESP32
             │                   │
          🟢 / 🔴              LED
```

Contohnya ketika locker digunakan:

```text
Locker = AVAILABLE
       ↓
Pengguna berhasil mendapatkan locker
       ↓
Server
       ↓
Locker = OCCUPIED
       ↓
ESP32
       ↓
LED = 🔴
       ↓
Map = 🔴 / OCCUPIED
```

Ketika barang diambil:

```text
OCCUPIED
   ↓
Pengguna mengambil barang
   ↓
Transaksi selesai
   ↓
AVAILABLE
   ↓
ESP32 → 🟢
   ↓
Server → AVAILABLE
   ↓
Map → AVAILABLE
```

---

# 15. Proses Peminjaman Locker

Alur penggunaan locker:

```text
Pengguna datang
      ↓
Tap RFID
      ↓
Reader membaca kartu
      ↓
ESP32 mengirim Card ID
      ↓
Server mencari Citizen ID
      ↓
Validasi pengguna
      ↓
Cari locker tersedia
      ↓
Locker diberikan
      ↓
Smart Lock UNLOCK
      ↓
LED berubah sesuai status
      ↓
Pengguna menyimpan barang
      ↓
Pintu ditutup
      ↓
LOCK
      ↓
Status OCCUPIED
```

---

# 16. Validasi Pengguna

Sebelum membuka locker, server memeriksa:

```text
User terdaftar?
       ↓
Status akun aktif?
       ↓
Memiliki locker aktif?
       ↓
Ada locker tersedia?
```

Jika seluruh valid:

```text
ACCESS GRANTED
```

Jika gagal:

```text
ACCESS DENIED
```

---

# 17. Automatic Locker Assignment

Sistem dapat otomatis menentukan locker yang tersedia.

Contoh:

```text
L-001 → OCCUPIED
L-002 → OCCUPIED
L-003 → AVAILABLE
L-004 → AVAILABLE
```

Pengguna melakukan tap.

Server:

```text
Cari locker AVAILABLE
        ↓
L-003
        ↓
Assign CIT-000127
        ↓
Unlock L-003
```

---

# 18. Smart Unlock

Setelah validasi berhasil:

```text
SERVER
   ↓
Command = UNLOCK
   ↓
ESP32
   ↓
Lock Driver
   ↓
Electronic Lock
   ↓
🔓 Locker terbuka
```

Jika autentikasi gagal:

```text
SERVER
   ↓
ACCESS DENIED
   ↓
ESP32
   ↓
Locker tetap terkunci
```

---

# 19. Door Sensor

Setiap locker memiliki sensor untuk mengetahui kondisi pintu.

Status:

```text
OPEN
CLOSED
```

Sensor dapat menggunakan:

* magnetic reed switch;
* magnetic door sensor;
* limit switch.

Contoh:

```text
Door OPEN
    ↓
Pengguna memasukkan barang
    ↓
Door CLOSED
    ↓
ESP32 mendeteksi
    ↓
LOCK
```

---

# 20. Lock Status

Sistem juga memonitor kondisi pengunci.

Status:

```text
LOCKED
UNLOCKED
```

Jika server memerintahkan:

```text
UNLOCK
```

tetapi sensor masih:

```text
LOCKED
```

maka:

```text
⚠ LOCK ERROR
```

---

# 21. Automatic Lock

Setelah pengguna menutup pintu:

```text
Door = CLOSED
       ↓
ESP32
       ↓
LOCK
       ↓
Lock Sensor
       ↓
LOCKED
       ↓
Server
       ↓
Status = OCCUPIED
```

---

# 22. Proses Pengambilan Barang

Ketika pengguna ingin mengambil barang:

```text
Tap RFID
    ↓
Server
    ↓
Cari locker milik user
    ↓
Validasi
    ↓
UNLOCK
    ↓
Pengguna mengambil barang
    ↓
Pintu ditutup
    ↓
LOCK
    ↓
Transaksi selesai
    ↓
Locker AVAILABLE
```

---

# 23. Kepemilikan Locker

Setiap locker yang sedang digunakan mempunyai hubungan dengan pengguna.

Contoh:

```text
Locker : L-003
User   : CIT-000127
Status : OCCUPIED
```

Pengguna lain tidak dapat membuka locker tersebut.

Jika:

```text
CIT-000200
```

mencoba mengakses:

```text
L-003
```

sistem memberikan:

```text
❌ ACCESS DENIED
Locker bukan milik pengguna.
```

---

# 24. Monitoring Durasi

Server mencatat waktu mulai penggunaan.

Contoh:

```text
Locker    : L-003
User      : CIT-000127
Start     : 14:30
Current   : 16:15
Duration  : 1 jam 45 menit
```

Sistem dapat memiliki batas penggunaan.

Contoh:

```text
Maximum Duration = 2 jam
```

Jika melewati batas:

```text
⚠ Locker L-003
Penggunaan melebihi batas waktu.
```

Fitur ini dapat dikembangkan lebih lanjut sesuai kebutuhan pengelola.

---

# 25. Activity Log

Semua aktivitas penting dicatat.

Contoh:

```text
14:30
CIT-000127
ACCESS L-003
SUCCESS

14:30
L-003
UNLOCK

14:31
L-003
DOOR CLOSED

14:31
L-003
LOCKED

16:15
CIT-000127
ACCESS L-003
SUCCESS

16:16
L-003
TRANSACTION COMPLETED
```

Activity log dapat digunakan untuk audit dan troubleshooting.

---

# 26. Database

## users

```text
id
citizen_id
nik
nama
tanggal_lahir
alamat
kelurahan
nomor_hp
email
password
status
created_at
```

## stations

```text
id
station_code
nama
alamat
latitude
longitude
status
created_at
updated_at
```

## lockers

```text
id
locker_code
station_id
status
lock_status
door_status
device_id
created_at
updated_at
```

## locker_rentals

```text
id
locker_id
user_id
start_time
end_time
duration
status
```

## devices

```text
id
device_code
esp32_id
locker_id
last_seen
status
```

## activity_logs

```text
id
user_id
locker_id
action
description
created_at
```

---

# 27. Status Locker

Status utama:

```text
AVAILABLE
OCCUPIED
MAINTENANCE
OFFLINE
ERROR
```

Contoh:

```text
L-001 🟢 AVAILABLE
L-002 🔴 OCCUPIED
L-003 🟡 MAINTENANCE
L-004 ⚫ OFFLINE
```

---

# 28. Device Monitoring

Karena sistem menggunakan IoT, dashboard juga memonitor ESP32.

Contoh:

```text
DEVICE STATUS

ESP32-L001 🟢 ONLINE
ESP32-L002 🟢 ONLINE
ESP32-L003 🟢 ONLINE
ESP32-L004 🔴 OFFLINE
```

Sistem menyimpan:

```text
Last Seen
Device Status
Connection Status
```

---

# 29. Error Detection

Sistem dapat mendeteksi:

### ESP32 Offline

```text
Last Seen:
10 menit lalu

Status:
OFFLINE
```

### Lock Error

```text
Command:
UNLOCK

Sensor:
LOCKED

⚠ Lock Error
```

### Door Open Too Long

```text
Door:
OPEN

Duration:
> 30 detik

⚠ WARNING
```

---

# 30. Maintenance Mode

Operator dapat menonaktifkan locker.

```text
AVAILABLE
    ↓
MAINTENANCE
```

Saat maintenance:

```text
L-003

🟡 MAINTENANCE

Locker tidak tersedia.
```

Setelah selesai:

```text
MAINTENANCE
    ↓
AVAILABLE
    ↓
🟢
```

---

# 31. Smart Locker Dashboard

Dashboard pengelola menampilkan ringkasan.

```text
SMART LOCKER DASHBOARD

Total Locker       : 15
Available          : 8
Occupied           : 5
Maintenance        : 1
Offline             : 1

Station Aktif      : 3
Penggunaan Hari Ini: 27
```

---

# 32. Monitoring Station

Contoh:

```text
ST-001
Taman Kota

L-001 🟢
L-002 🔴
L-003 🟢
L-004 🟢
L-005 🔴

Tersedia:
3 / 5
```

---

# 33. Statistik

Dashboard dapat menampilkan:

### Penggunaan per hari

```text
Senin    20
Selasa   27
Rabu     31
Kamis    24
Jumat    35
```

### Locker paling sering digunakan

```text
L-003 → 24 penggunaan
L-001 → 19 penggunaan
L-005 → 17 penggunaan
```

### Station paling ramai

```text
Taman Kota  → 42
Alun-Alun   → 31
Balai Warga → 18
```

Data tersebut dapat digunakan untuk mengetahui kebutuhan fasilitas.

---

# 34. Arsitektur Hardware

```text
                    SMART LOCKER
                         │
                    ┌────▼────┐
                    │  ESP32  │
                    └────┬────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   RFID Reader      Lock Driver      Door Sensor
        │                │                │
        │                ▼                │
        │          Electronic Lock        │
        │                                 │
        │                ┌────────────────┘
        │                │
        ▼                ▼
     User ID           LED
                         │
                 🟢 / 🔴 / 🟡
                         │
                         ▼
                      SERVER
```

---

# 35. Komponen Hardware Prototype

### Controller

* ESP32

### Identifikasi

* RFID RC522
* RFID Card

### Smart Lock

* Solenoid lock / electronic cabinet lock
* Relay atau MOSFET driver

### Sensor

* Reed switch
* Magnetic sensor
* Limit switch

### Indicator

* LED hijau
* LED merah
* LED kuning (opsional)
* Buzzer (opsional)

### Power

* Power supply sesuai kebutuhan ESP32 dan electronic lock

---

# 36. Komunikasi IoT

Arsitektur:

```text
RFID
 ↓
ESP32
 ↓
Internet
 ↓
API Server
 ↓
Database
 ↓
Dashboard
```

Server dapat mengirim perintah:

```text
SERVER
 ↓
API / MQTT
 ↓
ESP32
 ↓
UNLOCK / LOCK
 ↓
Electronic Lock
```

Untuk prototype, komunikasi HTTP/HTTPS dapat digunakan terlebih dahulu.

MQTT dapat digunakan apabila sistem dikembangkan menjadi banyak locker dan banyak perangkat IoT.

---

# 37. Contoh Alur API

Ketika pengguna melakukan tap:

```text
POST /api/locker/access
```

Data:

```text
citizen_id
station_id
device_id
card_id
```

Server:

```text
Validasi User
       ↓
Cari Locker
       ↓
Assign Locker
       ↓
Return Command
```

Response:

```text
{
    "status": "approved",
    "locker": "L-003",
    "command": "unlock"
}
```

---

# 38. Contoh Skenario Penggunaan

### Skenario

Seorang warga datang ke taman kota dan ingin menyimpan tas.

### Step 1 — Mencari Locker

Pengguna membuka website.

```text
Smart Locker Map
```

Website menunjukkan:

```text
Taman Kota
350 meter
🟢 4 locker tersedia
```

Pengguna memilih:

> **Buka Rute**

---

### Step 2 — Datang ke Station

Pengguna datang ke:

```text
ST-001
Taman Kota
```

Kondisi fisik:

```text
L-001 🟢
L-002 🔴
L-003 🟢
L-004 🟢
L-005 🟢
```

---

### Step 3 — Tap Identitas

Pengguna melakukan tap:

```text
RFID
 ↓
ESP32
 ↓
Server
```

Server menemukan:

```text
CIT-000127
Status = ACTIVE
```

---

### Step 4 — Assign Locker

Server memilih:

```text
L-001
```

Kemudian:

```text
L-001
Status = OCCUPIED
```

---

### Step 5 — Unlock

Server:

```text
UNLOCK L-001
```

ESP32 mengaktifkan electronic lock.

```text
🔓
```

---

### Step 6 — Menyimpan Barang

Pengguna membuka pintu dan memasukkan tas.

Pintu ditutup.

Sensor:

```text
Door = CLOSED
```

ESP32:

```text
LOCK
```

LED:

```text
🔴
```

---

### Step 7 — Server Memperbarui Data

```text
Locker:
L-001

User:
CIT-000127

Status:
OCCUPIED

Start:
14:30
```

Pada map:

```text
Taman Kota
🟢 3 tersedia
🔴 2 terisi
```

---

### Step 8 — Mengambil Barang

Pengguna kembali.

Tap kartu:

```text
CIT-000127
```

Server menemukan:

```text
L-001
```

Sistem melakukan:

```text
UNLOCK
```

Pengguna mengambil barang.

---

### Step 9 — Transaksi Selesai

Pintu ditutup.

```text
Door = CLOSED
Lock = LOCKED
```

Server:

```text
Status = AVAILABLE
```

LED:

```text
🟢
```

Map:

```text
Taman Kota
🟢 4 tersedia
```

---

# 39. Keamanan

Sistem harus memperhatikan keamanan identitas dan barang.

Prinsip:

1. Kartu RFID hanya menyimpan ID.
2. Data pribadi disimpan di server.
3. Pengguna hanya dapat membuka locker miliknya.
4. Semua akses dicatat.
5. Password disimpan menggunakan hash.
6. Komunikasi server menggunakan HTTPS.
7. Perangkat IoT menggunakan autentikasi.
8. Command unlock tidak boleh dilakukan tanpa validasi server.
9. Dashboard menggunakan role-based access.
10. Data KTP tidak disimpan dalam bentuk foto apabila tidak diperlukan.

---

# 40. Role Pengguna

## Citizen

Dapat:

* melihat Smart Locker Map;
* mencari locker terdekat;
* melihat ketersediaan;
* menggunakan locker;
* membuka locker miliknya;
* melihat riwayat penggunaan.

## Operator

Dapat:

* melihat kondisi locker;
* melihat transaksi;
* melihat device;
* melakukan maintenance;
* melihat activity log.

## Admin

Dapat:

* mengelola user;
* mengelola station;
* mengelola locker;
* mengelola device;
* melihat seluruh laporan.

---

# 41. Batasan Prototype

Untuk menjaga proyek tetap realistis:

1. Prototype hanya menggunakan beberapa locker.
2. Prototype hanya diterapkan pada beberapa station.
3. RFID/NFC digunakan sebagai representasi identitas warga.
4. Sistem tidak mengambil data langsung dari database Dukcapil.
5. Map menggunakan lokasi station yang telah disimpan di database.
6. Tracking lokasi locker menggunakan koordinat station.
7. GPS pada setiap locker belum menjadi kebutuhan utama.
8. Pembayaran belum menjadi fokus utama.
9. Sistem belum ditujukan untuk mengelola seluruh locker dalam satu kota.
10. Keamanan fisik locker masih berupa prototype.

---

# 42. Teknologi Map

Untuk prototype, teknologi yang direkomendasikan:

```text
Leaflet
   +
OpenStreetMap
   +
Latitude / Longitude
   +
Database Station
```

Contoh data:

```text
ST-001
Nama      : Taman Kota
Latitude  : -7.xxxxx
Longitude : 110.xxxxx
```

Website menggunakan data tersebut untuk menampilkan marker.

---

# 43. Pengembangan Selanjutnya

### Mobile Application

Pengguna dapat:

* mencari locker;
* melihat ketersediaan;
* melihat lokasi;
* mendapatkan navigasi;
* melihat riwayat.

### Reservation

Pengguna dapat memesan locker terlebih dahulu.

```text
AVAILABLE
    ↓
RESERVED
    ↓
OCCUPIED
```

### QR Code

RFID dapat dilengkapi dengan QR Code sebagai metode autentikasi alternatif.

### Sensor Berat

Sensor berat dapat digunakan untuk mengetahui apakah masih terdapat barang di dalam locker.

### GPS

GPS dapat ditambahkan untuk perangkat yang membutuhkan tracking lokasi.

### Notification

Sistem dapat memberikan:

* peringatan waktu;
* akses berhasil;
* akses ditolak;
* locker bermasalah;
* locker hampir melewati batas penggunaan.

### Integrasi Smart City

Smart Locker dapat dihubungkan dengan layanan lain:

```text
                CITIZEN ID
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
   🚲 Smart      🔐 Smart      🎁 Smart
     Bike         Locker         Aid
```

---

# 44. Nilai Inovasi

Nilai utama Smart Locker bukan hanya membuat locker yang dapat dibuka menggunakan RFID.

Inovasi sistem terletak pada integrasi:

```text
Identitas Warga
      +
IoT
      +
Smart Lock
      +
Real-time Status
      +
Smart Map
      +
Server
      +
Activity Log
```

Masyarakat dapat:

> **mencari → melihat ketersediaan → datang → autentikasi → menggunakan locker → mengambil barang**

Sementara pengelola dapat:

> **memonitor → mengetahui kondisi → melihat penggunaan → menangani masalah → menganalisis kebutuhan fasilitas.**

---

# 45. Ringkasan Alur Sistem

```text
                    📱 REGISTRASI
                          │
                       Scan KTP
                          │
                         OCR
                          │
                          ▼
                    👤 CITIZEN ID
                          │
                          ▼
                    🗺️ SMART MAP
                          │
                Cari locker terdekat
                          │
                          ▼
                    📍 STATION
                          │
                          ▼
                     💳 RFID
                          │
                         TAP
                          │
                          ▼
                        ESP32
                          │
                          ▼
                       SERVER
                          │
                      VALIDASI
                          │
                          ▼
                  ASSIGN LOCKER
                          │
                          ▼
                       UNLOCK
                          │
                          ▼
                   📦 SIMPAN BARANG
                          │
                          ▼
                        LOCK
                          │
                          ▼
                    🔴 OCCUPIED
                          │
                          ▼
                    SERVER UPDATE
                          │
                          ▼
                     🗺️ MAP UPDATE
                          │
                          ▼
                    PENGGUNA KEMBALI
                          │
                          ▼
                        TAP
                          │
                          ▼
                       UNLOCK
                          │
                          ▼
                    AMBIL BARANG
                          │
                          ▼
                        LOCK
                          │
                          ▼
                    🟢 AVAILABLE
                          │
                          ▼
                     MAP UPDATE
```

---

# 46. Inti Konsep

**Smart Locker** merupakan fasilitas penyimpanan barang publik berbasis IoT yang menggunakan identitas warga sebagai metode autentikasi dan menyediakan informasi ketersediaan locker melalui peta digital.

Sistem menghubungkan:

> **Identitas → Citizen ID → Smart Map → Station → RFID → ESP32 → Smart Lock → Sensor → LED → Server → Dashboard**

Dengan konsep tersebut, Smart Locker tidak hanya menjadi tempat penyimpanan barang, tetapi menjadi **fasilitas publik terhubung** yang dapat ditemukan, digunakan, dimonitor, dan dikelola secara digital.
