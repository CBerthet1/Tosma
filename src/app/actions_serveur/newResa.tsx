'use server';
import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { matosTable, resaTable, resaMatosTable } from "../../drizzle/schema";
import { revalidatePath } from "next/cache";
import { inArray } from "drizzle-orm";

export async function newResa(
  start: Date, 
  end: Date, 
  name: string, 
  matosIds: number[] 
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Vous devez être connecté pour créer une réservation.");
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
    }

    // 1. Insertion de la réservation 
    const [result] = await tx.insert(resaTable).values({
      name: normalizedName,
      start: start,
      end: end,
      user: userId,
    });

    const newResaId = result.insertId;

    // 2. Insertion des matériels liés (si au moins un matériel est sélectionné)
    if (matosIds && matosIds.length > 0) {
      const links = matosIds.map((matosId) => ({
        resaId: newResaId,
        matosId: matosId,
      }));

      await tx.insert(resaMatosTable).values(links);
    }
  });

  revalidatePath("/");
}