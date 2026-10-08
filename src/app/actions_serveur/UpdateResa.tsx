'use server';

import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { matosTable, resaMatosTable, resaTable } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateResa(
  id: number,
  start: Date,
  end: Date,
  name: string,
  matosIds: number[],
) {
  const session = await auth();
  if (!session?.user) {
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
      .select({ id: resaTable.id })
      .from(resaTable)
      .where(eq(resaTable.id, id));

    if (!reservation) {
      throw new Error("Cette réservation n'existe pas.");
    }

    if (matosIds.length > 0) {
      const existingMatos = await tx
        .select({ id: matosTable.id })
        .from(matosTable)
        .where(inArray(matosTable.id, matosIds));

      if (existingMatos.length !== matosIds.length) {
        throw new Error("Un des matériels sélectionnés n'existe plus.");
      }
    }

    await tx
      .update(resaTable)
      .set({ name: normalizedName, start, end })
      .where(eq(resaTable.id, id));
    await tx.delete(resaMatosTable).where(eq(resaMatosTable.resaId, id));

    if (matosIds.length > 0) {
      await tx.insert(resaMatosTable).values(
        matosIds.map((matosId) => ({ resaId: id, matosId })),
      );
    }
  });

  revalidatePath("/");
}
