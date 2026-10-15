CREATE TABLE `materiel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`description` text,
	`available` tinyint NOT NULL DEFAULT 1,
	`categorie` varchar(255) NOT NULL,
	`image` varchar(255),
	`added_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`quantity` int NOT NULL DEFAULT 1,
	CONSTRAINT `materiel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(63),
	`start` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`end` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`user` varchar(63),
	`user_display_name` varchar(255),
	`matos` json NOT NULL,
	CONSTRAINT `resa_id` PRIMARY KEY(`id`)
);
