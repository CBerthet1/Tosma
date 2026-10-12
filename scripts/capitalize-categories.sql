-- Run once against the existing database to capitalize category names consistently.
UPDATE `materiel`
SET `categorie` = CASE LOWER(TRIM(`categorie`))
  WHEN 'réj' THEN 'Réj'
  WHEN 'autre' THEN 'Autre'
  WHEN 'objo' THEN 'Objo'
  WHEN 'stab' THEN 'Stab'
  WHEN 'light' THEN 'Light'
  WHEN 'accessoire' THEN 'Accessoire'
  WHEN 'son' THEN 'Son'
  WHEN 'batterie' THEN 'Batterie'
  WHEN 'caméra' THEN 'Caméra'
  WHEN 'temp' THEN 'Autre'
  ELSE `categorie`
END
WHERE LOWER(TRIM(`categorie`)) IN (
  'réj', 'autre', 'objo', 'stab', 'light', 'accessoire', 'son', 'batterie', 'caméra', 'temp'
);
