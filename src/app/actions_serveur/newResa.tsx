'use server';
import { db } from "../../../drizzle/db";
import { resaTable } from "../../../drizzle/schema";
import { revalidatePath } from "next/cache";

export async function newResa(start: Date, end: Date, name: string) {
  await db.insert(resaTable).values({
    name: name,
    start: start,
    end: end,

  });
  revalidatePath("/");
}