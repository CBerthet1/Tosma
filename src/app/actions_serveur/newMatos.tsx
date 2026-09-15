'use server';
import { db } from "../../../drizzle/db";
import { matosTable} from "../../../drizzle/schema";
import { revalidatePath } from "next/cache";

export async function newMatos(name: string) {
  await db.insert(matosTable).values({
    name: name,
  });
  revalidatePath("/");
}