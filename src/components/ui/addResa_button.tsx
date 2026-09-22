'use client';

import { useState } from "react";
import { newResa } from "../../app/actions_serveur/newResa";

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
  name: string;
};

interface BoutonAddResaProps {
  matosList?: Matos[]; // Passer la liste des matériels depuis le serveur ou le parent
}

export function BoutonAddResa({ matosList = [] }: BoutonAddResaProps) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");

  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("09:15");

  const [name, setName] = useState("");
  
  // 1. État pour suivre les équipements sélectionnés
  const [selectedMatosIds, setSelectedMatosIds] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false); // Permet de savoir si on clique sur le champ

  // 2. Déduction des listes (ceux déjà sélectionnés VS ceux qu'on peut chercher)
  const selectedMatos = matosList.filter((m) => selectedMatosIds.includes(m.id));
  const availableMatos = matosList.filter(
    (m) =>
      !selectedMatosIds.includes(m.id) &&
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      console.error("Erreur lors de la réservation :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="space-y-6"> 
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Nouvelle réservation
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Remplissez les détails ci-dessous pour enregistrer la réservation.
          </p>
        </div>

        <div className="space-y-4">
          {/* Intitulé */}
          <div className="space-y-1.5">
            <label 
              htmlFor="res-title" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Intitulé de la réservation
            </label>
            <input
              id="res-title"
              type="text"
              placeholder="ex: Tournage Papillon"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300"
            />
          </div>

          {/* Dates et Heures */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label 
                htmlFor="res-start-date" 
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Début
              </label>
              <input
                id="res-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:ring-slate-300"
              />
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:text-slate-100 dark:bg-slate-950"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={`start-${slot}`} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="res-end-date" 
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
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
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:ring-slate-300"
              />
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:text-slate-100 dark:bg-slate-950"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={`end-${slot}`} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Sélection du matériel avec champ de recherche */}
          <div className="space-y-1.5 pt-2 relative">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Matériel à réserver
            </label>
            
            {/* Affichage du matériel déjà sélectionné sous forme de tags */}
            {selectedMatos.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {selectedMatos.map((item) => (
                  <span 
                    key={item.id} 
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {item.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveMatos(item.id)}
                      className="text-slate-400 hover:text-red-500 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Champ de saisie pour la recherche */}
            <input
              type="text"
              placeholder="Rechercher du matériel (ex: Caméra...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              // Un léger délai sur le blur permet de cliquer sur un résultat avant qu'il ne disparaisse
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300"
            />

            {/* Liste déroulante des suggestions (visible seulement quand on cherche) */}
            {isFocused && searchQuery.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                {availableMatos.length > 0 ? (
                  availableMatos.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAddMatos(item.id)}
                      className="cursor-pointer rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      {item.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    Aucun résultat trouvé.
                  </div>
                )}
              </div>
            )}
          </div>
        </div> {/* <-- Il manquait la fermeture de la div globale "space-y-4" ici */}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {loading ? "Création en cours..." : "Créer la réservation"}
          </button>
        </div>

      </form>
    </div>
  );
}