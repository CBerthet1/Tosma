ALTER TABLE `resa_matos_table` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `matos_table` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `resa_table` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `resa_matos_table` ADD PRIMARY KEY(`resa_id`,`matos_id`);--> statement-breakpoint
ALTER TABLE `matos_table` ADD `categorie` varchar(255) DEFAULT 'Autre' NOT NULL;--> statement-breakpoint
ALTER TABLE `resa_matos_table` DROP COLUMN `id`;