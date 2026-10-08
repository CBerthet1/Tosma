'use server';
import { db } from "../../drizzle/db";
import { resaMatosTable, resaTable } from "../../drizzle/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function DeleteResa(id: number) {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Identifiant de réservation invalide.");
  }

  await db.transaction(async (tx) => {
    await tx.delete(resaMatosTable).where(eq(resaMatosTable.resaId, id));
    await tx.delete(resaTable).where(eq(resaTable.id, id));
  });
  revalidatePath("/");
}