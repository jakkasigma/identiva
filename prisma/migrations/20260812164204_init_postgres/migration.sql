-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin_mitra', 'admin_cabang', 'admin_platform');

-- CreateEnum
CREATE TYPE "StatusMitra" AS ENUM ('pending', 'aktif', 'diblokir');

-- CreateEnum
CREATE TYPE "StatusWarga" AS ENUM ('aktif', 'diblokir');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('cash', 'qris');

-- CreateEnum
CREATE TYPE "PeriodeReset" AS ENUM ('harian', 'mingguan', 'bulanan', 'sekali');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'admin_mitra',
    "mitra_id" INTEGER,
    "cabang_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mitra" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "kode" VARCHAR(30) NOT NULL,
    "skala" VARCHAR(20) NOT NULL,
    "jenis_layanan" VARCHAR(100) NOT NULL,
    "tipe_mitra" VARCHAR(30) NOT NULL DEFAULT 'subsidi',
    "status" "StatusMitra" NOT NULL DEFAULT 'pending',
    "token_api" VARCHAR(64) NOT NULL,
    "saldo_default" INTEGER NOT NULL DEFAULT 200000,
    "metode_scan_diizinkan" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mitra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabang" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "kode" VARCHAR(30) NOT NULL,
    "alamat" VARCHAR(255),
    "status" "StatusMitra" NOT NULL DEFAULT 'aktif',
    "token_api" VARCHAR(64) NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "metode_scan_aktif" VARCHAR(20) NOT NULL DEFAULT 'manual',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cabang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_subsidi" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(50) NOT NULL,
    "bersubsidi" BOOLEAN NOT NULL DEFAULT true,
    "diskon" INTEGER NOT NULL DEFAULT 0,
    "periode_reset" "PeriodeReset" NOT NULL DEFAULT 'bulanan',
    "mitra_id" INTEGER NOT NULL,

    CONSTRAINT "program_subsidi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penduduk" (
    "id" SERIAL NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "alamat" VARCHAR(255) NOT NULL,
    "uid_kartu" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penduduk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warga" (
    "id" SERIAL NOT NULL,
    "penduduk_id" INTEGER NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "status" "StatusWarga" NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saldo" (
    "id" SERIAL NOT NULL,
    "penduduk_id" INTEGER NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "saldo_total" INTEGER NOT NULL,
    "saldo_terpakai" INTEGER NOT NULL DEFAULT 0,
    "periode" VARCHAR(10) NOT NULL,

    CONSTRAINT "saldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id" SERIAL NOT NULL,
    "warga_id" INTEGER NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "cabang_id" INTEGER NOT NULL,
    "program_subsidi_id" INTEGER NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nominal" INTEGER NOT NULL,
    "diskon" INTEGER NOT NULL,
    "diskon_rupiah" INTEGER NOT NULL,
    "total_bayar" INTEGER NOT NULL,
    "metode_bayar" "MetodeBayar" NOT NULL,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_pending" (
    "id" SERIAL NOT NULL,
    "cabang_id" INTEGER NOT NULL,
    "uid_kartu" VARCHAR(20) NOT NULL,
    "waktu_scan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_pending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_lokaid" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "tujuan" VARCHAR(30) NOT NULL,
    "sasaran" VARCHAR(20) NOT NULL DEFAULT 'warga',
    "kuota_total" INTEGER,
    "periode_reset" "PeriodeReset" NOT NULL DEFAULT 'bulanan',
    "perlu_verifikasi" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "mitra_id" INTEGER NOT NULL,
    "cabang_id" INTEGER,
    "tanggal_mulai" TIMESTAMP(3),
    "tanggal_selesai" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_lokaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_aktivitas_lokaid" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "jenis" VARCHAR(30) NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "program_aktivitas_lokaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta_lokaid" (
    "id" SERIAL NOT NULL,
    "penduduk_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "cabang_id" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peserta_lokaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_peserta_lokaid" (
    "id" SERIAL NOT NULL,
    "peserta_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "periode" VARCHAR(10) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_peserta_lokaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aktivitas_lokaid" (
    "id" SERIAL NOT NULL,
    "peserta_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "cabang_id" INTEGER,
    "dependent_id" INTEGER,
    "jenis" VARCHAR(30) NOT NULL,
    "keterangan" VARCHAR(255),
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aktivitas_lokaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_field_lokaid" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "kode" VARCHAR(50) NOT NULL,
    "tipe" VARCHAR(20) NOT NULL,
    "wajib" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "opsi" TEXT,

    CONSTRAINT "program_field_lokaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta_field_value_lokaid" (
    "id" SERIAL NOT NULL,
    "peserta_id" INTEGER NOT NULL,
    "field_id" INTEGER NOT NULL,
    "nilai" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peserta_field_value_lokaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependent_lokaid" (
    "id" SERIAL NOT NULL,
    "wali_id" INTEGER NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "tanggal_lahir" TIMESTAMP(3),
    "jenis_kelamin" VARCHAR(10),
    "keterangan" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dependent_lokaid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_token" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "program_id" INTEGER NOT NULL,
    "cabang_id" INTEGER NOT NULL,
    "scope" VARCHAR(30) NOT NULL DEFAULT 'scan_peserta',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "mitra_kode_key" ON "mitra"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "mitra_token_api_key" ON "mitra"("token_api");

-- CreateIndex
CREATE UNIQUE INDEX "cabang_kode_key" ON "cabang"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "cabang_token_api_key" ON "cabang"("token_api");

-- CreateIndex
CREATE UNIQUE INDEX "penduduk_nik_key" ON "penduduk"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "penduduk_uid_kartu_key" ON "penduduk"("uid_kartu");

-- CreateIndex
CREATE UNIQUE INDEX "warga_penduduk_id_mitra_id_key" ON "warga"("penduduk_id", "mitra_id");

-- CreateIndex
CREATE UNIQUE INDEX "saldo_penduduk_id_mitra_id_periode_key" ON "saldo"("penduduk_id", "mitra_id", "periode");

-- CreateIndex
CREATE INDEX "transaksi_mitra_id_waktu_idx" ON "transaksi"("mitra_id", "waktu");

-- CreateIndex
CREATE INDEX "transaksi_cabang_id_waktu_idx" ON "transaksi"("cabang_id", "waktu");

-- CreateIndex
CREATE UNIQUE INDEX "program_aktivitas_lokaid_program_id_jenis_key" ON "program_aktivitas_lokaid"("program_id", "jenis");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_lokaid_penduduk_id_program_id_key" ON "peserta_lokaid"("penduduk_id", "program_id");

-- CreateIndex
CREATE UNIQUE INDEX "status_peserta_lokaid_peserta_id_program_id_periode_key" ON "status_peserta_lokaid"("peserta_id", "program_id", "periode");

-- CreateIndex
CREATE INDEX "aktivitas_lokaid_program_id_waktu_idx" ON "aktivitas_lokaid"("program_id", "waktu");

-- CreateIndex
CREATE INDEX "aktivitas_lokaid_mitra_id_waktu_idx" ON "aktivitas_lokaid"("mitra_id", "waktu");

-- CreateIndex
CREATE UNIQUE INDEX "program_field_lokaid_program_id_kode_key" ON "program_field_lokaid"("program_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_field_value_lokaid_peserta_id_field_id_key" ON "peserta_field_value_lokaid"("peserta_id", "field_id");

-- CreateIndex
CREATE UNIQUE INDEX "qr_token_token_key" ON "qr_token"("token");

-- CreateIndex
CREATE INDEX "qr_token_token_expires_at_idx" ON "qr_token"("token", "expires_at");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "mitra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_cabang_id_fkey" FOREIGN KEY ("cabang_id") REFERENCES "cabang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabang" ADD CONSTRAINT "cabang_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_subsidi" ADD CONSTRAINT "program_subsidi_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warga" ADD CONSTRAINT "warga_penduduk_id_fkey" FOREIGN KEY ("penduduk_id") REFERENCES "penduduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warga" ADD CONSTRAINT "warga_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo" ADD CONSTRAINT "saldo_penduduk_id_fkey" FOREIGN KEY ("penduduk_id") REFERENCES "penduduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo" ADD CONSTRAINT "saldo_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_warga_id_fkey" FOREIGN KEY ("warga_id") REFERENCES "warga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_cabang_id_fkey" FOREIGN KEY ("cabang_id") REFERENCES "cabang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_program_subsidi_id_fkey" FOREIGN KEY ("program_subsidi_id") REFERENCES "program_subsidi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_pending" ADD CONSTRAINT "scan_pending_cabang_id_fkey" FOREIGN KEY ("cabang_id") REFERENCES "cabang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_lokaid" ADD CONSTRAINT "program_lokaid_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_lokaid" ADD CONSTRAINT "program_lokaid_cabang_id_fkey" FOREIGN KEY ("cabang_id") REFERENCES "cabang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_aktivitas_lokaid" ADD CONSTRAINT "program_aktivitas_lokaid_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_lokaid" ADD CONSTRAINT "peserta_lokaid_penduduk_id_fkey" FOREIGN KEY ("penduduk_id") REFERENCES "penduduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_lokaid" ADD CONSTRAINT "peserta_lokaid_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_lokaid" ADD CONSTRAINT "peserta_lokaid_cabang_id_fkey" FOREIGN KEY ("cabang_id") REFERENCES "cabang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_peserta_lokaid" ADD CONSTRAINT "status_peserta_lokaid_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_peserta_lokaid" ADD CONSTRAINT "status_peserta_lokaid_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas_lokaid" ADD CONSTRAINT "aktivitas_lokaid_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas_lokaid" ADD CONSTRAINT "aktivitas_lokaid_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas_lokaid" ADD CONSTRAINT "aktivitas_lokaid_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas_lokaid" ADD CONSTRAINT "aktivitas_lokaid_cabang_id_fkey" FOREIGN KEY ("cabang_id") REFERENCES "cabang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas_lokaid" ADD CONSTRAINT "aktivitas_lokaid_dependent_id_fkey" FOREIGN KEY ("dependent_id") REFERENCES "dependent_lokaid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_field_lokaid" ADD CONSTRAINT "program_field_lokaid_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_field_value_lokaid" ADD CONSTRAINT "peserta_field_value_lokaid_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_field_value_lokaid" ADD CONSTRAINT "peserta_field_value_lokaid_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "program_field_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependent_lokaid" ADD CONSTRAINT "dependent_lokaid_wali_id_fkey" FOREIGN KEY ("wali_id") REFERENCES "peserta_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_token" ADD CONSTRAINT "qr_token_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program_lokaid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_token" ADD CONSTRAINT "qr_token_cabang_id_fkey" FOREIGN KEY ("cabang_id") REFERENCES "cabang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_token" ADD CONSTRAINT "qr_token_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
