import type { ReservationMaterial } from "@/db/schema";

type ReservationInterval = {
  id?: number;
  start: Date;
  end: Date;
  matos: ReservationMaterial[];
};

type AvailabilityEvent = {
  time: number;
  quantityChange: number;
};

export function getPeakReservedQuantities(
  reservations: ReservationInterval[],
  start: Date,
  end: Date,
  excludeReservationId?: number,
) {
  const eventsByMatos = new Map<number, AvailabilityEvent[]>();

  for (const reservation of reservations) {
    if (
      excludeReservationId !== undefined &&
      reservation.id === excludeReservationId
    ) {
      continue;
    }

    const intervalStart = Math.max(start.getTime(), reservation.start.getTime());
    const intervalEnd = Math.min(end.getTime(), reservation.end.getTime());
    if (intervalStart >= intervalEnd) continue;

    for (const item of reservation.matos) {
      const events = eventsByMatos.get(item.matosId) ?? [];
      events.push(
        { time: intervalStart, quantityChange: item.quantity },
        { time: intervalEnd, quantityChange: -item.quantity },
      );
      eventsByMatos.set(item.matosId, events);
    }
  }

  const peakByMatos = new Map<number, number>();
  for (const [matosId, events] of eventsByMatos) {
    events.sort(
      (a, b) => a.time - b.time || a.quantityChange - b.quantityChange,
    );

    let reservedQuantity = 0;
    let peakQuantity = 0;
    for (const event of events) {
      reservedQuantity += event.quantityChange;
      peakQuantity = Math.max(peakQuantity, reservedQuantity);
    }
    peakByMatos.set(matosId, peakQuantity);
  }

  return peakByMatos;
}
