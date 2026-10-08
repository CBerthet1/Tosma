import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { resaMatosTable, resaTable } from "../../drizzle/schema";
import { and, eq, gt } from "drizzle-orm";
import MesReservations, { type ReservationToEdit } from "@/components/ui/mesReservations";

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
      matosId: resaMatosTable.matosId,
    })
    .from(resaTable)
    .leftJoin(resaMatosTable, eq(resaTable.id, resaMatosTable.resaId))
    .where(and(gt(resaTable.end, now), eq(resaTable.user, session.user.id)));

  const reservationsById = new Map<number, ReservationToEdit>();
  for (const row of rows) {
    let reservation = reservationsById.get(row.id);
    if (!reservation) {
      reservation = {
        id: row.id,
        name: row.name ?? "",
        start: row.start,
        end: row.end,
        matosIds: [],
        userId: row.userId,
      };
      reservationsById.set(row.id, reservation);
    }

    if (row.matosId !== null) {
      reservation.matosIds.push(row.matosId);
    }
  }

  return (
    <MesReservations
      reservations={[...reservationsById.values()]}
      matosList={matosList}
      currentUserId={session.user.id}
    />
  );
}
