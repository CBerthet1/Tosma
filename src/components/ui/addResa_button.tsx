'use client';

import { useEffect, useRef, useState } from "react";
import { getAvailableMatosQuantities, newResa } from "../../app/actions_serveur/newResa";
import { CalendarDays, CalendarPlus2, Package, Search, X } from "lucide-react";
import type { Category } from "@/lib/categories";
import { getDateAfterMonths } from "@/lib/reservation-dates";
import { SuccessToast } from "@/components/ui/success-toast";

// Génère les créneaux horaires
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const h = String(hour).padStart(2, '0');
      const m = String(min).padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function getDaysInMonth(month: number, year?: number) {
  return new Date(year ?? 2000, month, 0).getDate();
}

function nextMonth(month: number) {
  return (month % 12) + 1;
}

function adjustStartMonth(day: number, month: number, year: number, now: Date) {
  const candidate = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return year === now.getFullYear() &&
    month === now.getMonth() + 1 &&
    candidate < today
    ? nextMonth(month)
    : month;
}

function adjustEndMonth(
  day: number,
  month: number,
  startDate: string,
  startTime: string,
  endTime: string,
  endYear: number,
) {
  if (!startDate) return month;
  const start = new Date(`${startDate}T${startTime}`);
  const candidateAtEndTime = new Date(`${toDateValue(endYear, month, day)}T${endTime}`);
  return endYear === start.getFullYear() && candidateAtEndTime <= start
    ? nextMonth(month)
    : month;
}

function toDateValue(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDateValue(day: number, month: number, year: number) {
  const candidate = new Date(year, month - 1, day);
  return candidate.getMonth() === month - 1 && candidate.getDate() === day
    ? toDateValue(year, month, day)
    : "";
}

function getNextStartYear(day: number, month: number, year: number, now: Date) {
  let candidateYear = year;
  let candidate = new Date(candidateYear, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (
    (candidate.getMonth() !== month - 1 ||
      candidate.getDate() !== day ||
      candidate < today) &&
    candidateYear < now.getFullYear() + 9
  ) {
    candidateYear += 1;
    candidate = new Date(candidateYear, month - 1, day);
  }

  return candidate.getMonth() === month - 1 &&
    candidate.getDate() === day &&
    candidate >= today
    ? candidateYear
    : null;
}

function getNextEndYear(
  day: number,
  month: number,
  year: number,
  startDate: string,
  startTime: string,
  endTime: string,
) {
  if (!startDate) return null;
  const start = new Date(`${startDate}T${startTime}`);
  let candidateYear = year;
  let candidate = new Date(candidateYear, month - 1, day);
  if (
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day ||
    new Date(`${toDateValue(candidateYear, month, day)}T${endTime}`) <= start
  ) {
    candidateYear += 1;
    candidate = new Date(candidateYear, month - 1, day);
  }

  const latestEnd = getDateAfterMonths(start, 11);

  return candidate.getMonth() === month - 1 &&
    candidate.getDate() === day &&
    new Date(`${toDateValue(candidateYear, month, day)}T${endTime}`) > start &&
    candidate <= latestEnd
    ? candidateYear
    : null;
}

// Type pour le matériel reçu en props
type Matos = {
  id: number;
  name: string | null;
  categorie: string;
};

interface BoutonAddResaProps {
  matosList?: Matos[]; // Passer la liste des matériels depuis le serveur ou le parent
  categories: readonly Category[];
}

export function BoutonAddResa({ matosList = [], categories }: BoutonAddResaProps) {
  const [initialDate] = useState(() => new Date());
  const [startDay, setStartDay] = useState(initialDate.getDate());
  const [startMonth, setStartMonth] = useState(initialDate.getMonth() + 1);
  const [startYear, setStartYear] = useState(initialDate.getFullYear());
  const [startTime, setStartTime] = useState(initialDate.getHours().toString().padStart(2, "0") + ":" + Math.floor(initialDate.getMinutes() / 15) * 15);

  const [endDay, setEndDay] = useState(initialDate.getDate());
  const [endMonth, setEndMonth] = useState(initialDate.getMonth() + 1);
  const [endYear, setEndYear] = useState(initialDate.getFullYear());
  const [endTime, setEndTime] = useState((initialDate.getHours()+1).toString().padStart(2, "0") + ":" + Math.floor(initialDate.getMinutes() / 15) * 15);
  const startDatePickerRef = useRef<HTMLInputElement>(null);
  const endDatePickerRef = useRef<HTMLInputElement>(null);
  const activeDatePickerRef = useRef<{
    input: HTMLInputElement;
    trigger: HTMLButtonElement;
  } | null>(null);

  const [name, setName] = useState("");
  
  // 1. État pour suivre les équipements sélectionnés
  const [selectedMatos, setSelectedMatos] = useState<Record<number, number>>({});
  const [availabilityResult, setAvailabilityResult] = useState<{
    key: string;
    quantities: Record<number, number>;
    error?: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false); // Permet de savoir si on clique sur le champ
  const [categorie, setCategorie] = useState("");
  const years = Array.from(
    { length: 10 },
    (_, index) => initialDate.getFullYear() + index,
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const activePicker = activeDatePickerRef.current;
      if (
        activePicker &&
        event.target instanceof Node &&
        !activePicker.trigger.contains(event.target)
      ) {
        activeDatePickerRef.current = null;
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") activeDatePickerRef.current = null;
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const startDate = getDateValue(startDay, startMonth, startYear);
  const endDate = getDateValue(endDay, endMonth, endYear);
  const start = startDate ? new Date(`${startDate}T${startTime}`) : null;
  const end = endDate ? new Date(`${endDate}T${endTime}`) : null;
  const latestEnd = start ? getDateAfterMonths(start, 11) : null;
  const isWithinElevenMonths = Boolean(
    start &&
      end &&
      latestEnd &&
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end <= latestEnd,
  );
  const hasValidDateRange = Boolean(
    start &&
      end &&
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      start < end &&
      isWithinElevenMonths,
  );
  const dateError =
    !startDate || !endDate || !start || !end ||
    Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
      ? "Veuillez sélectionner une date de début et une date de fin valides."
      : start >= end
        ? "La date et l'heure de fin doivent être postérieures à celles du début."
        : latestEnd && end > latestEnd
          ? "La réservation ne peut pas dépasser 11 mois."
          : "";
  const availabilityKey = `${startDate}T${startTime}/${endDate}T${endTime}`;
  const hasCurrentAvailability = availabilityResult?.key === availabilityKey;
  const availableQuantities =
    hasValidDateRange && hasCurrentAvailability ? availabilityResult?.quantities ?? {} : {};
  const checkingAvailability = hasValidDateRange && !hasCurrentAvailability;
  const availabilityError =
    hasCurrentAvailability ? availabilityResult?.error ?? "" : "";
  const selectedMatosIds = Object.keys(selectedMatos).map(Number);
  const hasInsufficientAvailability = selectedMatosIds.some(
    (id) => selectedMatos[id] > (availableQuantities[id] ?? 0),
  );

  useEffect(() => {
    if (!startDate || !endDate) return;
    const availabilityStart = new Date(`${startDate}T${startTime}`);
    const availabilityEnd = new Date(`${endDate}T${endTime}`);
    if (
      Number.isNaN(availabilityStart.getTime()) ||
      Number.isNaN(availabilityEnd.getTime()) ||
      availabilityStart >= availabilityEnd
    ) return;

    let cancelled = false;
    const key = `${startDate}T${startTime}/${endDate}T${endTime}`;

    getAvailableMatosQuantities(availabilityStart, availabilityEnd)
      .then((items) => {
        if (!cancelled) {
          setAvailabilityResult({
            key,
            quantities: Object.fromEntries(items.map((item) => [item.id, item.quantity])),
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAvailabilityResult({
            key,
            quantities: {},
            error:
              error instanceof Error
                ? error.message
                : "La disponibilité du matériel n'a pas pu être vérifiée.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, startTime, endDate, endTime]);

  // 2. Déduction des listes (ceux déjà sélectionnés VS ceux qu'on peut chercher)
  const selectedItems = matosList.filter((m) => selectedMatosIds.includes(m.id));
  const availableMatos = matosList.filter((m) => {
    const remaining = availableQuantities[m.id] ?? 0;
    return (
      remaining > 0 &&
      !selectedMatosIds.includes(m.id) &&
      (categorie === "" || m.categorie === categorie) &&
      (searchQuery.trim() === "" ||
        (m.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ?? false))
    );
  });

  // 3. Fonctions pour ajouter/retirer un tag
  const handleAddMatos = (id: number) => {
    setSelectedMatos((previous) => ({ ...previous, [id]: 1 }));
    setSearchQuery(""); // On vide la recherche après un ajout
  };

  const handleRemoveMatos = (id: number) => {
    setSelectedMatos((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  };

  const toggleDatePicker = (
    input: HTMLInputElement | null,
    trigger: HTMLButtonElement,
  ) => {
    if (!input) return;
    if (activeDatePickerRef.current?.input === input) {
      input.blur();
      activeDatePickerRef.current = null;
      return;
    }

    activeDatePickerRef.current?.input.blur();
    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
    activeDatePickerRef.current = { input, trigger };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage(null);

    try {
      // 2. Fusion exacte de la date et de l'heure
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const latestEnd = getDateAfterMonths(start, 11);
      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start >= end ||
        end > latestEnd
      ) {
        throw new Error("La réservation doit se terminer après son début et ne peut pas dépasser 11 mois.");
      }

      // 3. Appel de newResa avec la liste des matériels
      await newResa(
        start,
        end,
        name,
        selectedMatosIds.map((matosId) => ({ matosId, quantity: selectedMatos[matosId] })),
      );

      // Remise à zéro des champs
      setName("");
      const today = new Date();
      setStartDay(today.getDate());
      setStartMonth(today.getMonth() + 1);
      setStartYear(today.getFullYear());
      setEndDay(today.getDate());
      setEndMonth(today.getMonth() + 1);
      setEndYear(today.getFullYear());
      setSelectedMatos({});
      setSuccessMessage("Réservation enregistrée.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "La réservation n'a pas pu être créée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asso-panel h-full w-full rounded-2xl border p-5 sm:p-6">
      <form onSubmit={handleSubmit} className="asso-form flex h-full flex-col space-y-6">
        <div className="flex items-center gap-3 border-b pb-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarPlus2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Nouvelle réservation
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {/* Intitulé */}
          <div className="space-y-1.5">
            <label 
              htmlFor="res-title" 
              className="text-sm font-semibold"
            >
              Intitulé de la réservation
            </label>
            <input
              id="res-title"
              type="text"
              placeholder="ex: Tournage Papillon"
              value={name}
              maxLength={63}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>

          {/* Dates et Heures */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label 
                htmlFor="res-start-day-select"
                className="text-sm font-semibold"
              >
                Début
              </label>
              <div className="flex min-w-0 items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Ouvrir le calendrier pour la date de début"
                  onClick={(event) => toggleDatePicker(startDatePickerRef.current, event.currentTarget)}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <label className="sr-only" htmlFor="res-start-day-select">Jour de début</label>
                  <select
                    id="res-start-day-select"
                    aria-label="Jour de début"
                    value={startDay}
                    onChange={(event) => {
                      const day = Number(event.target.value);
                      const month = adjustStartMonth(
                        day,
                        startMonth,
                        startYear,
                        new Date(),
                      );
                      const year =
                        getNextStartYear(day, month, startYear, new Date()) ?? startYear;
                      setStartMonth(month);
                      setStartDay(Math.min(day, getDaysInMonth(month)));
                      setStartYear(year);
                      setEndYear((previous) => Math.max(year, Math.min(previous, year + 1)));
                    }}
                    className="w-[3.5rem] shrink-0 rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {Array.from({ length: getDaysInMonth(startMonth) }, (_, index) => index + 1).map((day) => (
                      <option key={day} value={day}>{String(day).padStart(2, "0")}</option>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor="res-start-month">Mois de début</label>
                  <select
                    id="res-start-month"
                    aria-label="Mois de début"
                    value={startMonth}
                    onChange={(event) => {
                      const selectedMonth = Number(event.target.value);
                      const month = adjustStartMonth(
                        startDay,
                        selectedMonth,
                        startYear,
                        new Date(),
                      );
                      const year =
                        getNextStartYear(startDay, month, startYear, new Date()) ?? startYear;
                      setStartMonth(month);
                      setStartDay((day) => Math.min(day, getDaysInMonth(month)));
                      setStartYear(year);
                      setEndYear((previous) => Math.max(year, Math.min(previous, year + 1)));
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor="res-start-year">Année de début</label>
                  <select
                    id="res-start-year"
                    aria-label="Année de début"
                    value={startYear}
                    onChange={(event) => {
                      const year = Number(event.target.value);
                      setStartYear(year);
                      setEndYear((previous) => Math.max(year, Math.min(previous, year + 1)));
                    }}
                    className="w-[4.5rem] shrink-0 rounded-lg border border-input bg-background px-1.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {years.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
                <input
                  ref={startDatePickerRef}
                  type="date"
                  aria-label="Date de début dans le calendrier"
                  value={startDate}
                  onChange={(event) => {
                    const [year, month, day] = event.target.value.split("-").map(Number);
                    if (year && month && day) {
                      setStartDay(day);
                      setStartMonth(month);
                      setStartYear(year);
                      setEndYear((previous) => Math.max(year, Math.min(previous, year + 1)));
                    }
                  }}
                  className="sr-only"
                />
              </div>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={`start-${slot}`} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="res-end-day-select"
                className="text-sm font-semibold"
              >
                Fin
              </label>
              <div className="flex min-w-0 items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Ouvrir le calendrier pour la date de fin"
                  onClick={(event) => toggleDatePicker(endDatePickerRef.current, event.currentTarget)}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <label className="sr-only" htmlFor="res-end-day-select">Jour de fin</label>
                  <select
                    id="res-end-day-select"
                    aria-label="Jour de fin"
                    value={endDay}
                    onChange={(event) => {
                      const day = Number(event.target.value);
                      const month = adjustEndMonth(day, endMonth, startDate, startTime, endTime, endYear);
                      const year = getNextEndYear(
                        day,
                        month,
                        endYear,
                        startDate,
                        startTime,
                        endTime,
                      );
                      setEndMonth(month);
                      setEndDay(Math.min(day, getDaysInMonth(month)));
                      if (year !== null) setEndYear(year);
                    }}
                    className="w-[3.5rem] shrink-0 rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {Array.from({ length: getDaysInMonth(endMonth) }, (_, index) => index + 1).map((day) => (
                      <option key={day} value={day}>{String(day).padStart(2, "0")}</option>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor="res-end-month">Mois de fin</label>
                  <select
                    id="res-end-month"
                    aria-label="Mois de fin"
                    value={endMonth}
                    onChange={(event) => {
                      const selectedMonth = Number(event.target.value);
                      const month = adjustEndMonth(
                        endDay,
                        selectedMonth,
                        startDate,
                        startTime,
                        endTime,
                        endYear,
                      );
                      const year = getNextEndYear(
                        endDay,
                        month,
                        endYear,
                        startDate,
                        startTime,
                        endTime,
                      );
                      setEndMonth(month);
                      setEndDay((day) => Math.min(day, getDaysInMonth(month)));
                      if (year !== null) setEndYear(year);
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor="res-end-year">Année de fin</label>
                  <select
                    id="res-end-year"
                    aria-label="Année de fin"
                    value={endYear}
                    onChange={(event) => setEndYear(Number(event.target.value))}
                    className="w-[4.5rem] shrink-0 rounded-lg border border-input bg-background px-1.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {[startYear, startYear + 1].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <input
                  ref={endDatePickerRef}
                  type="date"
                  aria-label="Date de fin dans le calendrier"
                  value={endDate}
                  min={startDate}
                  max={
                    latestEnd
                      ? toDateValue(
                          latestEnd.getFullYear(),
                          latestEnd.getMonth() + 1,
                          latestEnd.getDate(),
                        )
                      : undefined
                  }
                  onChange={(event) => {
                    const [year, month, day] = event.target.value.split("-").map(Number);
                    if (year && month && day) {
                      setEndDay(day);
                      setEndMonth(month);
                      setEndYear(year);
                    }
                  }}
                  className="sr-only"
                />
              </div>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={`end-${slot}`} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
          {dateError && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <p className="font-semibold">Dates invalides</p>
              <p>{dateError}</p>
            </div>
          )}

          {/* 4. Sélection du matériel avec champ de recherche */}
          <div
            className="relative space-y-2 pt-1"
            onBlur={(event) => {
              if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
                setIsFocused(false);
              }
            }}
          >
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Package className="size-4 text-primary" aria-hidden="true" />
              Matériel à réserver
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  placeholder={
                    hasValidDateRange
                      ? "Rechercher du matériel (ex: Caméra...)"
                      : "Choisissez vos dates pour rechercher du matériel"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  disabled={!hasValidDateRange}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 pl-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              </div>
              <select
                aria-label="Catégories"
                value={categorie}
                onChange={(e) => {
                  setCategorie(e.target.value);
                  setSearchQuery("");
                }}
                onFocus={() => setIsFocused(true)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:w-48"
              >
                <option value="">Catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Les catégories permettent d'afficher toute la liste correspondante sans terme de recherche. */}
            {isFocused && hasValidDateRange && (searchQuery.trim().length > 0 || categorie !== "") && (
              <div className="asso-options mt-1 max-h-48 w-full overflow-y-auto rounded-md border p-1 shadow-lg">
                {availableMatos.length > 0 ? (
                  availableMatos.map((item) => {
                    const isDisabled =
                      checkingAvailability ||
                      Boolean(availabilityError) ||
                      !hasValidDateRange;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleAddMatos(item.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          isDisabled
                            ? "cursor-not-allowed text-muted-foreground opacity-60"
                            : "cursor-pointer text-foreground hover:bg-primary/10"
                        }`}
                      >
                        {item.name ?? "Matériel sans nom"}
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                          {availableQuantities[item.id]} disponible(s)
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Aucun résultat trouvé.
                  </div>
                )}
              </div>
            )}
            {!hasValidDateRange && (
              <p className="text-xs text-muted-foreground">
                Choisissez une date de début et de fin valides pour rechercher du matériel.
              </p>
            )}
            {availabilityError && (
              <p role="alert" className="text-xs text-destructive">{availabilityError}</p>
            )}
          </div>
        </div> {/* <-- Il manquait la fermeture de la div globale "space-y-4" ici */}

        {/* Affichage du matériel déjà sélectionné sous forme de tags */}
            {selectedItems.length > 0 && (
              <div className="space-y-2 pb-2">
                {selectedItems.map((item) => {
                  const remaining = availableQuantities[item.id] ?? 0;
                  return (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2">
                      <span className="min-w-0 flex-1 break-words text-sm font-medium">
                        <span className={remaining > 0 ? "text-foreground" : "text-muted-foreground"}>
                          {item.name ?? "Matériel sans nom"}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {remaining} disponible(s)
                        </span>
                      </span>
                      <label className="flex shrink-0 items-center gap-2 text-xs font-medium">
                        Quantité
                        <input
                          aria-label={`Quantité de ${item.name ?? "ce matériel"}`}
                          type="number"
                          min={1}
                          max={remaining || 1}
                          value={selectedMatos[item.id]}
                          onChange={(event) => {
                            const quantity = Number(event.target.value);
                            setSelectedMatos((previous) => ({
                              ...previous,
                              [item.id]: quantity,
                            }));
                          }}
                          className="w-16 rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveMatos(item.id)}
                        aria-label={`Retirer ${item.name ?? "ce matériel"}`}
                        className="rounded-full text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {hasInsufficientAvailability && !checkingAvailability && (
              <p role="alert" className="text-xs text-destructive">
                La quantité choisie dépasse le stock disponible pour ce créneau.
              </p>
            )}

        {/* Actions */}
        {errorMessage && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}
        <div className="flex items-center justify-end gap-3 border-t border-border/70 pt-5">
          <button
            type="button"
            className="rounded-xl border border-input px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={
              loading ||
              !hasValidDateRange ||
              (selectedMatosIds.length > 0 &&
                (checkingAvailability || Boolean(availabilityError) || hasInsufficientAvailability))
            }
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Création en cours..." : "Créer la réservation"}
          </button>
        </div>

      </form>
      {successMessage && <SuccessToast message={successMessage} />}
    </div>
  );
}