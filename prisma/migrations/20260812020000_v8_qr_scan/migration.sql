-- V8: QR token untuk scan HP NFC

CREATE TABLE `qr_token` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(64) NOT NULL,
  `program_id` INTEGER NOT NULL,
  `cabang_id` INTEGER NOT NULL,
  `scope` VARCHAR(30) NOT NULL DEFAULT 'scan_peserta',
  `expires_at` DATETIME(3) NOT NULL,
  `created_by` INTEGER NOT NULL,
  `usage_count` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `qr_token_token_key`(`token`),
  INDEX `qr_token_token_expires_at_idx`(`token`, `expires_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `qr_token` ADD CONSTRAINT `qr_token_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `program_lokaid`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `qr_token` ADD CONSTRAINT `qr_token_cabang_id_fkey` FOREIGN KEY (`cabang_id`) REFERENCES `cabang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `qr_token` ADD CONSTRAINT `qr_token_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
