'use server';
import { auth } from "@/auth";
import { db } from "../../../db";
import { matosTable } from "../../../schema";
import { revalidatePath } from "next/cache";
import { CATEGORIES } from "@/lib/categories";

type NewMatosInput = {
  name: string;
  categorie: string;
  description: string;
  image: string;
  quantity: number;
  available: boolean;
};

export async function newMatos({
  name,
  categorie,
  description,
  image,
  quantity,
  available,
}: NewMatosInput) {
  const session = await auth();
  if (!session?.user?.groups?.includes("geek")) {
    throw new Error("Seuls les membres du groupe geek peuvent ajouter du matériel.");
  }

  if (
    typeof name !== "string" ||
    typeof categorie !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string"
  ) {
    throw new Error("Les informations du matériel sont invalides.");
  }

  const normalizedName = name.trim();
  const normalizedCategorie = categorie.trim();
  const normalizedDescription = description.trim();
  const normalizedImage = image.trim();
  if (
    !normalizedName ||
    normalizedName.length > 255 ||
    !CATEGORIES.some((category) => category === normalizedCategorie) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    typeof available !== "boolean" ||
    normalizedImage.length > 255
  ) {
    throw new Error("Les informations du matériel sont invalides.");
  }

  await db.insert(matosTable).values({
    name: normalizedName,
    categorie: normalizedCategorie,
    description: normalizedDescription || null,
    image: normalizedImage || null,
    quantity,
    available: available ? 1 : 0,
  });
  revalidatePath("/");
}