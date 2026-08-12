-- Tambah nilai 'sekali' ke enum PeriodeReset
ALTER TABLE `program_lokaid` MODIFY COLUMN `periode_reset` ENUM('harian','mingguan','bulanan','sekali') NOT NULL DEFAULT 'bulanan';
ALTER TABLE `program_subsidi` MODIFY COLUMN `periode_reset` ENUM('harian','mingguan','bulanan','sekali') NOT NULL DEFAULT 'bulanan';
