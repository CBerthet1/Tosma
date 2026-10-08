'use server';

import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { matosTable, resaMatosTable, resaTable } from "../../drizzle/schema";
import { and, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateResa(
  id: number,
  start: Date,
  end: Date,
  name: string,
  matosIds: number[],
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Vous devez être connecté pour modifier une réservation.");
  }

  const normalizedName = name.trim();
  if (
    !Number.isInteger(id) ||
    id < 1 ||
    !normalizedName ||
    normalizedName.length > 63 ||
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end ||
    !Array.isArray(matosIds) ||
    !matosIds.every((matosId) => Number.isInteger(matosId) && matosId > 0) ||
    new Set(matosIds).size !== matosIds.length
  ) {
    throw new Error("Les informations de réservation sont invalides.");
  }

  await db.transaction(async (tx) => {
    const [reservation] = await tx
      .select({ id: resaTable.id, userId: resaTable.user })
      .from(resaTable)
      .where(eq(resaTable.id, id));

    if (!reservation || reservation.userId !== userId) {
      throw new Error("Vous ne pouvez modifier que les réservations que vous avez créées.");
    }

    if (matosIds.length > 0) {
      const existingMatos = await tx
        .select({
          id: matosTable.id,
          available: matosTable.available,
          quantity: matosTable.quantity,
        })
        .from(matosTable)
        .where(inArray(matosTable.id, matosIds));

      if (existingMatos.length !== matosIds.length) {
        throw new Error("Un des matériels sélectionnés n'existe plus.");
      }

      if (existingMatos.some((matos) => !matos.available)) {
        throw new Error("Un des matériels sélectionnés n'est pas disponible.");
      }

      const overlappingReservations = await tx
        .select({
          matosId: resaMatosTable.matosId,
          quantity: resaMatosTable.quantity,
        })
        .from(resaMatosTable)
        .innerJoin(resaTable, eq(resaMatosTable.resaId, resaTable.id))
        .where(
          and(
            inArray(resaMatosTable.matosId, matosIds),
            lt(resaTable.start, end),
            gt(resaTable.end, start),
            ne(resaTable.id, id),
          ),
        );

      const reservedByMatos = new Map<number, number>();
      for (const reservation of overlappingReservations) {
        reservedByMatos.set(
          reservation.matosId,
          (reservedByMatos.get(reservation.matosId) ?? 0) + reservation.quantity,
        );
      }

      if (
        existingMatos.some(
          (matos) =>
            (reservedByMatos.get(matos.id) ?? 0) >= matos.quantity,
        )
      ) {
        throw new Error("Un des matériels sélectionnés n'est pas disponible à cet horaire.");
      }
    }

    await tx
      .update(resaTable)
      .set({ name: normalizedName, start, end })
      .where(and(eq(resaTable.id, id), eq(resaTable.user, userId)));
    await tx.delete(resaMatosTable).where(eq(resaMatosTable.resaId, id));

    if (matosIds.length > 0) {
      await tx.insert(resaMatosTable).values(
        matosIds.map((matosId) => ({ resaId: id, matosId })),
      );
    }
  });

  revalidatePath("/");
}
