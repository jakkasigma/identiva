-- V7: sistem preferensi scan multi-metode

ALTER TABLE `mitra` ADD COLUMN `metode_scan_diizinkan` JSON NULL;

UPDATE `mitra`
SET `metode_scan_diizinkan` = JSON_ARRAY('alat_esp32')
WHERE `tipe_mitra` = 'subsidi';

UPDATE `mitra`
SET `metode_scan_diizinkan` = JSON_ARRAY('alat_esp32', 'hp_nfc')
WHERE `tipe_mitra` = 'lokaid';

UPDATE `mitra`
SET `metode_scan_diizinkan` = JSON_ARRAY('manual')
WHERE `metode_scan_diizinkan` IS NULL;

ALTER TABLE `mitra` MODIFY COLUMN `metode_scan_diizinkan` JSON NOT NULL;

ALTER TABLE `cabang` ADD COLUMN `metode_scan_aktif` VARCHAR(20) NOT NULL DEFAULT 'manual';

UPDATE `cabang` c
JOIN `mitra` m ON c.`mitra_id` = m.`id`
SET c.`metode_scan_aktif` = 'alat_esp32'
WHERE m.`tipe_mitra` = 'subsidi';

UPDATE `cabang` c
JOIN `mitra` m ON c.`mitra_id` = m.`id`
SET c.`metode_scan_aktif` = 'hp_nfc'
WHERE m.`tipe_mitra` = 'lokaid';
