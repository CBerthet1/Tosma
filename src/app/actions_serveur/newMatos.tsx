'use server';
import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { matosTable } from "../../drizzle/schema";
import { revalidatePath } from "next/cache";

export async function newMatos(name: string, categorie: string) {
  const session = await auth();
  if (!session?.user?.groups?.includes("geek")) {
    throw new Error("Seuls les membres du groupe geek peuvent ajouter du matériel.");
  }

  const normalizedName = name.trim();
  const normalizedCategorie = categorie.trim();
  if (
    !normalizedName ||
    normalizedName.length > 255 ||
    !normalizedCategorie ||
    normalizedCategorie.length > 255
  ) {
    throw new Error("Nom ou catégorie invalide.");
  }

  await db.insert(matosTable).values({
    name: normalizedName,
    categorie: normalizedCategorie,
  });
  revalidatePath("/");
}