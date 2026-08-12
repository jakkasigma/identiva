-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin_mitra', 'admin_cabang', 'admin_platform') NOT NULL DEFAULT 'admin_mitra',
    `mitra_id` INTEGER NULL,
    `cabang_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mitra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `kode` VARCHAR(30) NOT NULL,
    `skala` VARCHAR(20) NOT NULL,
    `jenis_layanan` VARCHAR(100) NOT NULL,
    `tipe_mitra` VARCHAR(30) NOT NULL DEFAULT 'subsidi',
    `status` ENUM('pending', 'aktif', 'diblokir') NOT NULL DEFAULT 'pending',
    `token_api` VARCHAR(64) NOT NULL,
    `saldo_default` INTEGER NOT NULL DEFAULT 200000,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `mitra_kode_key`(`kode`),
    UNIQUE INDEX `mitra_token_api_key`(`token_api`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cabang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `kode` VARCHAR(30) NOT NULL,
    `alamat` VARCHAR(255) NULL,
    `status` ENUM('pending', 'aktif', 'diblokir') NOT NULL DEFAULT 'aktif',
    `token_api` VARCHAR(64) NOT NULL,
    `mitra_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `cabang_kode_key`(`kode`),
    UNIQUE INDEX `cabang_token_api_key`(`token_api`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_subsidi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL,
    `bersubsidi` BOOLEAN NOT NULL DEFAULT true,
    `diskon` INTEGER NOT NULL DEFAULT 0,
    `periode_reset` ENUM('harian', 'mingguan', 'bulanan') NOT NULL DEFAULT 'bulanan',
    `mitra_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penduduk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nik` VARCHAR(16) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `uid_kartu` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `penduduk_nik_key`(`nik`),
    UNIQUE INDEX `penduduk_uid_kartu_key`(`uid_kartu`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warga` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `penduduk_id` INTEGER NOT NULL,
    `mitra_id` INTEGER NOT NULL,
    `status` ENUM('aktif', 'diblokir') NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `warga_penduduk_id_mitra_id_key`(`penduduk_id`, `mitra_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saldo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `penduduk_id` INTEGER NOT NULL,
    `mitra_id` INTEGER NOT NULL,
    `saldo_total` INTEGER NOT NULL,
    `saldo_terpakai` INTEGER NOT NULL DEFAULT 0,
    `periode` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `saldo_penduduk_id_mitra_id_periode_key`(`penduduk_id`, `mitra_id`, `periode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `warga_id` INTEGER NOT NULL,
    `mitra_id` INTEGER NOT NULL,
    `cabang_id` INTEGER NOT NULL,
    `program_subsidi_id` INTEGER NOT NULL,
    `waktu` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nominal` INTEGER NOT NULL,
    `diskon` INTEGER NOT NULL,
    `diskon_rupiah` INTEGER NOT NULL,
    `total_bayar` INTEGER NOT NULL,
    `metode_bayar` ENUM('cash', 'qris') NOT NULL,

    INDEX `transaksi_mitra_id_waktu_idx`(`mitra_id`, `waktu`),
    INDEX `transaksi_cabang_id_waktu_idx`(`cabang_id`, `waktu`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scan_pending` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cabang_id` INTEGER NOT NULL,
    `uid_kartu` VARCHAR(20) NOT NULL,
    `waktu_scan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_cabang_id_fkey` FOREIGN KEY (`cabang_id`) REFERENCES `cabang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cabang` ADD CONSTRAINT `cabang_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_subsidi` ADD CONSTRAINT `program_subsidi_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warga` ADD CONSTRAINT `warga_penduduk_id_fkey` FOREIGN KEY (`penduduk_id`) REFERENCES `penduduk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warga` ADD CONSTRAINT `warga_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saldo` ADD CONSTRAINT `saldo_penduduk_id_fkey` FOREIGN KEY (`penduduk_id`) REFERENCES `penduduk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saldo` ADD CONSTRAINT `saldo_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_warga_id_fkey` FOREIGN KEY (`warga_id`) REFERENCES `warga`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_cabang_id_fkey` FOREIGN KEY (`cabang_id`) REFERENCES `cabang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_program_subsidi_id_fkey` FOREIGN KEY (`program_subsidi_id`) REFERENCES `program_subsidi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scan_pending` ADD CONSTRAINT `scan_pending_cabang_id_fkey` FOREIGN KEY (`cabang_id`) REFERENCES `cabang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: LokaID
CREATE TABLE `program_lokaid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `jenis` VARCHAR(30) NOT NULL,
    `kuota_total` INTEGER NULL,
    `periode_reset` ENUM('harian', 'mingguan', 'bulanan') NOT NULL DEFAULT 'bulanan',
    `status` VARCHAR(20) NOT NULL DEFAULT 'aktif',
    `mitra_id` INTEGER NOT NULL,
    `tanggal_mulai` DATETIME(3) NULL,
    `tanggal_selesai` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `peserta_lokaid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `penduduk_id` INTEGER NOT NULL,
    `program_id` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `peserta_lokaid_penduduk_id_program_id_key`(`penduduk_id`, `program_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `aktivitas_lokaid` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `peserta_id` INTEGER NOT NULL,
    `program_id` INTEGER NOT NULL,
    `mitra_id` INTEGER NOT NULL,
    `cabang_id` INTEGER NULL,
    `jenis` VARCHAR(30) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `waktu` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `aktivitas_lokaid_program_id_waktu_idx`(`program_id`, `waktu`),
    INDEX `aktivitas_lokaid_mitra_id_waktu_idx`(`mitra_id`, `waktu`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: LokaID
ALTER TABLE `program_lokaid` ADD CONSTRAINT `program_lokaid_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `peserta_lokaid` ADD CONSTRAINT `peserta_lokaid_penduduk_id_fkey` FOREIGN KEY (`penduduk_id`) REFERENCES `penduduk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `peserta_lokaid` ADD CONSTRAINT `peserta_lokaid_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `program_lokaid`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `aktivitas_lokaid` ADD CONSTRAINT `aktivitas_lokaid_peserta_id_fkey` FOREIGN KEY (`peserta_id`) REFERENCES `peserta_lokaid`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `aktivitas_lokaid` ADD CONSTRAINT `aktivitas_lokaid_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `program_lokaid`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `aktivitas_lokaid` ADD CONSTRAINT `aktivitas_lokaid_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `aktivitas_lokaid` ADD CONSTRAINT `aktivitas_lokaid_cabang_id_fkey` FOREIGN KEY (`cabang_id`) REFERENCES `cabang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
