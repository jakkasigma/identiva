-- Migration V2: Program Wizard + Multi-Aktivitas + Status Peserta
-- Strategi: tambah kolom baru dulu, migrasikan data, baru drop kolom lama

-- ──────────────────────────────────────────────
-- 1. Tambah kolom `tujuan` dengan DEFAULT sementara
-- ──────────────────────────────────────────────
ALTER TABLE `program_lokaid`
  ADD COLUMN `tujuan` VARCHAR(30) NOT NULL DEFAULT 'kegiatan',
  ADD COLUMN `perlu_verifikasi` BOOLEAN NOT NULL DEFAULT FALSE;

-- ──────────────────────────────────────────────
-- 2. Migrasikan data: isi `tujuan` dari `jenis` lama
--    distribusi → bantuan
--    checkin    → kegiatan
--    pendataan  → pendataan
-- ──────────────────────────────────────────────
UPDATE `program_lokaid` SET `tujuan` = 'bantuan'   WHERE `jenis` = 'distribusi';
UPDATE `program_lokaid` SET `tujuan` = 'kegiatan'  WHERE `jenis` = 'checkin';
UPDATE `program_lokaid` SET `tujuan` = 'pendataan' WHERE `jenis` = 'pendataan';

-- ──────────────────────────────────────────────
-- 3. Hapus kolom `jenis` lama
-- ──────────────────────────────────────────────
ALTER TABLE `program_lokaid`
  DROP COLUMN `jenis`;

-- Hapus DEFAULT sementara pada `tujuan`
ALTER TABLE `program_lokaid`
  ALTER COLUMN `tujuan` DROP DEFAULT;

-- ──────────────────────────────────────────────
-- 4. Buat tabel `program_aktivitas_lokaid`
-- ──────────────────────────────────────────────
CREATE TABLE `program_aktivitas_lokaid` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `program_id` INT          NOT NULL,
  `jenis`      VARCHAR(30)  NOT NULL,
  `urutan`     INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `program_aktivitas_lokaid_program_id_jenis_key` (`program_id`, `jenis`),
  CONSTRAINT `program_aktivitas_lokaid_program_id_fkey`
    FOREIGN KEY (`program_id`) REFERENCES `program_lokaid` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- 5. Migrasikan data ke program_aktivitas_lokaid
--    Buat 1 row per program sesuai tujuan yang baru
-- ──────────────────────────────────────────────
INSERT INTO `program_aktivitas_lokaid` (`program_id`, `jenis`, `urutan`)
SELECT `id`, 'distribusi', 0 FROM `program_lokaid` WHERE `tujuan` = 'bantuan';

INSERT INTO `program_aktivitas_lokaid` (`program_id`, `jenis`, `urutan`)
SELECT `id`, 'checkin', 0 FROM `program_lokaid` WHERE `tujuan` = 'kegiatan';

INSERT INTO `program_aktivitas_lokaid` (`program_id`, `jenis`, `urutan`)
SELECT `id`, 'pendataan', 0 FROM `program_lokaid` WHERE `tujuan` = 'pendataan';

-- ──────────────────────────────────────────────
-- 6. Buat tabel `status_peserta_lokaid`
-- ──────────────────────────────────────────────
CREATE TABLE `status_peserta_lokaid` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `peserta_id` INT          NOT NULL,
  `program_id` INT          NOT NULL,
  `status`     VARCHAR(30)  NOT NULL,
  `periode`    VARCHAR(10)  NOT NULL,
  `updated_at` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `status_peserta_lokaid_peserta_id_program_id_periode_key` (`peserta_id`, `program_id`, `periode`),
  CONSTRAINT `status_peserta_lokaid_peserta_id_fkey`
    FOREIGN KEY (`peserta_id`) REFERENCES `peserta_lokaid` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `status_peserta_lokaid_program_id_fkey`
    FOREIGN KEY (`program_id`) REFERENCES `program_lokaid` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
