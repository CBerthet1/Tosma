CREATE TABLE `resa_matos_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`resa_id` int NOT NULL,
	`matos_id` int NOT NULL,
	CONSTRAINT `resa_matos_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `resa_matos_table` ADD CONSTRAINT `resa_matos_table_resa_id_resa_table_id_fk` FOREIGN KEY (`resa_id`) REFERENCES `resa_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resa_matos_table` ADD CONSTRAINT `resa_matos_table_matos_id_matos_table_id_fk` FOREIGN KEY (`matos_id`) REFERENCES `matos_table`(`id`) ON DELETE cascade ON UPDATE no action;