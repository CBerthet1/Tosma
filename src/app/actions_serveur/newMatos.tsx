'use server';
import { db } from "../../drizzle/db";
import { categoryTable, matosTable } from "../../drizzle/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function newMatos(name: string, categoryId: number) {
  const normalizedName = name.trim();
  if (!normalizedName || normalizedName.length > 255 || !Number.isInteger(categoryId) || categoryId < 1) {
    throw new Error("Nom ou catégorie invalide.");
  }

  const [category] = await db
    .select({ id: categoryTable.id })
    .from(categoryTable)
    .where(eq(categoryTable.id, categoryId))
    .limit(1);

  if (!category) {
    throw new Error("La catégorie sélectionnée n'existe pas.");
  }

  await db.insert(matosTable).values({
    name: normalizedName,
    categoryId,
  });
  revalidatePath("/");
}