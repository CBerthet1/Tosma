export const CATEGORIES = [
  "Réj",
  "Autre",
  "Objo",
  "stab",
  "light",
  "accessoire",
  "son",
  "batterie",
  "Caméra",
] as const;

export type Category = (typeof CATEGORIES)[number];
