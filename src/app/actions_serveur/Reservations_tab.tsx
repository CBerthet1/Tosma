'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { resaTable } from "../../drizzle/schema";
import { desc } from 'drizzle-orm';
import CalendrierResa, { Reservation } from "@/components/ui/calendrierResa"; 

const RESERVATION_COLORS = [
  "#b08d55", // Amber (Moutarde grisée)
  "#5e7b99", // Blue (Bleu acier/denim)
  "#608a70", // Emerald (Vert sauge)
  "#827397", // Violet (Mauve désaturé)
  "#a36e7f", // Pink (Vieux rose sombre)
  "#9e6060", // Red (Rouge brique terne)
  "#5c8787", // Teal (Gris-vert canard)
  "#a87b5d", // Orange (Terre cuite grisée)
  "#628e99", // Cyan (Bleu cadet pâle)
  "#6e7399", // Indigo (Bleu ardoise)
];

// Fonction qui donne toujours la même couleur pour un même texte ou ID
function getStringColor(str: string | number) {
  const stringValue = String(str);
  let hash = 0;
  for (let i = 0; i < stringValue.length; i++) {
    hash = stringValue.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % RESERVATION_COLORS.length;
  return RESERVATION_COLORS[index];
}

// Fonction pour récupérer les réservations
export default async function Reservations_tab() {
  // Récupérer les 10 dernières réservations
  const reservations = await db.select()
    .from(resaTable);

  const calendarEvents: Reservation[] = reservations.map((resa) => ({
    id: resa.id,
    title: `${resa.name}`, 
    start: new Date(resa.start),
    end: new Date(resa.end),
    color: getStringColor(resa.id),
  }));
  

  return (
    <div className="w-full h-full flex flex-col">
      {/* Un header pour changer de semaine pourrait aller ici plus tard */}
      <CalendrierResa reservations={calendarEvents} />
    </div>
  );
}
