-- Run once against the existing database before deploying the updated app.
-- Copies each reservation's equipment links into resa.matos, then removes resa_matos.

ALTER TABLE `resa`
  ADD COLUMN `matos` JSON NULL;

UPDATE `resa` AS r
SET `matos` = COALESCE(
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'matosId', rm.`id_matos`,
        'quantity', rm.`quantity`
      )
    )
    FROM `resa_matos` AS rm
    WHERE rm.`id_resa` = r.`id`
  ),
  JSON_ARRAY()
);

ALTER TABLE `resa`
  MODIFY COLUMN `matos` JSON NOT NULL;

DROP TABLE `resa_matos`;
