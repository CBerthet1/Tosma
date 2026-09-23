'use server';

import { db } from "../../drizzle/db";
import { resaTable, resaMatosTable } from "../../drizzle/schema";
import { revalidatePath } from "next/cache";

export async function newResa(
  start: Date, 
  end: Date, 
  name: string, 
  matosIds: number[] 
) {
  await db.transaction(async (tx) => { //transaction permet de s'assurer que toutes les opérations sont effectuées correctement, sinon elles sont annulées
    // 1. Insertion de la réservation 
    const [result] = await tx.insert(resaTable).values({
      name: name,
      start: start,
      end: end,
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