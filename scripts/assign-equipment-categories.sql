-- Run after migrate-categories-to-text.sql.
-- Names not listed below (for example, newly added equipment) stay in "Autre".
SET NAMES utf8mb4;

UPDATE `materiel`
SET `categorie` = CASE TRIM(`name`)
  WHEN 'AKAI MPK mini' THEN 'Réj'
  WHEN 'Boitier Daslight 5' THEN 'Réj'
  WHEN 'Boîtier Daslight 4' THEN 'Réj'
  WHEN 'Convertisseur SDI/HDMI' THEN 'Réj'
  WHEN 'Couette' THEN 'Réj'
  WHEN 'DJI Transmission' THEN 'Réj'
  WHEN 'DJI Transmission SDR' THEN 'Réj'
  WHEN 'Dédoubleur HDMI' THEN 'Réj'
  WHEN 'Katherine' THEN 'Réj'
  WHEN 'Katherine (new gen)' THEN 'Réj'
  WHEN 'Launchpad S' THEN 'Réj'
  WHEN 'Pad AKAI MPD 32' THEN 'Réj'
  WHEN 'Platines FLX4' THEN 'Réj'
  WHEN 'Réa (Célestine)' THEN 'Réj'
  WHEN 'Répéteur HDMI' THEN 'Réj'
  WHEN 'Bague d''adaptation' THEN 'Autre'
  WHEN 'Bellicule' THEN 'Autre'
  WHEN 'Color checker' THEN 'Autre'
  WHEN 'Fond vert' THEN 'Autre'
  WHEN 'Fond vert elgato' THEN 'Autre'
  WHEN 'Les GDAs' THEN 'Autre'
  WHEN 'Moniteur du Rush' THEN 'Autre'
  WHEN 'Petit fond vert/bleu' THEN 'Autre'
  WHEN 'SSD 1' THEN 'Autre'
  WHEN 'SSD 2' THEN 'Autre'
  WHEN 'SSD 3' THEN 'Autre'
  WHEN 'SSD 4' THEN 'Autre'
  WHEN 'SSD 5' THEN 'Autre'
  WHEN 'Sacs de sable' THEN 'Autre'
  WHEN 'Système son' THEN 'Autre'
  WHEN 'Canon 24-70mm' THEN 'Objo'
  WHEN 'Fisheye 7.5mm' THEN 'Objo'
  WHEN 'Fisheye 8mm' THEN 'Objo'
  WHEN 'Lumix 12-35mm' THEN 'Objo'
  WHEN 'Lumix 14-140mm' THEN 'Objo'
  WHEN 'Lumix 35-100mm' THEN 'Objo'
  WHEN 'Lumix Pancake 20mm' THEN 'Objo'
  WHEN 'Retropia 32mm' THEN 'Objo'
  WHEN 'Sigma 16-28mm DG' THEN 'Objo'
  WHEN 'Sigma 20mm' THEN 'Objo'
  WHEN 'Sigma 30mm' THEN 'Objo'
  WHEN 'Sigma 50mm' THEN 'Objo'
  WHEN 'Zeiss 55mm' THEN 'Objo'
  WHEN 'Sony 16-50mm PZ' THEN 'Objo'
  WHEN 'Sony 35mm' THEN 'Objo'
  WHEN 'Sony 85mm' THEN 'Objo'
  WHEN 'Tamron 35-150mm' THEN 'Objo'
  WHEN 'Tilt-shift' THEN 'Objo'
  WHEN 'Voigt 0' THEN 'Objo'
  WHEN 'Voigt 1' THEN 'Objo'
  WHEN 'Voigt 2' THEN 'Objo'
  WHEN 'C-Stand' THEN 'stab'
  WHEN 'Grande glide' THEN 'stab'
  WHEN 'Grue' THEN 'stab'
  WHEN 'Kit d''expansion Ronin' THEN 'stab'
  WHEN 'Petit trépied light' THEN 'stab'
  WHEN 'Poignées déportées Ronin' THEN 'stab'
  WHEN 'Poingnée cam' THEN 'stab'
  WHEN 'Ronin S2' THEN 'stab'
  WHEN 'Ronin S3 Pro' THEN 'stab'
  WHEN 'Ronin S5' THEN 'stab'
  WHEN 'Ronin SC2' THEN 'stab'
  WHEN 'Shoulder' THEN 'stab'
  WHEN 'Trépid à roulettes' THEN 'stab'
  WHEN 'Trépied cam' THEN 'stab'
  WHEN 'Trépied light' THEN 'stab'
  WHEN '120d (Soleil)' THEN 'light'
  WHEN 'Godox' THEN 'light'
  WHEN 'Gélatines' THEN 'light'
  WHEN 'LS1c' THEN 'light'
  WHEN 'Lights de chantier' THEN 'light'
  WHEN 'Panneau LED' THEN 'light'
  WHEN 'Panneau LED RGB' THEN 'light'
  WHEN 'Panneau LED Viltrox' THEN 'light'
  WHEN 'Petite light' THEN 'light'
  WHEN 'Réflecteur / diffuseur' THEN 'light'
  WHEN 'Soleil RGB' THEN 'light'
  WHEN 'Soleil RGB GVM' THEN 'light'
  WHEN 'Stick RGB' THEN 'light'
  WHEN 'Stick RGB Neewer' THEN 'light'
  WHEN 'Les GPAs' THEN 'accessoire'
  WHEN 'Manette FPV' THEN 'accessoire'
  WHEN 'Nuggets' THEN 'accessoire'
  WHEN 'Réplique 1911' THEN 'accessoire'
  WHEN 'Réplique Beretta 92' THEN 'accessoire'
  WHEN 'Spicy Tenders' THEN 'accessoire'
  WHEN 'Tenture Hyris' THEN 'accessoire'
  WHEN 'Tenue d''apiculteur' THEN 'accessoire'
  WHEN 'Blimp' THEN 'son'
  WHEN 'Casque' THEN 'son'
  WHEN 'DJI Mic 2' THEN 'son'
  WHEN 'DJI Mic 3' THEN 'son'
  WHEN 'Kit micro-cravate Rode' THEN 'son'
  WHEN 'Kit micro-cravate Rode Lavalier' THEN 'son'
  WHEN 'Kit micro-cravate Sennheiser' THEN 'son'
  WHEN 'Kit micros HF' THEN 'son'
  WHEN 'Kit micros HF Shure' THEN 'son'
  WHEN 'Micro Blue Baby Bottle SL' THEN 'son'
  WHEN 'Micro canon' THEN 'son'
  WHEN 'Micro main' THEN 'son'
  WHEN 'Perche' THEN 'son'
  WHEN 'Scarlett 2i2' THEN 'son'
  WHEN 'Tête perche' THEN 'son'
  WHEN 'XLR Long' THEN 'son'
  WHEN 'Zoom' THEN 'son'
  WHEN 'Batterie GH' THEN 'batterie'
  WHEN 'Batterie NXD' THEN 'batterie'
  WHEN 'Batterie Sony' THEN 'batterie'
  WHEN 'V-Mount' THEN 'batterie'
  WHEN 'A6700' THEN 'Caméra'
  WHEN 'A7' THEN 'Caméra'
  WHEN 'DJI Avata 2' THEN 'Caméra'
  WHEN 'DJI Mavic 3 Classic' THEN 'Caméra'
  WHEN 'DJI Mini SE' THEN 'Caméra'
  WHEN 'DJI Osmo 360' THEN 'Caméra'
  WHEN 'DJI Osmo Action 6' THEN 'Caméra'
  WHEN 'DJI Osmo Pocket 2' THEN 'Caméra'
  WHEN 'DJI Osmo Pocket 3' THEN 'Caméra'
  WHEN 'EVA-1' THEN 'Caméra'
  WHEN 'FX-3' THEN 'Caméra'
  WHEN 'FX-30' THEN 'Caméra'
  WHEN 'GH5s' THEN 'Caméra'
  WHEN 'GoPro Hero 7' THEN 'Caméra'
  WHEN 'GoPro Hero 9' THEN 'Caméra'
  WHEN 'NNXD' THEN 'Caméra'
  WHEN 'NXD+' THEN 'Caméra'
  WHEN 'NXD-' THEN 'Caméra'
  WHEN 'Tess' THEN 'Caméra'
  ELSE `categorie`
END
WHERE TRIM(`name`) IN (
  'AKAI MPK mini', 'Boitier Daslight 5', 'Boîtier Daslight 4',
  'Convertisseur SDI/HDMI', 'Couette', 'DJI Transmission', 'DJI Transmission SDR',
  'Dédoubleur HDMI', 'Katherine', 'Katherine (new gen)', 'Launchpad S',
  'Pad AKAI MPD 32', 'Platines FLX4', 'Réa (Célestine)', 'Répéteur HDMI',
  'Bague d''adaptation', 'Bellicule', 'Color checker', 'Fond vert',
  'Fond vert elgato', 'Les GDAs', 'Moniteur du Rush', 'Petit fond vert/bleu',
  'SSD 1', 'SSD 2', 'SSD 3', 'SSD 4', 'SSD 5', 'Sacs de sable', 'Système son',
  'Canon 24-70mm', 'Fisheye 7.5mm', 'Fisheye 8mm', 'Lumix 12-35mm',
  'Lumix 14-140mm', 'Lumix 35-100mm', 'Lumix Pancake 20mm', 'Retropia 32mm',
  'Sigma 16-28mm DG', 'Sigma 20mm', 'Sigma 30mm', 'Sigma 50mm', 'Zeiss 55mm',
  'Sony 16-50mm PZ', 'Sony 35mm', 'Sony 85mm', 'Tamron 35-150mm',
  'Tilt-shift', 'Voigt 0', 'Voigt 1', 'Voigt 2', 'C-Stand', 'Grande glide',
  'Grue', 'Kit d''expansion Ronin', 'Petit trépied light',
  'Poignées déportées Ronin', 'Poingnée cam', 'Ronin S2', 'Ronin S3 Pro',
  'Ronin S5', 'Ronin SC2', 'Shoulder', 'Trépid à roulettes', 'Trépied cam',
  'Trépied light', '120d (Soleil)', 'Godox', 'Gélatines', 'LS1c',
  'Lights de chantier', 'Panneau LED', 'Panneau LED RGB', 'Panneau LED Viltrox',
  'Petite light', 'Réflecteur / diffuseur', 'Soleil RGB', 'Soleil RGB GVM',
  'Stick RGB', 'Stick RGB Neewer', 'Les GPAs', 'Manette FPV', 'Nuggets',
  'Réplique 1911', 'Réplique Beretta 92', 'Spicy Tenders', 'Tenture Hyris',
  'Tenue d''apiculteur', 'Blimp', 'Casque', 'DJI Mic 2', 'DJI Mic 3',
  'Kit micro-cravate Rode', 'Kit micro-cravate Rode Lavalier',
  'Kit micro-cravate Sennheiser', 'Kit micros HF', 'Kit micros HF Shure',
  'Micro Blue Baby Bottle SL', 'Micro canon', 'Micro main', 'Perche',
  'Scarlett 2i2', 'Tête perche', 'XLR Long', 'Zoom', 'Batterie GH',
  'Batterie NXD', 'Batterie Sony', 'V-Mount', 'A6700', 'A7', 'DJI Avata 2',
  'DJI Mavic 3 Classic', 'DJI Mini SE', 'DJI Osmo 360', 'DJI Osmo Action 6',
  'DJI Osmo Pocket 2', 'DJI Osmo Pocket 3', 'EVA-1', 'FX-3', 'FX-30',
  'GH5s', 'GoPro Hero 7', 'GoPro Hero 9', 'NNXD', 'NXD+', 'NXD-', 'Tess'
);

UPDATE `materiel`
SET `categorie` = 'Autre'
WHERE `categorie` = 'temp';
