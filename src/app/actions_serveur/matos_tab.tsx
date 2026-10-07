'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { matosTable } from "../../drizzle/schema";
import { desc } from 'drizzle-orm';


// Fonction pour récupérer les réservations


export default async function Matos_tab() {
  const matos_list = await db.select()
    .from(matosTable)
    .orderBy(desc(matosTable.id))
    .limit(10);

  return (
    <div className="asso-panel container mx-auto overflow-hidden rounded-2xl border p-5 sm:p-6">
      <h1 className="mb-4 text-xl font-extrabold">Liste du matos</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-xl bg-card">
          <thead className="bg-secondary/70">
            <tr>
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Catégorie</th>
            </tr>
          </thead>
          <tbody>
            {matos_list.map((matos) => (
              <tr key={matos.id} className="border-t border-border">
                <td className="px-4 py-2">{matos.name}</td>
                <td className="px-4 py-2">
                  <span className="inventory-tag inline-flex rounded-full px-3 py-1 text-xs font-bold">{matos.categorie}</span>
                </td>
                
  
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}