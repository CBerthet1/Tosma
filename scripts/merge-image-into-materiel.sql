-- Run once against the existing database before deploying the updated app.
-- If a material has multiple images, keeps the one with the smallest image.id.

ALTER TABLE `materiel`
  ADD COLUMN `image` varchar(255) NULL;

UPDATE `materiel` AS m
JOIN (
  SELECT `item_id`, MIN(`id`) AS `image_id`
  FROM `image`
  GROUP BY `item_id`
) AS selected_image ON selected_image.`item_id` = m.`id`
JOIN `image` AS i ON i.`id` = selected_image.`image_id`
SET m.`image` = i.`url`;

DROP TABLE `image`;
