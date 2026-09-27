"use client";

import React, { useMemo, useState } from "react";

// --- TYPES ---
export type Reservation = {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color?: string; // Optionnel : pour différencier le matériel
};

type calendrierResaProps = {
  reservations: Reservation[];
};

// --- PARAMÈTRES D'AFFICHAGE ---
const START_HOUR = 0; // Commence à 0h00
const END_HOUR = 24; // Finit à minuit
const PIXELS_PER_MINUTE = 1.2; // Hauteur : 1 minute = 1.2px (1h = 72px)

// --- ALGORITHME DE SUPERPOSITION ---
// Permet de calculer la position (gauche) et la largeur des événements qui se chevauchent
function calculateLayout(events: Reservation[]) {
  // 1. Trier par date de début
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const columns: Reservation[][] = [];

  sorted.forEach((event) => {
    let placed = false;
    for (let col of columns) {
      const lastEvent = col[col.length - 1];
      // Si le dernier événement de la colonne se termine avant le début du nouveau, on l'ajoute ici
      if (lastEvent.end <= event.start) {
        col.push(event);
        placed = true;
        break;
      }
    }
    // Sinon, on crée une nouvelle colonne
    if (!placed) {
      columns.push([event]);
    }
  });

  const positions: Record<string | number, { width: number; left: number }> = {};
  const numCols = columns.length || 1; // Éviter la division par zéro

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

export default function CalendrierResa({ reservations }: calendrierResaProps) {
  // Par défaut, on commence au lundi de la semaine en cours
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajuster au Lundi
    return new Date(today.setDate(diff));
  });

  // Générer les 7 jours de la semaine
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentWeekStart]);

  // Générer la colonne des heures
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => START_HOUR + i);

  // Séparer les événements par jour
  const getEventsForDay = (dayDate: Date) => {
    return reservations.filter((r) => {
      return (
        r.start.getDate() === dayDate.getDate() &&
        r.start.getMonth() === dayDate.getMonth() &&
        r.start.getFullYear() === dayDate.getFullYear()
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
      
      {/* HEADER : Navigation et jours */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <div className="w-16 flex-shrink-0 bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-800" />
        {days.map((day, i) => (
          <div key={i} className="flex-1 text-center py-3 border-r border-gray-200 dark:border-gray-800 last:border-0 bg-gray-50 dark:bg-zinc-900">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              {day.toLocaleDateString("fr-FR", { weekday: "short" })}
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* CORPS : Grille des heures et créneaux */}
      <div className="flex flex-1 overflow-y-auto relative">
        
        {/* Colonne des heures */}
        <div className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 relative bg-white dark:bg-black z-10">
          {hours.map((hour, i) => (
            <div
              key={i}
              className="text-xs text-gray-400 text-right pr-2 absolute w-full"
              style={{ top: i * 60 * PIXELS_PER_MINUTE - 8 }} // -8 pour centrer le texte sur la ligne
            >
              {hour}h00
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="flex flex-1 relative bg-white dark:bg-black">
          {/* Lignes horizontales de fond */}
          <div className="absolute inset-0 pointer-events-none">
            {hours.map((_, i) => (
              <div
                key={i}
                className="w-full border-b border-gray-100 dark:border-gray-800/50 absolute"
                style={{ top: i * 60 * PIXELS_PER_MINUTE }}
              />
            ))}
          </div>

          {/* Colonnes des jours */}
          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const positions = calculateLayout(dayEvents);

            return (
              <div key={dayIndex} className="flex-1 relative border-r border-gray-200 dark:border-gray-800 last:border-0">
                {dayEvents.map((event) => {
                  const layout = positions[event.id];
                  
                  // Calcul de la position Y (top)
                  const startMins = event.start.getHours() * 60 + event.start.getMinutes();
                  const offsetMins = startMins - START_HOUR * 60;
                  const top = offsetMins * PIXELS_PER_MINUTE;

                  // Calcul de la hauteur (height)
                  const durationMins = (event.end.getTime() - event.start.getTime()) / 60000;
                  const height = durationMins * PIXELS_PER_MINUTE;

                  return (
                    <div
                      key={event.id}
                      className="absolute rounded-md p-1.5 text-xs text-white overflow-hidden shadow-sm transition-transform hover:scale-[1.02] hover:z-20 cursor-pointer border border-white/20"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `${layout.left}%`,
                        width: `${layout.width}%`,
                        backgroundColor: event.color || "#0ea5e9", // Bleu par défaut
                      }}
                    >
                      <div className="font-bold truncate">{event.title}</div>
                      <div className="opacity-90 truncate text-[10px] mt-0.5">
                        {event.start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - 
                        {event.end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}