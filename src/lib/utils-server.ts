
import { db } from "../drizzle/db"; // la base de données
import { resaTable } from "../drizzle/schema"; //la table
import { eq } from "drizzle-orm"; // eq est l'opérateur pour l'égalité





export async function getUsername(id:number){
  // async signifie que l'on peut utiliser await qui permet d'attendre la réponde de la BDD
  const data = await db
  .select()
  .from(resaTable) // la table
  .where(eq(resaTable.id,id)); 

 return {success:true , data}
}