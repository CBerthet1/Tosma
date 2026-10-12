-- Run once against the existing database before deploying the updated app.
-- Existing equipment is assigned to the temporary "temp" category.

CREATE TABLE IF NOT EXISTS `categories` (
  `categorie` varchar(255) NOT NULL,
  PRIMARY KEY (`categorie`)
);

INSERT IGNORE INTO `categories` (`categorie`) VALUES ('temp');

ALTER TABLE `materiel`
  ADD COLUMN `categorie` varchar(255) NULL;

UPDATE `materiel`
SET `categorie` = 'temp';

ALTER TABLE `materiel`
  MODIFY COLUMN `categorie` varchar(255) NOT NULL,
  DROP COLUMN `category_id`;
