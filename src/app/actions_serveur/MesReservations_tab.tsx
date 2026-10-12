import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { resaTable } from "../../drizzle/schema";
import { and, eq, gt } from "drizzle-orm";
import MesReservations, { type ReservationToEdit } from "@/components/ui/mesReservations";
import { parseReservationMaterials } from "@/lib/reservation-materials";

type MatosOption = {
  id: number;
  name: string | null;
};

export default async function MesReservations_tab({
  matosList,
}: {
  matosList: MatosOption[];
}) {
  const session = await auth();
  if (!session?.user) {
    return <p className="text-sm text-muted-foreground">Connectez-vous pour voir vos réservations.</p>;
  }

  const now = new Date();
  const rows = await db
    .select({
      id: resaTable.id,
      name: resaTable.name,
      start: resaTable.start,
      end: resaTable.end,
      userId: resaTable.user,
      matos: resaTable.matos,
    })
    .from(resaTable)
    .where(and(gt(resaTable.end, now), eq(resaTable.user, session.user.id)));

  return (
    <MesReservations
      reservations={rows.map((row): ReservationToEdit => ({
        id: row.id,
        name: row.name ?? "",
        start: row.start,
        end: row.end,
        matos: parseReservationMaterials(row.matos),
        userId: row.userId,
      }))}
      matosList={matosList}
      currentUserId={session.user.id}
    />
  );
}
