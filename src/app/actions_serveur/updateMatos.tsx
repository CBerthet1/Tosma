'use server';

import { auth } from "@/auth";
import { db } from "../../../db";
import { matosTable } from "../../../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CATEGORIES } from "@/lib/categories";

type UpdateMatosInput = {
  name: string;
  categorie: string;
  description: string;
  image: string;
  quantity: number;
  available: boolean;
};

export async function updateMatos(id: number, values: UpdateMatosInput) {
  const session = await auth();
  if (!session?.user?.groups?.includes("geek")) {
    throw new Error("Seuls les membres du groupe geek peuvent modifier le matériel.");
  }

  if (
    !Number.isInteger(id) ||
    id < 1 ||
    !values ||
    typeof values.name !== "string" ||
    typeof values.categorie !== "string" ||
    typeof values.description !== "string" ||
    typeof values.image !== "string" ||
    !Number.isInteger(values.quantity) ||
    values.quantity < 1 ||
    typeof values.available !== "boolean"
  ) {
    throw new Error("Les informations du matériel sont invalides.");
  }

  const name = values.name.trim();
  const categorie = values.categorie.trim();
  const description = values.description.trim();
  const image = values.image.trim();
  if (
    !name ||
    name.length > 255 ||
    !CATEGORIES.some((category) => category === categorie) ||
    image.length > 255
  ) {
    throw new Error("Les informations du matériel sont invalides.");
  }

  const [existingMaterial] = await db
    .select({ id: matosTable.id })
    .from(matosTable)
    .where(eq(matosTable.id, id));
  if (!existingMaterial) {
    throw new Error("Ce matériel n'existe plus.");
  }

  await db
    .update(matosTable)
    .set({
      name,
      categorie,
      description: description || null,
      image: image || null,
      quantity: values.quantity,
      available: values.available ? 1 : 0,
    })
    .where(eq(matosTable.id, id));

  revalidatePath("/");
}
