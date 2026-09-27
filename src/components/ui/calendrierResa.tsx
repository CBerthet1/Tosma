"use client";

import React, { useMemo, useState } from "react";

// --- TYPES ---
export type Reservation = {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
};

type WeeklyCalendarProps = {
  reservations: Reservation[];
};

// --- PARAMÈTRES D'AFFICHAGE ---
const START_HOUR = 0;
const END_HOUR = 23;
const PIXELS_PER_MINUTE = 1.2;

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
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const columns: Reservation[][] = [];

  sorted.forEach((event) => {
    let placed = false;
    for (let col of columns) {
      const lastEvent = col[col.length - 1];
      if (lastEvent.end <= event.start) {
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

export default function WeeklyCalendar({ reservations }: WeeklyCalendarProps) {
  // Lundi de la semaine affichée
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));

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

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => START_HOUR + i);

  const getEventsForDay = (dayDate: Date) => {
    // Début et fin de la journée ciblée
    const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
    const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);

    return reservations.filter((r) => {
      // L'événement doit commencer avant la fin du jour ET se terminer après le début du jour
      const rs = new Date(r.start);
      const re = new Date(r.end);
      console.log("Semaine affichée :",r);
      return rs <= dayEnd && re >= dayStart;
    }
      );// Ajoute ceci juste avant le "return ("
  
  
  };

  // Libellé du mois / année affiché en haut
  const monthLabel = currentWeekStart.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
      
      {/* BARRE DE NAVIGATION ET TITRE */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousWeek}
            className="p-1.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Semaine précédente"
          >
            ←
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-medium rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Semaine suivante"
          >
            →
          </button>
        </div>

        <span className="text-sm font-semibold capitalize text-gray-800 dark:text-gray-200">
          {monthLabel}
        </span>
      </div>

      {/* EN-TÊTE DES JOURS */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <div className="w-16 flex-shrink-0 bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-800" />
        {days.map((day, i) => (
          <div key={i} className="flex-1 text-center py-2 border-r border-gray-200 dark:border-gray-800 last:border-0 bg-gray-50 dark:bg-zinc-900">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              {day.toLocaleDateString("fr-FR", { weekday: "short" })}
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* CORPS : GRILLE DES HEURES ET ÉVÉNEMENTS */}
      <div className="flex flex-1 overflow-y-auto relative">
        <div className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 relative bg-white dark:bg-black z-10">
          {hours.map((hour, i) => (
            <div
              key={i}
              className="text-xs text-gray-400 text-right pr-2 absolute w-full"
              style={{ top: i * 60 * PIXELS_PER_MINUTE - 8 }}
            >
              {hour}h00
            </div>
          ))}
        </div>

        <div className="flex flex-1 relative bg-white dark:bg-black">
          <div className="absolute inset-0 pointer-events-none">
            {hours.map((_, i) => (
              <div
                key={i}
                className="w-full border-b border-gray-100 dark:border-gray-800/50 absolute"
                style={{ top: i * 60 * PIXELS_PER_MINUTE }}
              />
            ))}
          </div>

          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const positions = calculateLayout(dayEvents);
         

            return (
              <div key={dayIndex} className="flex-1 relative border-r border-gray-200 dark:border-gray-800 last:border-0">
                {dayEvents.map((event) => {
                  const layout = positions[event.id] || { width: 100, left: 0 };
                  
                  // 1. Définir les limites de la journée en cours
                  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
                  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

                  // 2. Clamper l'heure de début et de fin pour l'affichage dans CETTE colonne
                  // Si ça a commencé un jour précédent, on force l'affichage à 0h00
                  const visualStart = event.start < dayStart 
                    ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), START_HOUR, 0, 0) 
                    : event.start;
                    
                  // Si ça se termine un jour suivant, on force l'affichage à 24h00
                  const visualEnd = event.end > dayEnd 
                    ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), END_HOUR, 0, 0) 
                    : event.end;

                  // 3. Calculs de positionnement 
                  const startMins = visualStart.getHours() * 60 + visualStart.getMinutes();
                  let offsetMins = startMins - START_HOUR * 60;
                  if (offsetMins < 0) offsetMins = 0; // Sécurité si l'event commence avant START_HOUR

                  const durationMins = (visualEnd.getTime() - visualStart.getTime()) / 60000;
                  const top = offsetMins * PIXELS_PER_MINUTE;
                  // On donne une hauteur minimale pour que l'event reste cliquable même s'il est très court
                  const height = Math.max(durationMins * PIXELS_PER_MINUTE, 15); 

                  return (
                    <div
                      key={event.id}
                      className="absolute rounded-md p-1.5 text-xs text-white overflow-hidden shadow-sm transition-transform hover:scale-[1.02] hover:z-20 cursor-pointer border border-white/20"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `${layout.left}%`,
                        width: `${layout.width}%`,
                        
                      }}
                    >
                      <div className="font-bold truncate">{event.title}</div>
                      <div className="opacity-90 truncate text-[10px] mt-0.5">
                        {/* On affiche les vraies dates sur l'étiquette, pas les dates coupées */}
                        {event.start.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} à {event.start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        <br/>
                        {event.end.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} à {event.end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
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