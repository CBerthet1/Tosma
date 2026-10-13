'use server';

import { auth } from "@/auth";
import { db } from "../../../db";
import { matosTable, resaTable, type ReservationMaterial } from "../../../schema";
import { and, asc, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseReservationMaterials } from "@/lib/reservation-materials";
import { getDateAfterMonths } from "@/lib/reservation-dates";
import { getPeakReservedQuantities } from "@/lib/reservation-availability";
import { hasAdminGroup } from "@/lib/admin";

export async function updateResa(
  id: number,
  start: Date,
  end: Date,
  name: string,
  matos: ReservationMaterial[],
) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = hasAdminGroup(session?.user?.groups);
  if (!userId) {
    throw new Error("Vous devez être connecté pour modifier une réservation.");
  }

  const normalizedName = name.trim();
  if (
    !Number.isInteger(id) ||
    id < 1 ||
    !normalizedName ||
    normalizedName.length > 63 ||
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end ||
    end > getDateAfterMonths(start, 11) ||
    !Array.isArray(matos) ||
    !matos.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        Number.isInteger(item.matosId) &&
        item.matosId > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    ) ||
    new Set(matos.map((item) => item.matosId)).size !== matos.length
  ) {
    throw new Error("Les informations de réservation sont invalides. La fin doit être après le début et la réservation ne peut pas dépasser 11 mois.");
  }

  await db.transaction(async (tx) => {
    const [reservation] = await tx
      .select({ id: resaTable.id, userId: resaTable.user })
      .from(resaTable)
      .where(eq(resaTable.id, id))
      .for("update");

    if (!reservation || (!isAdmin && reservation.userId !== userId)) {
      throw new Error(
        isAdmin
          ? "Cette réservation n'existe pas."
          : "Vous ne pouvez modifier que les réservations que vous avez créées.",
      );
    }

    if (matos.length > 0) {
      const existingMatos = await tx
        .select({
          id: matosTable.id,
          available: matosTable.available,
          quantity: matosTable.quantity,
        })
        .from(matosTable)
        .where(inArray(matosTable.id, matos.map((item) => item.matosId)))
        .orderBy(asc(matosTable.id))
        .for("update");

      if (existingMatos.length !== matos.length) {
        throw new Error("Un des matériels sélectionnés n'existe plus.");
      }

      if (existingMatos.some((matos) => !matos.available)) {
        throw new Error("Un des matériels sélectionnés n'est pas disponible.");
      }

      const overlappingReservations = await tx
        .select({
          id: resaTable.id,
          start: resaTable.start,
          end: resaTable.end,
          matos: resaTable.matos,
        })
        .from(resaTable)
        .where(
          and(
            lt(resaTable.start, end),
            gt(resaTable.end, start),
            ne(resaTable.id, id),
          ),
        );

      const reservedByMatos = getPeakReservedQuantities(
        overlappingReservations.map((reservation) => ({
          start: reservation.start,
          end: reservation.end,
          matos: parseReservationMaterials(reservation.matos),
          id: reservation.id,
        })),
        start,
        end,
      );

      if (
        matos.some((item) => {
          const material = existingMatos.find(({ id }) => id === item.matosId);
          return (
            !material?.available ||
            item.quantity >
              material.quantity - (reservedByMatos.get(item.matosId) ?? 0)
          );
        })
      ) {
        throw new Error("La quantité demandée n'est pas disponible à cet horaire.");
      }
    }

    await tx
      .update(resaTable)
      .set({
        name: normalizedName,
        start,
        end,
        matos,
      })
      .where(
        isAdmin
          ? eq(resaTable.id, id)
          : and(eq(resaTable.id, id), eq(resaTable.user, userId)),
      );
  }, { isolationLevel: "read committed" });

  revalidatePath("/");
}
