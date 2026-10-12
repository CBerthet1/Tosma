-- Run once against the existing database before deploying the updated app.
-- Existing equipment is assigned to "Autre" until categorized by the next script.

ALTER TABLE `materiel`
  ADD COLUMN `categorie` varchar(255) NULL;

UPDATE `materiel`
SET `categorie` = 'Autre';

ALTER TABLE `materiel`
  MODIFY COLUMN `categorie` varchar(255) NOT NULL,
  DROP COLUMN `category_id`;

DROP TABLE IF EXISTS `category`, `categorie`, `categories`;
