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
  const reservations = await db
    .select({
      id: resaTable.id,
      name: resaTable.name,
      start: resaTable.start,
      end: resaTable.end,
      userId: resaTable.user,
    })
    .from(resaTable)
    .where(and(gt(resaTable.end, now), eq(resaTable.user, session.user.id)));

  const reservationMatos = await db
    .select({
      resaId: resaMatosTable.resaId,
      matosId: resaMatosTable.matosId,
    })
    .from(resaMatosTable)
    .innerJoin(resaTable, eq(resaMatosTable.resaId, resaTable.id))
    .where(and(gt(resaTable.end, now), eq(resaTable.user, session.user.id)));

  const matosByReservation = new Map<number, number[]>();
  for (const item of reservationMatos) {
    const selected = matosByReservation.get(item.resaId) ?? [];
    selected.push(item.matosId);
    matosByReservation.set(item.resaId, selected);
  }

  const editableReservations: ReservationToEdit[] = reservations.map((reservation) => ({
    id: reservation.id,
    name: reservation.name ?? "",
    start: reservation.start,
    end: reservation.end,
    matosIds: matosByReservation.get(reservation.id) ?? [],
    userId: reservation.userId,
  }));

  return (
    <MesReservations
      reservations={editableReservations}
      matosList={matosList}
      currentUserId={session.user.id}
    />
  );
}
