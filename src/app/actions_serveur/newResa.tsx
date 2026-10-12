'use server';
import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { matosTable, resaTable } from "../../drizzle/schema";
import { revalidatePath } from "next/cache";
import { and, gt, inArray, lt } from "drizzle-orm";
import { parseReservationMaterials } from "@/lib/reservation-materials";

export async function getUnavailableMatosIds(start: Date, end: Date) {
  if (
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end
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
      .where(and(lt(resaTable.start, end), gt(resaTable.end, start))),
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

  return materials
    .filter(
      (material) =>
        !material.available ||
        (reservedByMatos.get(material.id) ?? 0) >= material.quantity,
    )
    .map((material) => material.id);
}

export async function newResa(
  start: Date, 
  end: Date, 
  name: string, 
  matosIds: number[] 
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
    !Array.isArray(matosIds) ||
    !matosIds.every((id) => Number.isInteger(id) && id > 0) ||
    new Set(matosIds).size !== matosIds.length
  ) {
    throw new Error("Les informations de réservation sont invalides.");
  }

  await db.transaction(async (tx) => { //transaction permet de s'assurer que toutes les opérations sont effectuées correctement, sinon elles sont annulées
    if (matosIds.length > 0) {
      const existingMatos = await tx
        .select({ id: matosTable.id })
        .from(matosTable)
        .where(inArray(matosTable.id, matosIds));

      if (existingMatos.length !== matosIds.length) {
        throw new Error("Un des matériels sélectionnés n'existe plus.");
      }

      const unavailableMatosIds = await getUnavailableMatosIds(start, end);
      if (matosIds.some((matosId) => unavailableMatosIds.includes(matosId))) {
        throw new Error("Un des matériels sélectionnés n'est pas disponible à cet horaire.");
      }
    }

    await tx.insert(resaTable).values({
      name: normalizedName,
      start: start,
      end: end,
      user: userId,
      matos: matosIds.map((matosId) => ({ matosId, quantity: 1 })),
    });
  });

  revalidatePath("/");
}