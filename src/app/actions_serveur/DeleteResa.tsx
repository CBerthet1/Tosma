'use server';
import { db } from "../../../drizzle/db";
import { resaTable } from "../../../drizzle/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function DeleteResa(id: number) {
  await db.delete(resaTable).where(eq(resaTable.id, id));
  revalidatePath("/");
}