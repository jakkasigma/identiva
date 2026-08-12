-- Migration V4: Hierarki Wilayah LokaID

-- Tambah cabang_id ke program_lokaid (null = program induk, ada = program wilayah)
ALTER TABLE `program_lokaid`
  ADD COLUMN `cabang_id` INT NULL,
  ADD CONSTRAINT `program_lokaid_cabang_id_fkey`
    FOREIGN KEY (`cabang_id`) REFERENCES `cabang` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Tambah cabang_id ke peserta_lokaid (wilayah yang mendaftarkan)
ALTER TABLE `peserta_lokaid`
  ADD COLUMN `cabang_id` INT NULL,
  ADD CONSTRAINT `peserta_lokaid_cabang_id_fkey`
    FOREIGN KEY (`cabang_id`) REFERENCES `cabang` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
