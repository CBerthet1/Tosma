'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { resaTable } from "../../drizzle/schema";
import { desc } from 'drizzle-orm';
import CalendrierResa, { Reservation } from "@/components/ui/calendrierResa"; 

// Fonction pour récupérer les réservations


export default async function Reservations_tab() {
  // Récupérer les 10 dernières réservations
  const reservations = await db.select()
    .from(resaTable)
    .orderBy(desc(resaTable.start));

  const calendarEvents: Reservation[] = reservations.map((resa) => ({
    id: resa.id,
    title: `${resa.name}`, 
    start: new Date(resa.start),
    end: new Date(resa.end),
    
  }));

  return (
    <div className="w-full h-full flex flex-col">
      {/* Un header pour changer de semaine pourrait aller ici plus tard */}
      <CalendrierResa reservations={calendarEvents} />
    </div>
  );
}