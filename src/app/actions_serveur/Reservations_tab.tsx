'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { matosTable, resaMatosTable, resaTable } from "../../drizzle/schema";
import CalendrierResa, { Reservation } from "@/components/ui/calendrierResa"; 
import { eq } from "drizzle-orm";

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
  const rows = await db
    .select({
      id: resaTable.id,
      title: resaTable.name,
      start: resaTable.start,
      end: resaTable.end,
      matosId: resaMatosTable.matosId,
      matosName: matosTable.name,
    })
    .from(resaTable)
    .leftJoin(resaMatosTable, eq(resaTable.id, resaMatosTable.resaId))
    .leftJoin(matosTable, eq(resaMatosTable.matosId, matosTable.id));

  const eventsById = new Map<number, Reservation>();
  for (const row of rows) {
    let event = eventsById.get(row.id);
    if (!event) {
      event = {
        id: row.id,
        title: row.title ?? "Réservation sans nom",
        start: new Date(row.start),
        end: new Date(row.end),
        matos: [],
        color: getStringColor(row.id),
      };
      eventsById.set(row.id, event);
    }

    if (row.matosId !== null) {
      event.matos.push(row.matosName ?? "Matériel sans nom");
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <CalendrierResa reservations={[...eventsById.values()]} />
    </div>
  );
}
