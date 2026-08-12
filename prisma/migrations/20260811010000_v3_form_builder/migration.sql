-- Migration V3: Form Builder + Relasi Wali-Anak

-- ──────────────────────────────────────────────
-- 1. Tambah kolom `sasaran` ke program_lokaid
-- ──────────────────────────────────────────────
ALTER TABLE `program_lokaid`
  ADD COLUMN `sasaran` VARCHAR(20) NOT NULL DEFAULT 'warga';

-- Posyandu → sasaran anak
UPDATE `program_lokaid` SET `sasaran` = 'anak' WHERE `tujuan` = 'kegiatan' AND `nama` LIKE '%Posyandu%';

-- ──────────────────────────────────────────────
-- 2. Tambah kolom `dependent_id` ke aktivitas_lokaid
-- ──────────────────────────────────────────────
ALTER TABLE `aktivitas_lokaid`
  ADD COLUMN `dependent_id` INT NULL;

-- ──────────────────────────────────────────────
-- 3. Buat tabel dependent_lokaid
-- ──────────────────────────────────────────────
CREATE TABLE `dependent_lokaid` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `wali_id`      INT          NOT NULL,
  `nama`         VARCHAR(100) NOT NULL,
  `tanggal_lahir` DATE         NULL,
  `jenis_kelamin` VARCHAR(10)  NULL,
  `keterangan`   VARCHAR(255) NULL,
  `created_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `dependent_lokaid_wali_id_fkey`
    FOREIGN KEY (`wali_id`) REFERENCES `peserta_lokaid` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- FK aktivitas → dependent
ALTER TABLE `aktivitas_lokaid`
  ADD CONSTRAINT `aktivitas_lokaid_dependent_id_fkey`
    FOREIGN KEY (`dependent_id`) REFERENCES `dependent_lokaid` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ──────────────────────────────────────────────
-- 4. Buat tabel program_field_lokaid
-- ──────────────────────────────────────────────
CREATE TABLE `program_field_lokaid` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `program_id` INT          NOT NULL,
  `nama`       VARCHAR(100) NOT NULL,
  `kode`       VARCHAR(50)  NOT NULL,
  `tipe`       VARCHAR(20)  NOT NULL,
  `wajib`      TINYINT(1)   NOT NULL DEFAULT 0,
  `urutan`     INT          NOT NULL DEFAULT 0,
  `opsi`       TEXT         NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `program_field_lokaid_program_id_kode_key` (`program_id`, `kode`),
  CONSTRAINT `program_field_lokaid_program_id_fkey`
    FOREIGN KEY (`program_id`) REFERENCES `program_lokaid` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- 5. Buat tabel peserta_field_value_lokaid
-- ──────────────────────────────────────────────
CREATE TABLE `peserta_field_value_lokaid` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `peserta_id` INT          NOT NULL,
  `field_id`   INT          NOT NULL,
  `nilai`      TEXT         NULL,
  `updated_at` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `peserta_field_value_lokaid_peserta_id_field_id_key` (`peserta_id`, `field_id`),
  CONSTRAINT `peserta_field_value_lokaid_peserta_id_fkey`
    FOREIGN KEY (`peserta_id`) REFERENCES `peserta_lokaid` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `peserta_field_value_lokaid_field_id_fkey`
    FOREIGN KEY (`field_id`) REFERENCES `program_field_lokaid` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
