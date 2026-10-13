'use server';
import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { resaTable } from "../../drizzle/schema";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

export async function DeleteResa(id: number) {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Identifiant de réservation invalide.");
  }

  const userId = (await auth())?.user?.id;
  if (!userId) {
    throw new Error("Vous devez être connecté pour supprimer une réservation.");
  }

  const [reservation] = await db
    .select({ id: resaTable.id })
    .from(resaTable)
    .where(and(eq(resaTable.id, id), eq(resaTable.user, userId)));

  if (!reservation) {
    throw new Error("Vous ne pouvez supprimer que les réservations que vous avez créées.");
  }

  await db
    .delete(resaTable)
    .where(and(eq(resaTable.id, id), eq(resaTable.user, userId)));
  revalidatePath("/");
}