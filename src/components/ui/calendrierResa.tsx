"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Package, PencilLine, UserRound, X } from "lucide-react";

// --- TYPES ---
export type Reservation = {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  reservedBy: string | null;
  reservedByName: string | null;
  matos: { name: string; quantity: number }[];
  color?: string;
};

type WeeklyCalendarProps = {
  reservations: Reservation[];
  currentUserId: string | null;
};

// --- PARAMÈTRES D'AFFICHAGE ---
const START_HOUR = 0; // 00h00
const END_HOUR = 24; // 24h00
const TOTAL_GRID_MINUTES = (END_HOUR - START_HOUR) * 60; // 1440 minutes

// --- FONCTION POUR OBTENIR LE LUNDI DE LA SEMAINE ---
function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// --- ALGORITHME DE SUPERPOSITION ---
function calculateLayout(events: Reservation[]) {
  // On s'assure d'utiliser de vrais objets Date pour le tri
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const columns: Reservation[][] = [];

  sorted.forEach((event) => {
    let placed = false;
    for (const col of columns) {
      const lastEvent = col[col.length - 1];
      if (new Date(lastEvent.end) <= new Date(event.start)) {
        col.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
    }
  });

  const positions: Record<string | number, { width: number; left: number }> = {};
  const numCols = columns.length || 1;

  columns.forEach((col, colIndex) => {
    col.forEach((event) => {
      positions[event.id] = {
        width: 100 / numCols,
        left: (100 / numCols) * colIndex,
      };
    });
  });

  return positions;
}

export default function WeeklyCalendar({
  reservations,
  currentUserId,
}: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!selectedReservation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedReservation(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedReservation]);

  // --- FONCTIONS DE NAVIGATION ---
  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Générer les 7 jours de la semaine
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentWeekStart]);

  // Générer les heures de 0 à 23
  const hours = Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => START_HOUR + i);

  // Filtrer les événements pour un jour donné
  const getEventsForDay = (dayDate: Date) => {
    const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
    const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);

    return reservations.filter((r) => {
      const startDate = new Date(r.start);
      const endDate = new Date(r.end);
      return startDate <= dayEnd && endDate >= dayStart;
    });
  };

  const monthLabel = currentWeekStart.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
    <div className="asso-panel flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm">
      
      {/* BARRE DE NAVIGATION ET TITRE */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/55 p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousWeek}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-accent/50"
          >
            ←
          </button>
          <button
            onClick={handleToday}
            className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary transition-colors hover:bg-primary/20"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={handleNextWeek}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-accent/50"
          >
            →
          </button>
        </div>
        <span className="text-sm font-extrabold capitalize text-foreground">
          {monthLabel}
        </span>
      </div>

      {/* EN-TÊTE DES JOURS */}
      <div className="flex border-b border-border">
        <div className="w-16 flex-shrink-0 border-r border-border bg-secondary/35" />
        {days.map((day, i) => (
          <div key={i} className="calendar-day flex-1 border-r border-border py-2 text-center last:border-0">
            <div className="text-xs font-bold uppercase text-muted-foreground">
              {day.toLocaleDateString("fr-FR", { weekday: "short" })}
            </div>
            <div className="calendar-day-number text-base font-black text-foreground">
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      
        
        {/* Le conteneur principal de la grille qui prend toute la hauteur dispo (min 600px) */}
        <div className="flex flex-1 relative w-full min-h-[600px]">
          
          {/* Colonne des heures */}
          <div className="relative z-10 w-16 flex-shrink-0 border-r border-border bg-card">
            {hours.map((hour, i) => {
              const hourTopPercent = (i * 60 / TOTAL_GRID_MINUTES) * 100;
              return (
                <div
                  key={i}
                  className="absolute w-full -translate-y-1/2 pr-2 text-right text-xs text-muted-foreground"
                  style={{ top: `${hourTopPercent}%` }}
                >
                  {hour}h00
                </div>
              );
            })}
          </div>

          {/* Grille des jours */}
          <div className="relative flex flex-1 bg-card">
            
            {/* Lignes horizontales de fond */}
            <div className="absolute inset-0 pointer-events-none">
              {hours.map((_, i) => {
                const lineTopPercent = (i * 60 / TOTAL_GRID_MINUTES) * 100;
                return (
                  <div
                    key={i}
                    className="absolute w-full border-b border-border/55"
                    style={{ top: `${lineTopPercent}%` }}
                  />
                );
              })}
            </div>

            {/* Créneaux */}
            {days.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              const positions = calculateLayout(dayEvents);

              return (
                <div key={dayIndex} className="relative flex-1 border-r border-border/70 last:border-0">
                  {dayEvents.map((event) => {
                    const layout = positions[event.id] || { width: 100, left: 0 };
                    
                    const startDate = new Date(event.start);
                    const endDate = new Date(event.end);

                    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
                    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

                    const visualStart = startDate < dayStart ? dayStart : startDate;
                    const visualEnd = endDate > dayEnd ? dayEnd : endDate;

                    const startMins = visualStart.getHours() * 60 + visualStart.getMinutes();
                    let offsetMins = startMins - (START_HOUR * 60); 
                    if (offsetMins < 0) offsetMins = 0; 

                    const durationMins = (visualEnd.getTime() - visualStart.getTime()) / 60000;
                    
                    const topPercent = (offsetMins / TOTAL_GRID_MINUTES) * 100;
                    const heightPercent = (durationMins / TOTAL_GRID_MINUTES) * 100;
                    const finalHeight = Math.max(heightPercent, 1.5); 

                    return (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => setSelectedReservation(event)}
                        aria-label={`Afficher les détails de la réservation ${event.title}`}
                        className="absolute cursor-pointer overflow-hidden rounded-lg border border-white/35 p-1.5 text-left text-xs text-white shadow-md transition-transform hover:z-20 hover:scale-[1.02] focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        style={{
                          top: `${topPercent}%`,
                          height: `${finalHeight}%`,
                          left: `${layout.left}%`,
                          width: `${layout.width}%`,
                          backgroundColor: event.color || "#f59e0b",
                        }}
                      >
                        <div className="font-bold truncate">{event.title}</div>
                        <div className="mt-0.5 whitespace-normal break-words text-[10px] opacity-90">
                          Matos : {event.matos.map((item) => item.name).join(", ") || "Aucun"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    {selectedReservation && (
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          aria-label="Fermer les détails de la réservation"
          onClick={() => setSelectedReservation(null)}
          className="absolute inset-0 size-full cursor-default bg-black/35"
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-details-title"
          className="asso-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l p-6 shadow-2xl"
        >
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-border/70 pb-5">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Détails de la réservation
              </p>
              <h2 id="reservation-details-title" className="break-words text-xl font-extrabold">
                {selectedReservation.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedReservation(null)}
              aria-label="Fermer"
              className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <UserRound className="size-4 text-primary" aria-hidden="true" />
                Réservé par
              </h3>
              <p className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
                {selectedReservation.reservedByName ||
                  selectedReservation.reservedBy ||
                  "Utilisateur inconnu"}
              </p>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                Dates
              </h3>
              <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Début</p>
                  <p className="font-medium">
                    {selectedReservation.start.toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="border-t border-border/70 pt-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Fin</p>
                  <p className="font-medium">
                    {selectedReservation.end.toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Package className="size-4 text-primary" aria-hidden="true" />
                Matériel réservé
              </h3>
              {selectedReservation.matos.length > 0 ? (
                <ul className="space-y-2">
                  {selectedReservation.matos.map((item, index) => (
                    <li
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm"
                    >
                      <span className="break-words">{item.name}</span>
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                        × {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
                  Aucun matériel associé à cette réservation.
                </p>
              )}
            </section>
          </div>
          {currentUserId &&
            selectedReservation.reservedBy === currentUserId && (
              <Link
                href={`/?tab=mes-reservations&edit=${selectedReservation.id}#reservation-${selectedReservation.id}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PencilLine className="size-4" aria-hidden="true" />
                Modifier ma réservation
              </Link>
            )}
        </aside>
      </div>
    )}
    </>
  );
}