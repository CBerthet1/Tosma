-- Run once on an existing database after deploying the code with hard-coded categories.
UPDATE `materiel`
SET `categorie` = 'Autre'
WHERE `categorie` = 'temp';

DROP TABLE IF EXISTS `category`, `categorie`, `categories`;
