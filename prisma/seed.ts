import { PrismaClient, Role, StatusMitra, StatusWarga, MetodeBayar, PeriodeReset } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getCurrentPeriode(reset: PeriodeReset): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  if (reset === "harian") return `${y}-${m}-${d}`;
  if (reset === "mingguan") {
    const jan1 = new Date(y, 0, 1);
    const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
    const week = Math.ceil((days + jan1.getDay() + 1) / 7);
    return `${y}-W${String(week).padStart(2, "0")}`;
  }
  if (reset === "sekali") return "once";
  return `${y}-${m}`;
}

async function main() {
  // Bersihkan data lama (urutan FK)
  await prisma.qRToken.deleteMany();
  await prisma.pesertaFieldValueLokaID.deleteMany();
  await prisma.dependentLokaID.deleteMany();
  await prisma.programFieldLokaID.deleteMany();
  await prisma.statusPesertaLokaID.deleteMany();
  await prisma.programAktivitasLokaID.deleteMany();
  await prisma.aktivitasLokaID.deleteMany();
  await prisma.pesertaLokaID.deleteMany();
  await prisma.programLokaID.deleteMany();
  await prisma.transaksi.deleteMany();
  await prisma.saldo.deleteMany();
  await prisma.scanPending.deleteMany();
  await prisma.warga.deleteMany();
  await prisma.programSubsidi.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cabang.deleteMany();
  await prisma.penduduk.deleteMany();
  await prisma.mitra.deleteMany();

  const hash = await bcrypt.hash("mitra123", 10);

  // User pusat Identiva
  await prisma.user.create({ data: { username: "platform", passwordHash: hash, role: Role.admin_platform } });

  // ════════════════════════════════════════
  // MITRA 1 — SPBU Pertamina (tipe: subsidi)
  // ════════════════════════════════════════
  const pertamina = await prisma.mitra.create({
    data: {
      nama: "SPBU Pertamina",
      kode: "SPBU-PERTA-001",
      skala: "besar",
      jenisLayanan: "BBM (SPBU)",
      tipeMitra: "subsidi",
      status: StatusMitra.aktif,
      tokenApi: "tok_spbu_pertamina_induk_2026_x9y8z7",
      saldoDefault: 200000,
      metodeScanDiizinkan: ["alat_esp32"],
    },
  });

  // Cabang Pertamina
  const cabangData = [
    { nama: "SPBU Fatmawati", kode: "SPBU-PERTA-JKT-001", alamat: "Jl. RS Fatmawati No. 47, Jakarta Selatan", tokenApi: "tok_fatmawati_2026_f1a2t3m4a5w6" },
    { nama: "SPBU Sudirman",  kode: "SPBU-PERTA-JKT-002", alamat: "Jl. Jend. Sudirman Kav. 10, Jakarta Pusat", tokenApi: "tok_sudirman_2026_s1u2d3i4r5m6" },
    { nama: "SPBU Kemang",    kode: "SPBU-PERTA-JKT-003", alamat: "Jl. Kemang Raya No. 5, Jakarta Selatan",   tokenApi: "tok_kemang_2026_k1e2m3a4n5g6" },
  ];
  const cabangRecords = [];
  for (const c of cabangData) {
    cabangRecords.push(await prisma.cabang.create({ data: { ...c, status: StatusMitra.aktif, mitraId: pertamina.id, metodeScanAktif: "alat_esp32" } }));
  }
  const [fatmawati, sudirman, kemang] = cabangRecords;

  // User Pertamina
  await prisma.user.create({ data: { username: "admin",      passwordHash: hash, role: Role.admin_mitra,  mitraId: pertamina.id } });
  await prisma.user.create({ data: { username: "fatmawati",  passwordHash: hash, role: Role.admin_cabang, mitraId: pertamina.id, cabangId: fatmawati.id } });
  await prisma.user.create({ data: { username: "sudirman",   passwordHash: hash, role: Role.admin_cabang, mitraId: pertamina.id, cabangId: sudirman.id } });
  await prisma.user.create({ data: { username: "kemang",     passwordHash: hash, role: Role.admin_cabang, mitraId: pertamina.id, cabangId: kemang.id } });

  // Program Pertamina
  const pertalite = await prisma.programSubsidi.create({ data: { nama: "Pertalite", bersubsidi: true,  diskon: 30, periodeReset: PeriodeReset.bulanan, mitraId: pertamina.id } });
  const pertamax  = await prisma.programSubsidi.create({ data: { nama: "Pertamax",  bersubsidi: true,  diskon: 10, periodeReset: PeriodeReset.bulanan, mitraId: pertamina.id } });
  await prisma.programSubsidi.create({ data: { nama: "Biosolar", bersubsidi: false, diskon: 0,  periodeReset: PeriodeReset.bulanan, mitraId: pertamina.id } });

  // Penduduk (shared)
  const pendudukData = [
    { nik: "3201234567890001", nama: "Budi Santoso",    alamat: "Jl. Melati No. 12, Bandung",  uidKartu: "A1B2C3D4" },
    { nik: "3201234567890002", nama: "Siti Aminah",     alamat: "Jl. Kenanga No. 5, Bandung",  uidKartu: "E5F6G7H8" },
    { nik: "3201234567890003", nama: "Agus Hermawan",   alamat: "Jl. Dahlia No. 8, Cimahi",    uidKartu: "I9J0K1L2" },
    { nik: "3201234567890004", nama: "Dewi Lestari",    alamat: "Jl. Anggrek No. 3, Bandung",  uidKartu: "M3N4O5P6" },
    { nik: "3201234567890005", nama: "Eko Prasetyo",    alamat: "Jl. Mawar No. 17, Cimahi",    uidKartu: "Q7R8S9T0" },
    { nik: "3201234567890006", nama: "Fitri Handayani", alamat: "Jl. Cempaka No. 9, Bandung",  uidKartu: "U1V2W3X4" },
  ];
  const pendudukRecords: { id: number }[] = [];
  for (const p of pendudukData) pendudukRecords.push(await prisma.penduduk.create({ data: p }));

  // Warga Pertamina
  const wargaRecords: { id: number }[] = [];
  for (const p of pendudukRecords) {
    wargaRecords.push(await prisma.warga.create({ data: { pendudukId: p.id, mitraId: pertamina.id, status: StatusWarga.aktif } }));
  }

  // Saldo Pertamina
  const periode = getCurrentPeriode(PeriodeReset.bulanan);
  const saldoTerpakai = [0, 15000, 30000, 50000, 90000, 150000];
  for (let i = 0; i < pendudukRecords.length; i++) {
    await prisma.saldo.create({ data: { pendudukId: pendudukRecords[i].id, mitraId: pertamina.id, saldoTotal: 200000, saldoTerpakai: saldoTerpakai[i], periode } });
  }

  // Transaksi Pertamina tersebar di 3 cabang
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
  const w = (i: number) => wargaRecords[i].id;

  const trxData = [
    { wargaId: w(0), cabangId: fatmawati.id, progId: pertalite.id, nominal: 50000,  diskon: 30, waktu: today,      metode: MetodeBayar.cash },
    { wargaId: w(1), cabangId: fatmawati.id, progId: pertalite.id, nominal: 30000,  diskon: 30, waktu: today,      metode: MetodeBayar.qris },
    { wargaId: w(2), cabangId: fatmawati.id, progId: pertamax.id,  nominal: 100000, diskon: 10, waktu: today,      metode: MetodeBayar.cash },
    { wargaId: w(0), cabangId: fatmawati.id, progId: pertalite.id, nominal: 40000,  diskon: 30, waktu: yesterday,  metode: MetodeBayar.cash },
    { wargaId: w(3), cabangId: fatmawati.id, progId: pertamax.id,  nominal: 75000,  diskon: 10, waktu: yesterday,  metode: MetodeBayar.qris },
    { wargaId: w(1), cabangId: sudirman.id,  progId: pertamax.id,  nominal: 80000,  diskon: 10, waktu: today,      metode: MetodeBayar.qris },
    { wargaId: w(3), cabangId: sudirman.id,  progId: pertalite.id, nominal: 60000,  diskon: 30, waktu: today,      metode: MetodeBayar.cash },
    { wargaId: w(4), cabangId: sudirman.id,  progId: pertalite.id, nominal: 35000,  diskon: 30, waktu: twoDaysAgo, metode: MetodeBayar.cash },
    { wargaId: w(4), cabangId: kemang.id,    progId: pertalite.id, nominal: 55000,  diskon: 30, waktu: today,      metode: MetodeBayar.cash },
    { wargaId: w(5), cabangId: kemang.id,    progId: pertamax.id,  nominal: 90000,  diskon: 10, waktu: today,      metode: MetodeBayar.qris },
    { wargaId: w(5), cabangId: kemang.id,    progId: pertalite.id, nominal: 20000,  diskon: 30, waktu: yesterday,  metode: MetodeBayar.cash },
    { wargaId: w(2), cabangId: kemang.id,    progId: pertamax.id,  nominal: 65000,  diskon: 10, waktu: yesterday,  metode: MetodeBayar.qris },
  ];
  for (const t of trxData) {
    const diskonRupiah = Math.floor((t.nominal * t.diskon) / 100);
    await prisma.transaksi.create({ data: { wargaId: t.wargaId, mitraId: pertamina.id, cabangId: t.cabangId, programSubsidiId: t.progId, nominal: t.nominal, diskon: t.diskon, diskonRupiah, totalBayar: t.nominal - diskonRupiah, metodeBayar: t.metode, waktu: t.waktu } });
  }

  await prisma.scanPending.create({ data: { cabangId: fatmawati.id, uidKartu: "Y5Z6A7B8" } });

  // ════════════════════════════════════════
  // MITRA 2 — LokaID (tipe: lokaid)
  // ════════════════════════════════════════
  const lokaidMitra = await prisma.mitra.create({
    data: {
      nama: "LokaID",
      kode: "LKID-001",
      skala: "kecil",
      jenisLayanan: "Layanan Masyarakat",
      tipeMitra: "lokaid",
      status: StatusMitra.aktif,
      tokenApi: "tok_lokaid_2026_main001",
      saldoDefault: 0,
      metodeScanDiizinkan: ["alat_esp32", "hp_nfc"],
    },
  });

  await prisma.user.create({ data: { username: "lokaid", passwordHash: hash, role: Role.admin_mitra, mitraId: lokaidMitra.id } });

  // ── Wilayah LokaID — Kelurahan di Kec. Kraton, Yogyakarta ──
  const wilayahData = [
    { nama: "Kelurahan Patehan",   kode: "LKID-PTH-001", alamat: "Jl. KH. Ahmad Dahlan No. 1, Patehan, Kraton, Yogyakarta",  tokenApi: "tok_wil_patehan_2026_p1a2t3e4" },
    { nama: "Kelurahan Kadipaten", kode: "LKID-KDP-002", alamat: "Jl. Kadipaten No. 5, Kadipaten, Kraton, Yogyakarta",        tokenApi: "tok_wil_kadipaten_2026_k5a6d7i8" },
  ];
  const wilayahRecords: { id: number; nama: string; tokenApi: string }[] = [];
  for (const w of wilayahData) {
    const wil = await prisma.cabang.create({ data: { ...w, status: StatusMitra.aktif, mitraId: lokaidMitra.id, metodeScanAktif: "alat_esp32" } });
    wilayahRecords.push({ id: wil.id, nama: wil.nama, tokenApi: wil.tokenApi });
  }
  const [wilPatehan, wilKadipaten] = wilayahRecords;

  // User per wilayah
  await prisma.user.create({ data: { username: "patehan",   passwordHash: hash, role: Role.admin_cabang, mitraId: lokaidMitra.id, cabangId: wilPatehan.id } });
  await prisma.user.create({ data: { username: "kadipaten", passwordHash: hash, role: Role.admin_cabang, mitraId: lokaidMitra.id, cabangId: wilKadipaten.id  } });

  // Simulasi scan dari alat ESP32 (perangkat fisik belum ada saat proposal disusun)
  await prisma.scanPending.create({ data: { cabangId: wilPatehan.id,   uidKartu: "A1B2C3D4" } });
  await prisma.scanPending.create({ data: { cabangId: wilKadipaten.id, uidKartu: "E5F6G7H8" } });

  // ── Program LokaID — 5 tujuan berbeda ──

  // 1. BANTUAN — Distribusi sembako (program wilayah Patehan)
  const progSembako = await prisma.programLokaID.create({
    data: {
      nama: "Bantuan Sembako Agustus",
      deskripsi: "Distribusi bantuan sembako untuk warga kurang mampu bulan Agustus 2026.",
      tujuan: "bantuan",
      kuotaTotal: 1,
      periodeReset: PeriodeReset.bulanan,
      perluVerifikasi: false,
      status: "aktif",
      mitraId: lokaidMitra.id,
      cabangId: wilPatehan.id,
      tanggalMulai: new Date("2026-08-01"),
      tanggalSelesai: new Date("2026-08-31"),
    },
  });
  await prisma.programAktivitasLokaID.createMany({
    data: [
      { programId: progSembako.id, jenis: "verifikasi", urutan: 0 },
      { programId: progSembako.id, jenis: "distribusi", urutan: 1 },
    ],
  });

  // 2. KEGIATAN — Posyandu (program wilayah Patehan, sasaran anak)
  const progPosyandu = await prisma.programLokaID.create({
    data: {
      nama: "Posyandu Balita Agustus",
      deskripsi: "Kegiatan posyandu rutin untuk balita usia 0-5 tahun.",
      tujuan: "kegiatan",
      sasaran: "anak",
      kuotaTotal: null,
      periodeReset: PeriodeReset.bulanan,
      perluVerifikasi: false,
      status: "aktif",
      mitraId: lokaidMitra.id,
      cabangId: wilPatehan.id,
      tanggalMulai: new Date("2026-08-15"),
      tanggalSelesai: new Date("2026-08-15"),
    },
  });
  await prisma.programAktivitasLokaID.createMany({
    data: [
      { programId: progPosyandu.id, jenis: "checkin",  urutan: 0 },
      { programId: progPosyandu.id, jenis: "pendataan", urutan: 1 },
    ],
  });
  // Field tambahan untuk Posyandu
  await prisma.programFieldLokaID.createMany({
    data: [
      { programId: progPosyandu.id, nama: "Berat Badan (kg)", kode: "berat_badan", tipe: "number", wajib: true,  urutan: 0 },
      { programId: progPosyandu.id, nama: "Tinggi Badan (cm)", kode: "tinggi_badan", tipe: "number", wajib: true,  urutan: 1 },
      { programId: progPosyandu.id, nama: "Status Gizi",       kode: "status_gizi",  tipe: "dropdown", wajib: true,  urutan: 2, opsi: JSON.stringify(["Baik","Kurang","Buruk"]) },
      { programId: progPosyandu.id, nama: "Catatan",           kode: "catatan",      tipe: "text",     wajib: false, urutan: 3 },
    ],
  });

  // 3. PENDATAAN — UMKM (program wilayah Kadipaten)
  const progUMKM = await prisma.programLokaID.create({
    data: {
      nama: "Pendataan UMKM 2026",
      deskripsi: "Pendataan usaha mikro kecil menengah di kelurahan.",
      tujuan: "pendataan",
      kuotaTotal: null,
      periodeReset: PeriodeReset.bulanan,
      perluVerifikasi: true,
      status: "aktif",
      mitraId: lokaidMitra.id,
      cabangId: wilKadipaten.id,
    },
  });
  await prisma.programAktivitasLokaID.createMany({
    data: [
      { programId: progUMKM.id, jenis: "pendataan",  urutan: 0 },
      { programId: progUMKM.id, jenis: "verifikasi", urutan: 1 },
    ],
  });

  // 4. PEMINJAMAN — Alat olahraga (program wilayah Kadipaten)
  const progPeminjaman = await prisma.programLokaID.create({
    data: {
      nama: "Peminjaman Alat Olahraga",
      deskripsi: "Pinjam alat olahraga milik kelurahan: bola, net, raket.",
      tujuan: "peminjaman",
      kuotaTotal: 5,
      periodeReset: PeriodeReset.harian,
      perluVerifikasi: true,
      status: "aktif",
      mitraId: lokaidMitra.id,
      cabangId: wilKadipaten.id,
    },
  });
  await prisma.programAktivitasLokaID.createMany({
    data: [
      { programId: progPeminjaman.id, jenis: "pengajuan",    urutan: 0 },
      { programId: progPeminjaman.id, jenis: "persetujuan",  urutan: 1 },
      { programId: progPeminjaman.id, jenis: "peminjaman",   urutan: 2 },
      { programId: progPeminjaman.id, jenis: "pengembalian", urutan: 3 },
    ],
  });

  // 5. PENDAFTARAN — Anggota RT (program induk, cabangId = null, berlaku semua wilayah)
  const progPendaftaran = await prisma.programLokaID.create({
    data: {
      nama: "Pendaftaran Anggota RT 2026",
      deskripsi: "Pendaftaran warga baru sebagai anggota RT aktif.",
      tujuan: "pendaftaran",
      kuotaTotal: null,
      periodeReset: PeriodeReset.bulanan,
      perluVerifikasi: true,
      status: "aktif",
      mitraId: lokaidMitra.id,
      cabangId: null,
    },
  });
  await prisma.programAktivitasLokaID.createMany({
    data: [
      { programId: progPendaftaran.id, jenis: "pendaftaran", urutan: 0 },
      { programId: progPendaftaran.id, jenis: "persetujuan", urutan: 1 },
      { programId: progPendaftaran.id, jenis: "aktivasi",    urutan: 2 },
    ],
  });

  // ── Peserta LokaID ──

  // Sembako: semua 6 penduduk (wilayah Patehan)
  const pesertaSembako: { id: number; pendudukId: number }[] = [];
  for (const p of pendudukRecords) {
    const ps = await prisma.pesertaLokaID.create({ data: { pendudukId: p.id, programId: progSembako.id, status: "aktif", cabangId: wilPatehan.id } });
    pesertaSembako.push({ id: ps.id, pendudukId: p.id });
  }

  // Posyandu: 4 peserta (wali, wilayah Patehan)
  const pesertaPosyandu: { id: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const pp = await prisma.pesertaLokaID.create({ data: { pendudukId: pendudukRecords[i].id, programId: progPosyandu.id, status: "aktif", cabangId: wilPatehan.id } });
    pesertaPosyandu.push({ id: pp.id });
  }

  // Dependent (anak) untuk setiap wali posyandu
  const dependentData = [
    { waliIdx: 0, nama: "Rizky Santoso",    tglLahir: "2024-03-10", jk: "L" },
    { waliIdx: 1, nama: "Nayla Aminah",     tglLahir: "2024-07-22", jk: "P" },
    { waliIdx: 1, nama: "Rafi Aminah",      tglLahir: "2025-01-05", jk: "L" }, // wali punya 2 anak
    { waliIdx: 2, nama: "Siti Hermawan",    tglLahir: "2023-11-18", jk: "P" },
    { waliIdx: 3, nama: "Bima Lestari",     tglLahir: "2025-04-30", jk: "L" },
  ];
  const dependentRecords: { id: number; waliIdx: number }[] = [];
  for (const d of dependentData) {
    const dep = await prisma.dependentLokaID.create({
      data: {
        waliId: pesertaPosyandu[d.waliIdx].id,
        nama: d.nama,
        tanggalLahir: new Date(d.tglLahir),
        jenisKelamin: d.jk,
      },
    });
    dependentRecords.push({ id: dep.id, waliIdx: d.waliIdx });
  }

  // Field values untuk dependent yang hadir (3 dari 4 wali check-in)
  const fieldsBB = await prisma.programFieldLokaID.findMany({
    where: { programId: progPosyandu.id },
    orderBy: { urutan: "asc" },
  });

  // UMKM: 3 peserta (wilayah Kadipaten)
  const pesertaUMKM: { id: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const pu = await prisma.pesertaLokaID.create({ data: { pendudukId: pendudukRecords[i + 3].id, programId: progUMKM.id, status: "aktif", cabangId: wilKadipaten.id } });
    pesertaUMKM.push({ id: pu.id });
  }

  // ── Aktivitas LokaID ──

  const ps  = (i: number) => pesertaSembako[i].id;
  const pp  = (i: number) => pesertaPosyandu[i].id;
  const pu  = (i: number) => pesertaUMKM[i].id;
  const periodeIni = getCurrentPeriode(PeriodeReset.bulanan);

  // Distribusi sembako hari ini dan kemarin — 4 dari 6 sudah terima
  const aktData: Array<{ pesertaId: number; programId: number; jenis: string; keterangan: string | null; waktu: Date; dependentId?: number }> = [
    { pesertaId: ps(0), programId: progSembako.id,   jenis: "distribusi", keterangan: "Sembako diterima", waktu: today },
    { pesertaId: ps(1), programId: progSembako.id,   jenis: "distribusi", keterangan: "Sembako diterima", waktu: today },
    { pesertaId: ps(2), programId: progSembako.id,   jenis: "distribusi", keterangan: "Sembako diterima", waktu: yesterday },
    { pesertaId: ps(3), programId: progSembako.id,   jenis: "distribusi", keterangan: "Sembako diterima", waktu: yesterday },
    // Check-in posyandu via wali — dicatat untuk anak (dependent)
    { pesertaId: pp(0), programId: progPosyandu.id, jenis: "checkin", keterangan: null, waktu: today, dependentId: dependentRecords[0].id },
    { pesertaId: pp(1), programId: progPosyandu.id, jenis: "checkin", keterangan: null, waktu: today, dependentId: dependentRecords[1].id },
    { pesertaId: pp(1), programId: progPosyandu.id, jenis: "checkin", keterangan: null, waktu: today, dependentId: dependentRecords[2].id },
    { pesertaId: pp(2), programId: progPosyandu.id, jenis: "checkin", keterangan: null, waktu: today, dependentId: dependentRecords[3].id },
    // Pendataan UMKM — 2 dari 3 sudah didata
    { pesertaId: pu(0), programId: progUMKM.id, jenis: "pendataan", keterangan: "Data UMKM lengkap", waktu: yesterday },
    { pesertaId: pu(1), programId: progUMKM.id, jenis: "pendataan", keterangan: "Data UMKM lengkap", waktu: yesterday },
  ];

  for (const a of aktData) {
    await prisma.aktivitasLokaID.create({
      data: { pesertaId: a.pesertaId, programId: a.programId, mitraId: lokaidMitra.id, jenis: a.jenis, keterangan: a.keterangan, waktu: a.waktu, dependentId: a.dependentId ?? null },
    });
  }

  // Field values (BB/TB/status gizi) untuk anak yang hadir di posyandu
  const fieldBB = fieldsBB.find((f) => f.kode === "berat_badan")!;
  const fieldTB = fieldsBB.find((f) => f.kode === "tinggi_badan")!;
  const fieldGizi = fieldsBB.find((f) => f.kode === "status_gizi")!;

  const sampleData = [
    { pesertaIdx: 0, bb: "8.2",  tb: "75",  gizi: "Baik" },
    { pesertaIdx: 1, bb: "7.5",  tb: "72",  gizi: "Kurang" },
    { pesertaIdx: 2, bb: "9.1",  tb: "78",  gizi: "Baik" },
  ];
  for (const d of sampleData) {
    const pid = pp(d.pesertaIdx);
    await prisma.pesertaFieldValueLokaID.createMany({
      data: [
        { pesertaId: pid, fieldId: fieldBB.id,   nilai: d.bb,   updatedAt: new Date() },
        { pesertaId: pid, fieldId: fieldTB.id,   nilai: d.tb,   updatedAt: new Date() },
        { pesertaId: pid, fieldId: fieldGizi.id, nilai: d.gizi, updatedAt: new Date() },
      ],
    });
  }

  // ── StatusPeserta — status ringkasan per periode ──

  // Sembako: 4 sudah terima, 2 belum
  for (let i = 0; i < 4; i++) {
    await prisma.statusPesertaLokaID.create({
      data: { pesertaId: ps(i), programId: progSembako.id, status: "sudah_terima", periode: periodeIni },
    });
  }
  for (let i = 4; i < 6; i++) {
    await prisma.statusPesertaLokaID.create({
      data: { pesertaId: ps(i), programId: progSembako.id, status: "belum", periode: periodeIni },
    });
  }

  // Posyandu: 3 hadir, 1 tidak hadir
  for (let i = 0; i < 3; i++) {
    await prisma.statusPesertaLokaID.create({
      data: { pesertaId: pp(i), programId: progPosyandu.id, status: "hadir", periode: periodeIni },
    });
  }
  await prisma.statusPesertaLokaID.create({
    data: { pesertaId: pp(3), programId: progPosyandu.id, status: "tidak_hadir", periode: periodeIni },
  });

  // UMKM: 2 lengkap, 1 belum
  await prisma.statusPesertaLokaID.create({
    data: { pesertaId: pu(0), programId: progUMKM.id, status: "lengkap", periode: periodeIni },
  });
  await prisma.statusPesertaLokaID.create({
    data: { pesertaId: pu(1), programId: progUMKM.id, status: "lengkap", periode: periodeIni },
  });
  await prisma.statusPesertaLokaID.create({
    data: { pesertaId: pu(2), programId: progUMKM.id, status: "belum", periode: periodeIni },
  });

  // ── Output ──
  console.log("✓ Seed selesai!");
  console.log("");
  console.log("  ── SPBU Pertamina ──");
  console.log("  Login induk   : admin / mitra123");
  console.log("  Login cabang  : fatmawati | sudirman | kemang / mitra123");
  console.log(`  Token Fatmawati : ${fatmawati.tokenApi}`);
  console.log(`  Token Sudirman  : ${sudirman.tokenApi}`);
  console.log(`  Token Kemang    : ${kemang.tokenApi}`);
  console.log("");
  console.log("  ── LokaID (Kec. Kraton, Yogyakarta) ──");
  console.log("  Login induk    : lokaid / mitra123");
  console.log("  Login wilayah  : patehan | kadipaten / mitra123");
  console.log(`  Token induk    : ${lokaidMitra.tokenApi}`);
  console.log(`  Token Patehan  : ${wilPatehan.tokenApi}`);
  console.log(`  Token Kadipaten: ${wilKadipaten.tokenApi}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
