"use client";

import { useEffect, useState } from "react";
import { getAvailableMatosQuantities } from "@/app/actions_serveur/newResa";
import { updateResa } from "@/app/actions_serveur/UpdateResa";
import { Button } from "@/components/ui/button";
import { CalendarClock, CalendarDays, CircleAlert, Package, PencilLine, Search, X } from "lucide-react";
import type { ReservationMaterial } from "../../../schema";
import { SuccessToast } from "@/components/ui/success-toast";

export type ReservationToEdit = {
  id: number;
  name: string;
  start: Date;
  end: Date;
  matos: ReservationMaterial[];
  userId: string | null;
};

type MatosOption = {
  id: number;
  name: string | null;
  quantity: number;
};

type MesReservationsProps = {
  reservations: ReservationToEdit[];
  matosList: MatosOption[];
  currentUserId: string;
  reservationToEditId: number | null;
  requestedReservationIsFinished: boolean;
};

function toLocalDateTimeParts(date: Date) {
  const value = new Date(date);
  return {
    date: `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`,
    displayDate: value.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    time: `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`,
  };
}

export default function MesReservations({
  reservations,
  matosList,
  currentUserId,
  reservationToEditId,
  requestedReservationIsFinished,
}: MesReservationsProps) {
  const requestedReservation = reservations.find(
    (item) =>
      item.id === reservationToEditId && item.userId === currentUserId,
  );
  const [editingId, setEditingId] = useState<number | null>(
    () => requestedReservation?.id ?? null,
  );
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedMatos, setSelectedMatos] = useState<Record<number, number>>(
    () => Object.fromEntries(
      requestedReservation?.matos.map((item) => [item.matosId, item.quantity]) ?? [],
    ),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [editRange, setEditRange] = useState(() => {
    if (!requestedReservation) {
      return { startDate: "", startTime: "", endDate: "", endTime: "" };
    }

    const start = toLocalDateTimeParts(requestedReservation.start);
    const end = toLocalDateTimeParts(requestedReservation.end);
    return {
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
    };
  });
  const [availabilityResult, setAvailabilityResult] = useState<{
    key: string;
    quantities: Record<number, number>;
    error?: string;
  } | null>(null);
  const availabilityKey = `${editingId}/${editRange.startDate}T${editRange.startTime}/${editRange.endDate}T${editRange.endTime}`;
  const hasCurrentAvailability = availabilityResult?.key === availabilityKey;
  const availableQuantities = hasCurrentAvailability ? availabilityResult?.quantities ?? {} : {};
  const checkingAvailability = editingId !== null && !hasCurrentAvailability;
  const availabilityError = hasCurrentAvailability ? availabilityResult?.error ?? "" : "";
  const selectedMatosIds = Object.keys(selectedMatos).map(Number);
  const selectedItems = matosList.filter((matos) => selectedMatosIds.includes(matos.id));
  const hasInsufficientAvailability = selectedMatosIds.some(
    (id) => selectedMatos[id] > (availableQuantities[id] ?? 0),
  );
  const availableMatos = matosList.filter(
    (matos) =>
      (availableQuantities[matos.id] ?? 0) > 0 &&
      !selectedMatosIds.includes(matos.id) &&
      (matos.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  );

  useEffect(() => {
    if (editingId === null) return;
    document
      .getElementById(`reservation-${editingId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editingId]);

  useEffect(() => {
    if (
      editingId === null ||
      !editRange.startDate ||
      !editRange.endDate
    ) return;
    const start = new Date(`${editRange.startDate}T${editRange.startTime}`);
    const end = new Date(`${editRange.endDate}T${editRange.endTime}`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return;

    let cancelled = false;
    const key = `${editingId}/${editRange.startDate}T${editRange.startTime}/${editRange.endDate}T${editRange.endTime}`;
    getAvailableMatosQuantities(start, end, editingId)
      .then((items) => {
        if (!cancelled) {
          setAvailabilityResult({
            key,
            quantities: Object.fromEntries(items.map((item) => [item.id, item.quantity])),
          });
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setAvailabilityResult({
            key,
            quantities: {},
            error: reason instanceof Error
              ? reason.message
              : "La disponibilité du matériel n'a pas pu être vérifiée.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editingId, editRange]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    reservation: ReservationToEdit,
  ) => {
    event.preventDefault();
    setError("");
    setSuccessMessage(null);
    setLoadingId(reservation.id);

    const formData = new FormData(event.currentTarget);
    const start = new Date(`${formData.get("startDate")}T${formData.get("startTime")}`);
    const end = new Date(`${formData.get("endDate")}T${formData.get("endTime")}`);
    const name = String(formData.get("name") ?? "");
    try {
      await updateResa(
        reservation.id,
        start,
        end,
        name,
        selectedMatosIds.map((matosId) => ({ matosId, quantity: selectedMatos[matosId] })),
      );
      setEditingId(null);
      setSelectedMatos({});
      setSearchQuery("");
      setSuccessMessage("Réservation modifiée.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La modification a échoué.");
    } finally {
      setLoadingId(null);
    }
  };

  if (reservations.length === 0) {
    return (
      <section id="mes-reservations" className="asso-panel flex h-full w-full flex-col rounded-2xl border p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-border/70 pb-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Mes réservations</h2>
          </div>
        </div>
        <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-5 text-center">
          <Package className="mb-2 size-6 text-muted-foreground/70" aria-hidden="true" />
          {requestedReservationIsFinished ? (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-5 py-4 text-left text-destructive shadow-md"
            >
              <CircleAlert className="size-6 shrink-0" aria-hidden="true" />
              <p className="text-base font-bold">Réservation finie</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">Aucune réservation à venir</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Vos prochaines réservations apparaîtront ici.
              </p>
            </>
          )}
        </div>
        {successMessage && <SuccessToast message={successMessage} />}
      </section>
    );
  }

  return (
    <section id="mes-reservations" className="asso-panel flex h-full w-full flex-col rounded-2xl border p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-border/70 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Mes réservations</h2>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
          {reservations.length}
        </span>
      </div>

      {requestedReservationIsFinished && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive shadow-md"
        >
          <CircleAlert className="size-6 shrink-0" aria-hidden="true" />
          <p className="text-base font-bold">Réservation finie</p>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {reservations.map((reservation) => {
          const start = toLocalDateTimeParts(reservation.start);
          const end = toLocalDateTimeParts(reservation.end);
          const isEditing = editingId === reservation.id;
          const isLoading = loadingId === reservation.id;
          const canEdit = reservation.userId === currentUserId;

          return (
            <article
              key={reservation.id}
              id={`reservation-${reservation.id}`}
              className="group rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              {isEditing ? (
                <form
                  onSubmit={(event) => handleSubmit(event, reservation)}
                  className="space-y-4"
                >
                  <label className="block space-y-1.5 text-sm font-semibold">
                    Intitulé
                    <input
                      name="name"
                      defaultValue={reservation.name}
                      maxLength={63}
                      required
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <fieldset className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
                      <legend className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Début</legend>
                      <input
                        name="startDate"
                        aria-label="Date de début"
                        type="date"
                        value={editRange.startDate}
                        onChange={(event) => setEditRange((range) => ({ ...range, startDate: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
                      />
                      <input
                        name="startTime"
                        aria-label="Heure de début"
                        type="time"
                        value={editRange.startTime}
                        onChange={(event) => setEditRange((range) => ({ ...range, startTime: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
                      />
                    </fieldset>
                    <fieldset className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
                      <legend className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Fin</legend>
                      <input
                        name="endDate"
                        aria-label="Date de fin"
                        type="date"
                        value={editRange.endDate}
                        onChange={(event) => setEditRange((range) => ({ ...range, endDate: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
                      />
                      <input
                        name="endTime"
                        aria-label="Heure de fin"
                        type="time"
                        value={editRange.endTime}
                        onChange={(event) => setEditRange((range) => ({ ...range, endTime: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
                      />
                    </fieldset>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <Package className="size-4 text-primary" aria-hidden="true" />
                      Matériel réservé
                    </label>
                    {matosList.length > 0 ? (
                      <>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Rechercher du matériel..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 pl-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          />
                          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                          {isSearchFocused && searchQuery.length > 0 && (
                            <div className="asso-options absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border p-1 shadow-lg">
                              {availableMatos.length > 0 ? (
                                availableMatos.map((matos) => (
                                  <button
                                    key={matos.id}
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => {
                                      setSelectedMatos((previous) => ({ ...previous, [matos.id]: 1 }));
                                      setSearchQuery("");
                                    }}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary/10"
                                  >
                                    {matos.name ?? "Matériel sans nom"}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      {availableQuantities[matos.id]} disponible(s)
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <p className="px-3 py-2.5 text-sm text-muted-foreground">
                                  Aucun résultat trouvé.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedItems.length > 0 && (
                          <div className="space-y-2 pt-1">
                            {selectedItems.map((matos) => {
                              const remaining = availableQuantities[matos.id] ?? 0;
                              return (
                                <div key={matos.id} className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2">
                                  <span className="min-w-0 flex-1 break-words text-sm font-medium">
                                    {matos.name ?? "Matériel sans nom"}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      {remaining} disponible(s)
                                    </span>
                                  </span>
                                  <label className="flex shrink-0 items-center gap-2 text-xs font-medium">
                                    Quantité
                                    <input
                                      aria-label={`Quantité de ${matos.name ?? "ce matériel"}`}
                                      type="number"
                                      min={1}
                                      max={remaining || 1}
                                      value={selectedMatos[matos.id]}
                                      onChange={(event) => {
                                        const quantity = Number(event.target.value);
                                        setSelectedMatos((previous) => ({
                                          ...previous,
                                          [matos.id]: quantity,
                                        }));
                                      }}
                                      className="w-16 rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    aria-label={`Retirer ${matos.name ?? "ce matériel"}`}
                                    onClick={() => setSelectedMatos((previous) => {
                                      const next = { ...previous };
                                      delete next[matos.id];
                                      return next;
                                    })}
                                    className="rounded-full text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    <X className="size-4" aria-hidden="true" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {checkingAvailability && (
                          <p className="text-xs text-muted-foreground">Vérification de la disponibilité…</p>
                        )}
                        {availabilityError && (
                          <p role="alert" className="text-xs text-destructive">{availabilityError}</p>
                        )}
                        {hasInsufficientAvailability && !checkingAvailability && (
                          <p role="alert" className="text-xs text-destructive">
                            La quantité choisie dépasse le stock disponible pour ce créneau.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun matériel disponible.</p>
                    )}
                  </div>

                  {error && (
                    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-border/70 pt-3">
                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        (selectedMatosIds.length > 0 &&
                          (checkingAvailability || Boolean(availabilityError) || hasInsufficientAvailability))
                      }
                    >
                      {isLoading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setSelectedMatos({});
                        setSearchQuery("");
                        setError("");
                      }}
                      disabled={isLoading}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold leading-snug">
                        {reservation.name || "Réservation sans nom"}
                      </h3>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
                        <span>{start.displayDate} à {start.time} – {end.displayDate} à {end.time}</span>
                      </p>
                    </div>
                    {canEdit ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5"
                        onClick={() => {
                          setSelectedMatos(Object.fromEntries(
                            reservation.matos.map((item) => [item.matosId, item.quantity]),
                          ));
                          setEditRange({
                            startDate: start.date,
                            startTime: start.time,
                            endDate: end.date,
                            endTime: end.time,
                          });
                          setSearchQuery("");
                          setEditingId(reservation.id);
                          setError("");
                        }}
                      >
                        <PencilLine className="size-3.5" aria-hidden="true" />
                        Modifier
                      </Button>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Non modifiable
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2 border-t border-border/60 pt-3 text-sm">
                    <Package className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <p className="min-w-0 break-words text-muted-foreground">
                      {reservation.matos
                        .map((item) => `${matosList.find((matos) => matos.id === item.matosId)?.name ?? "Matériel supprimé"} × ${item.quantity}`)
                        .join(", ") || "Aucun matériel"}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {successMessage && <SuccessToast message={successMessage} />}
    </section>
  );
}
