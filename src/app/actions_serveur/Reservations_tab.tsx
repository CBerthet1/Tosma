'use server'; // Ce composant est côté serveur

import { db } from "../../../drizzle/db";
import { resaTable } from "../../../drizzle/schema";
import { desc } from 'drizzle-orm';
import {DeleteResa_button} from "@/components/ui/deleteResa_button"; 

// Fonction pour récupérer les réservations


export default async function Reservations_tab() {
  // Récupérer les 10 dernières réservations
  const reservations = await db.select()
    .from(resaTable)
    .orderBy(desc(resaTable.start))
    .limit(10);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📋 Dernières réservations</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-700 rounded-lg shadow">
          <thead className="bg-gray-350 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">début</th>
              <th className="px-4 py-2 text-left">fin</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((resa) => (
              <tr key={resa.id} className="border-t border-gray-500 dark:border-gray-700">
                <td className="px-4 py-2"><DeleteResa_button id={resa.id} /></td>
                <td className="px-4 py-2">{resa.name}</td>
                <td className="px-4 py-2">{new Date(resa.start).toLocaleString('fr-FR',{dateStyle: 'short',timeStyle: 'short'})}</td>
                <td className="px-4 py-2">{new Date(resa.end).toLocaleString('fr-FR',{dateStyle: 'short',timeStyle: 'short'})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}