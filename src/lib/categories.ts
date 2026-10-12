export const CATEGORIES = [
  "Réj",
  "Objo",
  "Stab",
  "Light",
  "Son",
  "Batterie",
  "Caméra",
  "Accessoire",
  "Autre",
] as const;

export type Category = (typeof CATEGORIES)[number];
