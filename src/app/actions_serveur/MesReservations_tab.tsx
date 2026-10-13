import { auth } from "@/auth";
import { db } from "../../drizzle/db";
import { resaTable } from "../../drizzle/schema";
import { and, eq, gt } from "drizzle-orm";
import MesReservations, { type ReservationToEdit } from "@/components/ui/mesReservations";
import { parseReservationMaterials } from "@/lib/reservation-materials";

type MatosOption = {
  id: number;
  name: string | null;
  quantity: number;
};

export default async function MesReservations_tab({
  matosList,
  reservationToEditId,
}: {
  matosList: MatosOption[];
  reservationToEditId: number | null;
}) {
  const session = await auth();
  if (!session?.user) {
    return <p className="text-sm text-muted-foreground">Connectez-vous pour voir vos réservations.</p>;
  }

  const isAdmin = Boolean(session.user.groups?.includes("geek"));
  const now = new Date();
  const ownRows = await db
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
  const selectedRows =
    isAdmin && reservationToEditId !== null
      ? await db
          .select({
            id: resaTable.id,
            name: resaTable.name,
            start: resaTable.start,
            end: resaTable.end,
            userId: resaTable.user,
            matos: resaTable.matos,
          })
          .from(resaTable)
          .where(eq(resaTable.id, reservationToEditId))
      : [];
  const rows = [
    ...ownRows,
    ...selectedRows.filter(
      (selected) => !ownRows.some((own) => own.id === selected.id),
    ),
  ];

  return (
    <MesReservations
      key={reservationToEditId ?? "no-edit"}
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
      isAdmin={isAdmin}
      reservationToEditId={reservationToEditId}
    />
  );
}
