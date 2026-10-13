import type { ReservationMaterial } from "../../schema";

export function parseReservationMaterials(value: unknown): ReservationMaterial[] {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch (error) {
      throw new Error("Les matériels d'une réservation ne sont pas un JSON valide.", {
        cause: error,
      });
    }
  }

  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        Number.isInteger(item.matosId) &&
        item.matosId > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
  ) {
    throw new Error("Le format des matériels d'une réservation est invalide.");
  }

  return parsed;
}
