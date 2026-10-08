'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { categoryTable, matosTable } from "../../drizzle/schema";
import { desc, eq } from 'drizzle-orm';


// Fonction pour récupérer les réservations


export default async function Matos_tab() {
  const matos_list = await db.select({
    id: matosTable.id,
    name: matosTable.name,
    categoryId: matosTable.categoryId,
    categoryName: categoryTable.name,
  })
    .from(matosTable)
    .leftJoin(categoryTable, eq(matosTable.categoryId, categoryTable.id))
    .orderBy(desc(matosTable.id));

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
                <td className="px-4 py-2">{matos.name ?? "Matériel sans nom"}</td>
                <td className="px-4 py-2">
                  <span className="inventory-tag inline-flex rounded-full px-3 py-1 text-xs font-bold">
                    {matos.categoryName ?? `Catégorie ${matos.categoryId}`}
                  </span>
                </td>
                
  
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}