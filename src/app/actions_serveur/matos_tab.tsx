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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Liste du matos</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-700 rounded-lg shadow">
          <thead className="bg-gray-350 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nom</th>
            </tr>
          </thead>
          <tbody>
            {matos_list.map((matos) => (
              <tr key={matos.id} className="border-t border-gray-500 dark:border-gray-700">
                <td className="px-4 py-2">{matos.id}</td>
                <td className="px-4 py-2">{matos.name}</td>
  
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}