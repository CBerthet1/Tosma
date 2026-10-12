'use client';

import { useEffect, useState } from "react";
import { getUnavailableMatosIds, newResa } from "../../app/actions_serveur/newResa";
import { CalendarPlus2, Package, Search, X } from "lucide-react";
import type { Category } from "@/lib/categories";

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
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");

  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("09:15");

  const [name, setName] = useState("");
  
  // 1. État pour suivre les équipements sélectionnés
  const [selectedMatosIds, setSelectedMatosIds] = useState<number[]>([]);
  const [availabilityResult, setAvailabilityResult] = useState<{
    key: string;
    unavailableIds: number[];
    error?: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false); // Permet de savoir si on clique sur le champ
  const [categorie, setCategorie] = useState("");

  const start = startDate ? new Date(`${startDate}T${startTime}`) : null;
  const end = endDate ? new Date(`${endDate}T${endTime}`) : null;
  const hasValidDateRange = Boolean(
    start &&
      end &&
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      start < end,
  );
  const availabilityKey = `${startDate}T${startTime}/${endDate}T${endTime}`;
  const hasCurrentAvailability = availabilityResult?.key === availabilityKey;
  const unavailableMatosIds =
    hasValidDateRange && hasCurrentAvailability ? availabilityResult?.unavailableIds ?? [] : [];
  const checkingAvailability = hasValidDateRange && !hasCurrentAvailability;
  const availabilityError =
    hasCurrentAvailability ? availabilityResult?.error ?? "" : "";
  const unavailableSelectedMatos = selectedMatosIds.some((id) => unavailableMatosIds.includes(id));

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

    getUnavailableMatosIds(availabilityStart, availabilityEnd)
      .then((ids) => {
        if (!cancelled) {
          setAvailabilityResult({ key, unavailableIds: ids });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAvailabilityResult({
            key,
            unavailableIds: [],
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
  const selectedMatos = matosList.filter((m) => selectedMatosIds.includes(m.id));
  const availableMatos = matosList.filter(
    (m) =>
      !selectedMatosIds.includes(m.id) &&
      (categorie === "" || m.categorie === categorie) &&
      (searchQuery.trim() === "" ||
        (m.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ?? false))
  );

  // 3. Fonctions pour ajouter/retirer un tag
  const handleAddMatos = (id: number) => {
    setSelectedMatosIds((prev) => [...prev, id]);
    setSearchQuery(""); // On vide la recherche après un ajout
  };

  const handleRemoveMatos = (id: number) => {
    setSelectedMatosIds((prev) => prev.filter((mId) => mId !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // 2. Fusion exacte de la date et de l'heure
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);

      // 3. Appel de newResa avec la liste des matériels
      await newResa(start, end, name, selectedMatosIds);

      // Remise à zéro des champs
      setName("");
      setStartDate("");
      setEndDate("");
      setSelectedMatosIds([]);
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
                htmlFor="res-start-date" 
                className="text-sm font-semibold"
              >
                Début
              </label>
              <input
                id="res-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
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
                htmlFor="res-end-date" 
                className="text-sm font-semibold"
              >
                Fin
              </label>
              <input
                id="res-end-date"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
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
                    const isUnavailable = unavailableMatosIds.includes(item.id);
                    const isDisabled =
                      isUnavailable ||
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
                        {isUnavailable ? (
                          <span className="ml-2 text-xs">(non disponible à cet horaire)</span>
                        ) : null}
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
            {checkingAvailability && (
              <p className="text-xs text-muted-foreground">Vérification de la disponibilité…</p>
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
            {selectedMatos.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {selectedMatos.map((item) => (
                  <span 
                    key={item.id} 
                    className={`asso-tag inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      unavailableMatosIds.includes(item.id) ? "text-muted-foreground opacity-60" : ""
                    }`}
                  >
                    {item.name}
                    {unavailableMatosIds.includes(item.id) && (
                      <span>(non disponible à cet horaire)</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMatos(item.id)}
                      aria-label={`Retirer ${item.name ?? "ce matériel"}`}
                      className="rounded-full text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
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
              (selectedMatosIds.length > 0 &&
                (checkingAvailability || Boolean(availabilityError) || unavailableSelectedMatos))
            }
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Création en cours..." : "Créer la réservation"}
          </button>
        </div>

      </form>
    </div>
  );
}