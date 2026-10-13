'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { matosTable, resaTable } from "../../drizzle/schema";
import CalendrierResa, { Reservation } from "@/components/ui/calendrierResa";
import { inArray } from "drizzle-orm";
import { parseReservationMaterials } from "@/lib/reservation-materials";

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
export default async function Reservations_tab({
  currentUserId,
}: {
  currentUserId: string | null;
}) {
  const rows = await db
    .select({
      id: resaTable.id,
      title: resaTable.name,
      start: resaTable.start,
      end: resaTable.end,
      user: resaTable.user,
      userDisplayName: resaTable.userDisplayName,
      matos: resaTable.matos,
    })
    .from(resaTable);

  const reservations = rows.map((row) => ({
    ...row,
    matos: parseReservationMaterials(row.matos),
  }));
  const matosIds = [...new Set(reservations.flatMap((row) => row.matos.map((item) => item.matosId)))];
  const materials = matosIds.length > 0
    ? await db
        .select({ id: matosTable.id, name: matosTable.name })
        .from(matosTable)
        .where(inArray(matosTable.id, matosIds))
    : [];
  const materialsById = new Map(materials.map((material) => [material.id, material]));

  return (
    <div className="w-full h-full flex flex-col">
      <CalendrierResa
        currentUserId={currentUserId}
        reservations={reservations.map((row): Reservation => ({
          id: row.id,
          title: row.title ?? "Réservation sans nom",
          start: new Date(row.start),
          end: new Date(row.end),
          reservedBy: row.user,
          reservedByName: row.userDisplayName,
          matos: row.matos.map((item) => ({
            name: materialsById.get(item.matosId)?.name ?? "Matériel sans nom",
            quantity: item.quantity,
          })),
          color: getStringColor(row.id),
        }))}
      />
    </div>
  );
}
