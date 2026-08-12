# 🚲 SMART BIKE

## Sistem Penyewaan Sepeda Publik Berbasis Citizen ID, IoT, Smart Map, dan Real-Time Tracking

---

# 1. Gambaran Umum

**Smart Bike** adalah sistem penyewaan dan peminjaman sepeda publik berbasis Internet of Things (IoT) yang memungkinkan masyarakat menggunakan sepeda pada fasilitas umum dengan memanfaatkan **Citizen ID** sebagai identitas pengguna.

Sistem dirancang untuk digunakan pada skala kecil seperti:

* kelurahan;
* taman kota;
* alun-alun;
* kawasan wisata lokal;
* area olahraga;
* kawasan pedestrian;
* fasilitas publik;
* lingkungan kampus atau kawasan tertentu.

Sepeda ditempatkan pada beberapa **Smart Bike Station** yang tersebar di lokasi tertentu.

Masyarakat dapat membuka website atau aplikasi untuk:

* mencari lokasi Smart Bike Station;
* melihat jumlah sepeda yang tersedia;
* melihat lokasi station pada peta;
* mencari station terdekat;
* melihat status sepeda secara real-time;
* mendapatkan navigasi menuju station.

Setelah sampai di station, pengguna melakukan **tap kartu RFID/NFC** yang telah terhubung dengan Citizen ID.

Jika validasi berhasil, sistem membuka kunci sepeda secara otomatis.

Selama sepeda digunakan, sistem mencatat:

* pengguna;
* sepeda;
* waktu peminjaman;
* lokasi awal;
* lokasi perjalanan;
* durasi penggunaan;
* station pengembalian.

Ketika sepeda dikembalikan ke station, sistem mengunci sepeda secara otomatis dan memperbarui status menjadi tersedia.

---

# 2. Tujuan

Smart Bike dibuat dengan tujuan:

1. Menyediakan alternatif transportasi publik jarak pendek.
2. Memanfaatkan identitas warga sebagai autentikasi pengguna.
3. Mengurangi penggunaan kunci fisik.
4. Menggunakan IoT untuk mengontrol akses sepeda.
5. Menampilkan lokasi dan ketersediaan sepeda melalui Smart Map.
6. Mencatat perjalanan pengguna secara digital.
7. Memudahkan pengelola memonitor seluruh sepeda.
8. Menyediakan data penggunaan sepeda untuk evaluasi fasilitas publik.
9. Membuat sistem transportasi publik yang dapat diterapkan dalam skala kelurahan atau kota.
10. Menjadi bagian dari ekosistem layanan publik berbasis Citizen ID.

---

# 3. Sasaran Pengguna

## Masyarakat

Sistem dapat digunakan oleh:

* warga sekitar;
* pengunjung taman;
* wisatawan;
* pengguna fasilitas publik;
* masyarakat yang membutuhkan transportasi jarak pendek.

## Pengelola

Sistem dapat dikelola oleh:

* kelurahan;
* pengelola taman;
* pengelola kawasan publik;
* operator Smart Bike;
* petugas maintenance.

---

# 4. Skala Implementasi

Smart Bike tidak dirancang langsung untuk seluruh kota.

Prototype dibuat dalam skala terbatas.

Contoh:

```text
KAWASAN
   │
   ├── ST-B01 Taman Kota
   │      ├── B-001
   │      ├── B-002
   │      ├── B-003
   │      └── B-004
   │
   ├── ST-B02 Alun-Alun
   │      ├── B-005
   │      ├── B-006
   │      ├── B-007
   │      └── B-008
   │
   └── ST-B03 Balai Warga
          ├── B-009
          ├── B-010
          ├── B-011
          └── B-012
```

Prototype dapat dimulai dengan:

* 1–3 station;
* 3–10 sepeda;
* 1 atau beberapa ESP32;
* RFID reader;
* smart lock;
* server;
* database;
* Smart Map.

---

# 5. Konsep Utama

Konsep utama Smart Bike:

> **Cari station → lihat sepeda tersedia → datang → tap Citizen ID → sepeda terbuka → digunakan → tracking → dikembalikan → sepeda terkunci → status diperbarui.**

Arsitektur sistem:

```text
                    👤 WARGA
                       │
                       ▼
                💳 CITIZEN ID
                       │
                       ▼
                 🗺️ SMART MAP
                       │
               Cari station
                       │
                       ▼
                🚲 BIKE STATION
                       │
                       ▼
                    RFID
                       │
                       ▼
                    ESP32
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Smart Lock    Sensor       GPS*
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
                    SERVER
                       │
                  DATABASE
                       │
              ┌────────┴────────┐
              ▼                 ▼
          SMART MAP         DASHBOARD

*GPS dapat berupa modul GPS atau lokasi dari smartphone,
tergantung implementasi prototype.
```

---

# 6. Registrasi Pengguna

Pengguna melakukan pendaftaran melalui website.

Konsep registrasi mengikuti platform Citizen ID.

Alur:

```text
Pengguna membuka website
        ↓
Pilih "Daftar"
        ↓
Scan KTP menggunakan kamera HP
        ↓
OCR membaca informasi KTP
        ↓
Data dimasukkan ke formulir
        ↓
Pengguna melengkapi data
        ↓
Validasi
        ↓
Akun dibuat
        ↓
Citizen ID dibuat
        ↓
Citizen ID dihubungkan dengan RFID
```

Pada prototype, sistem tidak perlu mengambil data langsung dari database Dukcapil.

---

# 7. Citizen ID

Setiap pengguna memiliki identitas internal.

Contoh:

```text
Citizen ID : CIT-000127
Nama       : Pengguna
Status     : ACTIVE
```

RFID digunakan sebagai media autentikasi.

```text
RFID Card
    ↓
Card ID
    ↓
Citizen ID
    ↓
User
```

Kartu tidak perlu menyimpan seluruh data pribadi.

---

# 8. Smart Bike Station

Sepeda dikelompokkan berdasarkan station.

Contoh:

```text
ST-B01
TAMAN KOTA

B-001 🟢
B-002 🔴
B-003 🟢
B-004 🟢
B-005 🟡
```

Station menyimpan:

```text
Station ID
Nama
Alamat
Latitude
Longitude
Status
```

Data ini digunakan oleh Smart Map.

---

# 9. Smart Bike Map

Pengguna dapat membuka halaman:

> **Cari Smart Bike**

Map menampilkan seluruh station.

Contoh:

```text
                  SMART BIKE MAP

        📍 ST-B01
        Taman Kota
        🚲 4 tersedia

                    📍 ST-B02
                    Alun-Alun
                    🚲 2 tersedia

                              📍 ST-B03
                              Balai Warga
                              🚲 0 tersedia
```

Marker dapat menunjukkan:

```text
🟢 = tersedia
🔴 = tidak tersedia
🟡 = maintenance
```

---

# 10. Detail Bike Station

Ketika pengguna memilih station:

```text
SMART BIKE STATION

Taman Kota

Total Sepeda : 10
Tersedia     : 6
Digunakan    : 3
Maintenance  : 1

B-001 🟢
B-002 🔴
B-003 🟢
B-004 🟢
B-005 🟡

[LIHAT DETAIL]
[BUKA RUTE]
```

---

# 11. Cari Sepeda Terdekat

Sistem dapat menggunakan lokasi pengguna untuk mencari station terdekat.

Alur:

```text
Lokasi pengguna
       ↓
Cari station terdekat
       ↓
Cek jumlah sepeda tersedia
       ↓
Urutkan berdasarkan jarak
       ↓
Tampilkan hasil
```

Contoh:

```text
🚲 SMART BIKE TERDEKAT

1. Taman Kota
   350 meter
   🟢 6 sepeda tersedia

2. Alun-Alun
   700 meter
   🟢 3 sepeda tersedia

3. Balai Warga
   1.2 km
   🔴 Tidak tersedia
```

---

# 12. Navigasi

Pengguna dapat memilih station kemudian mendapatkan rute.

```text
Taman Kota
350 meter

[BUKA RUTE]
```

Sistem dapat mengarahkan pengguna menuju station menggunakan layanan peta yang digunakan pada aplikasi.

---

# 13. Indikator LED

Setiap docking point atau sepeda dapat memiliki indikator LED.

```text
🟢 HIJAU  = AVAILABLE
🔴 MERAH  = IN USE
🟡 KUNING = MAINTENANCE / ERROR
```

Contoh:

```text
┌─────────┐
│ 🚲  🟢  │
│  B-001  │
└─────────┘

┌─────────┐
│ 🚲  🔴  │
│  B-002  │
└─────────┘
```

Status LED mengikuti status pada server.

---

# 14. Proses Peminjaman

Alur utama:

```text
Pengguna mencari station
        ↓
Melihat sepeda tersedia
        ↓
Datang ke station
        ↓
Tap RFID
        ↓
ESP32 membaca Card ID
        ↓
Server mencari Citizen ID
        ↓
Validasi pengguna
        ↓
Memilih sepeda tersedia
        ↓
Smart Lock terbuka
        ↓
Pengguna mengambil sepeda
        ↓
Status = IN USE
```

---

# 15. Validasi Pengguna

Server melakukan pengecekan:

```text
User terdaftar?
      ↓
Akun aktif?
      ↓
Tidak sedang meminjam sepeda?
      ↓
Sepeda tersedia?
```

Jika valid:

```text
ACCESS GRANTED
```

Jika tidak:

```text
ACCESS DENIED
```

Sepeda tetap terkunci apabila validasi gagal.

---

# 16. Smart Unlock

Setelah validasi berhasil:

```text
SERVER
   ↓
COMMAND = UNLOCK
   ↓
ESP32
   ↓
Lock Driver
   ↓
Electronic Lock
   ↓
🔓 SEPeda TERBUKA
```

Pengguna kemudian dapat mengambil sepeda dari docking.

---

# 17. Sensor Docking

Sistem menggunakan sensor untuk mengetahui apakah sepeda masih berada pada docking.

Status:

```text
DOCKED
UNDocked
```

Alur:

```text
Sepeda masih di docking
        ↓
User melakukan tap
        ↓
UNLOCK
        ↓
Sepeda diambil
        ↓
Sensor mendeteksi
        ↓
UNDocked
        ↓
Status = IN USE
```

Sensor dapat menggunakan:

* reed switch;
* magnetic sensor;
* limit switch;
* sensor proximity sesuai kebutuhan prototype.

---

# 18. Status Sepeda

Setiap sepeda memiliki status:

```text
AVAILABLE
IN_USE
MAINTENANCE
OFFLINE
ERROR
```

Contoh:

```text
B-001 🟢 AVAILABLE
B-002 🔴 IN_USE
B-003 🟡 MAINTENANCE
B-004 ⚫ OFFLINE
```

---

# 19. Tracking Perjalanan

Berbeda dengan Smart Locker, Smart Bike memiliki komponen **tracking perjalanan** karena sepeda berpindah lokasi.

Sistem mencatat:

```text
Bike ID
User ID
Start Station
Start Time
Current Location
End Station
End Time
Duration
```

Contoh:

```text
Bike ID : B-001
User    : CIT-000127

Start:
Taman Kota

Current:
Jl. Ahmad Yani

Duration:
35 menit
```

---

# 20. Lokasi Sepeda

Lokasi dapat diperoleh menggunakan:

### Opsi A — GPS Module

GPS dipasang pada sepeda.

```text
GPS
 ↓
ESP32
 ↓
Server
 ↓
Database
```

### Opsi B — Smartphone

Jika prototype tidak menggunakan GPS module, lokasi dapat diperoleh dari smartphone pengguna selama perjalanan.

```text
Smartphone
    ↓
GPS
    ↓
Web / App
    ↓
Server
```

Untuk prototype mahasiswa, opsi smartphone dapat digunakan untuk mengurangi jumlah hardware.

---

# 21. Tracking pada Map

Admin dapat melihat sepeda yang sedang digunakan.

Contoh:

```text
SMART BIKE MONITORING

🚲 B-001
Status : IN USE
User   : CIT-000127
Start  : Taman Kota
Current: Jl. Ahmad Yani
```

Posisi sepeda dapat ditampilkan pada map.

Untuk menjaga privasi, **detail lokasi perjalanan tidak ditampilkan kepada publik**.

Publik cukup melihat:

* station;
* jumlah sepeda tersedia;
* status umum.

---

# 22. Return Station

Sepeda dikembalikan ke Smart Bike Station.

Contoh:

```text
START
ST-B01
Taman Kota
       │
       │
       ▼
    🚲 B-001
       │
       │
       ▼
RETURN
ST-B02
Alun-Alun
```

Sistem mencatat:

```text
Start Station : ST-B01
End Station   : ST-B02
```

---

# 23. Smart Return Lock

Ketika sepeda dimasukkan ke docking station:

```text
Sepeda dimasukkan
       ↓
Sensor mendeteksi
       ↓
Lock aktif
       ↓
Status = RETURNED
       ↓
Transaction selesai
```

LED berubah:

```text
🔴 IN USE
     ↓
🟢 AVAILABLE
```

---

# 24. Penyelesaian Transaksi

Contoh:

```text
Bike ID : B-001
User    : CIT-000127

Start:
14:30

Return:
15:18

Duration:
48 menit

From:
Taman Kota

To:
Alun-Alun

Status:
COMPLETED
```

Server kemudian memperbarui:

```text
B-001
AVAILABLE
```

---

# 25. Riwayat Perjalanan Pengguna

Pengguna dapat melihat riwayat:

```text
RIWAYAT PERJALANAN

🚲 B-001
Taman Kota → Alun-Alun
48 menit

🚲 B-003
Alun-Alun → Taman Kota
32 menit

🚲 B-002
Balai Warga → Taman Kota
25 menit
```

---

# 26. Activity Log

Semua aktivitas dicatat.

Contoh:

```text
14:30
CIT-000127
ACCESS B-001
SUCCESS

14:30
B-001
UNLOCK

14:31
B-001
UNDocked

14:31
B-001
TRIP STARTED

15:18
B-001
DOCKED

15:18
B-001
LOCKED

15:18
TRIP COMPLETED
```

Activity log digunakan untuk:

* audit;
* monitoring;
* troubleshooting;
* analisis penggunaan.

---

# 27. Dashboard Pengelola

Dashboard menampilkan:

```text
SMART BIKE DASHBOARD

Total Bike       : 30
Available        : 18
In Use           : 9
Maintenance      : 2
Offline          : 1

Station Aktif    : 5
Active Trips     : 9
Trip Hari Ini    : 67
```

---

# 28. Monitoring Station

Contoh:

```text
ST-B01
TAMAN KOTA

B-001 🟢
B-002 🔴
B-003 🟢
B-004 🟢
B-005 🟡

Available : 3
In Use    : 1
Maintenance : 1
```

---

# 29. Monitoring Device IoT

Dashboard juga memonitor ESP32.

```text
DEVICE STATUS

ESP32-B001 🟢 ONLINE
ESP32-B002 🟢 ONLINE
ESP32-B003 🟢 ONLINE
ESP32-B004 🔴 OFFLINE
```

Sistem menyimpan:

```text
Device ID
Last Seen
Connection Status
Firmware Version
Status
```

---

# 30. Error Detection

Sistem dapat mendeteksi:

### Device Offline

```text
B-004
Last Seen:
10 menit lalu

⚠ OFFLINE
```

### Lock Error

```text
Command:
UNLOCK

Sensor:
LOCKED

⚠ LOCK ERROR
```

### Docking Error

```text
B-003

Docking:
NOT DETECTED

⚠ CHECK DOCK
```

---

# 31. Maintenance Mode

Operator dapat menonaktifkan sepeda.

```text
AVAILABLE
    ↓
MAINTENANCE
```

Ketika maintenance:

```text
B-003

🟡 MAINTENANCE

Sepeda tidak tersedia.
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

# 32. Statistik Penggunaan

Sistem dapat menghasilkan statistik.

### Jumlah perjalanan

```text
Senin     32
Selasa    41
Rabu      38
Kamis     52
Jumat     67
```

### Station paling ramai

```text
Taman Kota     124 trip
Alun-Alun       97 trip
Balai Warga     63 trip
```

### Sepeda paling sering digunakan

```text
B-001 → 34 trip
B-003 → 29 trip
B-005 → 25 trip
```

---

# 33. Rute yang Sering Digunakan

Jika sistem menyimpan station awal dan akhir:

```text
Taman Kota → Alun-Alun
87 perjalanan

Alun-Alun → Balai Warga
52 perjalanan

Balai Warga → Taman Kota
41 perjalanan
```

Data ini dapat membantu pengelola mengetahui pola penggunaan fasilitas.

---

# 34. Database

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

## bikes

```text
id
bike_code
station_id
status
lock_status
dock_status
device_id
created_at
updated_at
```

## bike_trips

```text
id
bike_id
user_id
start_station_id
end_station_id
start_time
end_time
start_latitude
start_longitude
end_latitude
end_longitude
duration
status
```

## bike_locations

```text
id
bike_id
latitude
longitude
recorded_at
```

## devices

```text
id
device_code
esp32_id
bike_id
last_seen
status
```

## activity_logs

```text
id
user_id
bike_id
action
description
created_at
```

---

# 35. Arsitektur Hardware

```text
                     🚲 SMART BIKE
                           │
                      ┌────▼────┐
                      │  ESP32  │
                      └────┬────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   RFID Reader        Smart Lock          Sensor Dock
        │                  │                  │
        │                  ▼                  │
        │             Electronic Lock         │
        │                                     │
        │                  ┌──────────────────┘
        │                  │
        ▼                  ▼
     User ID             LED
                           │
                     🟢 / 🔴 / 🟡
                           │
                           ▼
                        SERVER
                           │
                       DATABASE
```

Jika menggunakan GPS:

```text
GPS Module
    ↓
ESP32
    ↓
Server
    ↓
Bike Location
```

---

# 36. Komponen Hardware Prototype

### Controller

* ESP32

### Identifikasi

* RFID RC522
* RFID Card

### Lock

* Electronic bike lock / solenoid lock / electromagnetic lock
* Relay atau MOSFET driver sesuai jenis lock

### Sensor

* Reed switch
* Magnetic sensor
* Limit switch / proximity sensor

### Indicator

* LED hijau
* LED merah
* LED kuning
* Buzzer opsional

### Tracking

* GPS module opsional

### Power

* Power supply sesuai kebutuhan ESP32 dan lock.

---

# 37. Komunikasi IoT

Alur:

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

Server dapat mengirim command:

```text
SERVER
 ↓
API / MQTT
 ↓
ESP32
 ↓
UNLOCK
 ↓
Smart Lock
```

Untuk prototype, HTTP/HTTPS dapat digunakan.

Jika sistem dikembangkan menjadi banyak station, MQTT dapat digunakan untuk komunikasi IoT.

---

# 38. Contoh API

Ketika pengguna melakukan tap:

```text
POST /api/bike/access
```

Data:

```text
{
    "citizen_id": "CIT-000127",
    "station_id": "ST-B01",
    "card_id": "RFID-001"
}
```

Server melakukan:

```text
Validasi User
       ↓
Cari Bike Available
       ↓
Assign Bike
       ↓
Return Command
```

Response:

```text
{
    "status": "approved",
    "bike": "B-001",
    "command": "unlock"
}
```

---

# 39. Keamanan

Sistem harus memperhatikan keamanan identitas dan sepeda.

Prinsip:

1. RFID hanya digunakan sebagai identifier.
2. Data pribadi disimpan di server.
3. Pengguna hanya dapat membuka sepeda yang diberikan sistem.
4. Semua akses dicatat.
5. Password menggunakan hashing.
6. API menggunakan HTTPS.
7. Device IoT menggunakan autentikasi.
8. Command unlock harus divalidasi server.
9. Dashboard menggunakan role-based access.
10. Tracking perjalanan tidak ditampilkan secara publik.

---

# 40. Role Pengguna

## Citizen

Dapat:

* melihat Smart Bike Map;
* mencari station terdekat;
* melihat jumlah sepeda;
* meminjam sepeda;
* mengembalikan sepeda;
* melihat riwayat perjalanan.

## Operator

Dapat:

* melihat seluruh sepeda;
* melihat perjalanan aktif;
* melihat lokasi sepeda;
* melihat station;
* melakukan maintenance;
* melihat activity log.

## Admin

Dapat:

* mengelola user;
* mengelola station;
* mengelola sepeda;
* mengelola device;
* mengelola sistem;
* melihat laporan.

---

# 41. Batasan Prototype

Untuk menjaga proyek tetap realistis:

1. Prototype hanya menggunakan beberapa sepeda.
2. Prototype hanya menggunakan beberapa station.
3. RFID digunakan sebagai representasi Citizen ID.
4. Sistem tidak mengambil data langsung dari Dukcapil.
5. Smart Map menggunakan koordinat station.
6. Tracking sepeda dapat menggunakan GPS module atau lokasi smartphone.
7. Sistem belum mengelola seluruh sepeda dalam satu kota.
8. Pembayaran belum menjadi fokus utama.
9. Keamanan fisik sepeda masih berupa prototype.
10. Tracking real-time dapat dibatasi interval tertentu agar tidak membebani server.

---

# 42. Teknologi Map

Untuk prototype:

```text
Leaflet
    +
OpenStreetMap
    +
Latitude / Longitude
    +
Database Station
```

Data station:

```text
ST-B01
Nama     : Taman Kota
Latitude : -7.xxxxx
Longitude: 110.xxxxx
```

Website menggunakan data tersebut untuk menampilkan marker.

---

# 43. Fitur Tambahan

Fitur berikut dapat dikembangkan setelah fitur utama selesai:

### Reservation

Pengguna dapat memesan sepeda.

```text
AVAILABLE
    ↓
RESERVED
    ↓
IN USE
```

### QR Code

QR Code dapat digunakan sebagai alternatif RFID.

### Notification

Sistem dapat memberikan:

* peminjaman berhasil;
* pengembalian berhasil;
* peringatan waktu;
* sepeda bermasalah;
* station penuh.

### Battery Monitoring

Jika menggunakan sepeda listrik:

```text
B-001
Battery : 87%
```

Fitur ini tidak diperlukan jika prototype menggunakan sepeda biasa.

---

# 44. Integrasi dengan Smart Locker

Smart Bike dan Smart Locker dapat berada dalam satu platform.

```text
                    CITIZEN PLATFORM
                           │
                      CITIZEN ID
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        🚲 SMART BIKE              🔐 SMART LOCKER
              │                         │
        Bike Station              Locker Station
              │                         │
        RFID / NFC                RFID / NFC
              │                         │
            ESP32                     ESP32
              │                         │
         Smart Lock                Smart Lock
              │                         │
        Real-time Status          Real-time Status
              │                         │
              └────────────┬────────────┘
                           │
                         SERVER
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                 🗺️ MAP       📊 DASHBOARD
```

Keduanya memiliki pola sistem yang sama tetapi fungsi yang berbeda.

### Smart Bike

```text
Cari station
     ↓
Lihat sepeda
     ↓
Tap Citizen ID
     ↓
Unlock
     ↓
Tracking perjalanan
     ↓
Return
     ↓
Lock
```

### Smart Locker

```text
Cari station
     ↓
Lihat locker
     ↓
Tap Citizen ID
     ↓
Unlock
     ↓
Simpan barang
     ↓
Lock
     ↓
Ambil barang
```

---

# 45. Nilai Inovasi

Smart Bike tidak hanya merupakan sepeda yang dapat dibuka menggunakan RFID.

Nilai inovasi terletak pada integrasi:

```text
Citizen ID
     +
Smart Bike Station
     +
IoT
     +
Smart Lock
     +
Real-Time Availability
     +
Smart Map
     +
Tracking
     +
Server
     +
Dashboard
```

Masyarakat dapat:

> **mencari → melihat ketersediaan → menuju station → autentikasi → menggunakan sepeda → memantau perjalanan → mengembalikan sepeda.**

Pengelola dapat:

> **memonitor → mengetahui lokasi → melihat penggunaan → mengetahui station ramai → melakukan maintenance → menganalisis kebutuhan fasilitas.**

---

# 46. Skenario Lengkap Penggunaan

### Step 1 — Mencari Sepeda

Pengguna membuka Smart Bike Map.

```text
Taman Kota
350 meter
🟢 4 sepeda tersedia
```

Pengguna memilih:

```text
[BUKA RUTE]
```

---

### Step 2 — Datang ke Station

Pengguna tiba:

```text
ST-B01
Taman Kota

B-001 🟢
B-002 🔴
B-003 🟢
B-004 🟢
```

---

### Step 3 — Tap Citizen ID

Pengguna melakukan tap RFID.

```text
RFID
 ↓
ESP32
 ↓
Server
 ↓
CIT-000127
```

Server melakukan validasi.

```text
ACCESS GRANTED
```

---

### Step 4 — Sepeda Dibuka

Server memilih:

```text
B-001
```

Command:

```text
UNLOCK B-001
```

Electronic lock terbuka.

```text
🔓
```

---

### Step 5 — Sepeda Diambil

Sensor mendeteksi:

```text
DOCK = EMPTY
```

Server memperbarui:

```text
B-001
IN USE
```

LED:

```text
🟢 → 🔴
```

Map:

```text
Taman Kota
3 sepeda tersedia
```

---

### Step 6 — Perjalanan

Sistem mencatat:

```text
User:
CIT-000127

Bike:
B-001

Start:
Taman Kota

Start Time:
14:30
```

Lokasi sepeda dapat diperbarui secara berkala.

---

### Step 7 — Pengembalian

Pengguna datang ke:

```text
ST-B02
Alun-Alun
```

Sepeda dimasukkan ke docking.

Sensor mendeteksi:

```text
DOCK = OCCUPIED
```

Lock:

```text
🔒
```

---

### Step 8 — Transaksi Selesai

Server mencatat:

```text
Start Station:
Taman Kota

End Station:
Alun-Alun

Duration:
48 menit

Status:
COMPLETED
```

B-001:

```text
🔴 → 🟢
```

Map diperbarui:

```text
ST-B02
🟢 +1 Available Bike
```

---

# 47. Ringkasan Alur Sistem

```text
                    📱 WEB / APP
                         │
                         ▼
                    🗺️ SMART MAP
                         │
                 Cari Bike Station
                         │
                         ▼
                   📍 STATION
                         │
                  🚲 AVAILABLE
                         │
                         ▼
                    💳 RFID
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
                   🔓 UNLOCK
                         │
                         ▼
                  🚲 AMBIL SEPEDA
                         │
                         ▼
                    🔴 IN USE
                         │
                         ▼
                  📍 TRACKING
                         │
                         ▼
                   PERJALANAN
                         │
                         ▼
                  RETURN STATION
                         │
                         ▼
                    🔒 LOCK
                         │
                         ▼
                  🟢 AVAILABLE
                         │
                         ▼
                   SERVER UPDATE
                         │
                         ▼
                    🗺️ MAP UPDATE
                         │
                         ▼
                  📊 ACTIVITY LOG
```

---

# 48. Inti Konsep

**Smart Bike** merupakan sistem transportasi sepeda publik skala kelurahan/kota yang memanfaatkan Citizen ID sebagai autentikasi, IoT sebagai pengendali akses sepeda, Smart Map sebagai media pencarian fasilitas, serta sistem tracking dan database sebagai media monitoring penggunaan.

Sistem menghubungkan:

> **Identitas → Citizen ID → Smart Map → Bike Station → RFID → ESP32 → Smart Lock → Sensor → Tracking → Server → Dashboard**

Dengan konsep tersebut, masyarakat dapat menggunakan sepeda publik dengan lebih mudah dan terkontrol, sementara pengelola memperoleh data penggunaan fasilitas secara terpusat.

Smart Bike juga dapat menjadi salah satu layanan dalam ekosistem **Citizen Platform** bersama Smart Locker dan layanan publik IoT lainnya.
