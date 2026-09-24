'use server';
import { db } from "../../drizzle/db";
import { matosTable} from "../../drizzle/schema";
import { revalidatePath } from "next/cache";

export async function newMatos(name: string, categorie: string) {
  await db.insert(matosTable).values({
    name: name,
    categorie: categorie, 
  });
  revalidatePath("/");
}