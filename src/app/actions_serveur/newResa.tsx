'use server';
import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { matosTable, resaTable, type ReservationMaterial } from "../../drizzle/schema";
import { revalidatePath } from "next/cache";
import { and, gt, inArray, lt, ne } from "drizzle-orm";
import { parseReservationMaterials } from "@/lib/reservation-materials";
import { getDateAfterMonths } from "@/lib/reservation-dates";

export async function getAvailableMatosQuantities(
  start: Date,
  end: Date,
  excludeReservationId?: number,
) {
  if (
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end ||
    (excludeReservationId !== undefined &&
      (!Number.isInteger(excludeReservationId) || excludeReservationId < 1))
  ) {
    throw new Error("Le créneau choisi est invalide.");
  }

  const [materials, reservations] = await Promise.all([
    db
      .select({
        id: matosTable.id,
        available: matosTable.available,
        quantity: matosTable.quantity,
      })
      .from(matosTable),
    db
      .select({
        matos: resaTable.matos,
      })
      .from(resaTable)
      .where(
        and(
          lt(resaTable.start, end),
          gt(resaTable.end, start),
          ...(excludeReservationId === undefined
            ? []
            : [ne(resaTable.id, excludeReservationId)]),
        ),
      ),
  ]);

  const reservedByMatos = new Map<number, number>();
  for (const reservation of reservations) {
    for (const item of parseReservationMaterials(reservation.matos)) {
      reservedByMatos.set(
        item.matosId,
        (reservedByMatos.get(item.matosId) ?? 0) + item.quantity,
      );
    }
  }

  return materials.map((material) => ({
    id: material.id,
    quantity: material.available
      ? Math.max(0, material.quantity - (reservedByMatos.get(material.id) ?? 0))
      : 0,
  }));
}

export async function newResa(
  start: Date, 
  end: Date, 
  name: string, 
  matos: ReservationMaterial[]
) {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    throw new Error("Votre session ne permet pas d'identifier le créateur de la réservation.");
  }

  const normalizedName = name.trim();
  if (
    !normalizedName ||
    normalizedName.length > 63 ||
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end ||
    end > getDateAfterMonths(start, 11) ||
    !Array.isArray(matos) ||
    !matos.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        Number.isInteger(item.matosId) &&
        item.matosId > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    ) ||
    new Set(matos.map((item) => item.matosId)).size !== matos.length
  ) {
    throw new Error("Les informations de réservation sont invalides. La fin doit être après le début et la réservation ne peut pas dépasser 11 mois.");
  }

  await db.transaction(async (tx) => { //transaction permet de s'assurer que toutes les opérations sont effectuées correctement, sinon elles sont annulées
    if (matos.length > 0) {
      const existingMatos = await tx
        .select({
          id: matosTable.id,
          available: matosTable.available,
          quantity: matosTable.quantity,
        })
        .from(matosTable)
        .where(inArray(matosTable.id, matos.map((item) => item.matosId)));

      if (existingMatos.length !== matos.length) {
        throw new Error("Un des matériels sélectionnés n'existe plus.");
      }

      const overlappingReservations = await tx
        .select({ matos: resaTable.matos })
        .from(resaTable)
        .where(and(lt(resaTable.start, end), gt(resaTable.end, start)));
      const reservedByMatos = new Map<number, number>();
      for (const reservation of overlappingReservations) {
        for (const item of parseReservationMaterials(reservation.matos)) {
          reservedByMatos.set(
            item.matosId,
            (reservedByMatos.get(item.matosId) ?? 0) + item.quantity,
          );
        }
      }

      if (
        matos.some((item) => {
          const material = existingMatos.find(({ id }) => id === item.matosId);
          return (
            !material?.available ||
            item.quantity >
              material.quantity - (reservedByMatos.get(item.matosId) ?? 0)
          );
        })
      ) {
        throw new Error("La quantité demandée n'est pas disponible à cet horaire.");
      }
    }

    await tx.insert(resaTable).values({
      name: normalizedName,
      start: start,
      end: end,
      user: userId,
      matos,
    });
  });

  revalidatePath("/");
}