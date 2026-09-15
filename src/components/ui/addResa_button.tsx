'use client';
import {newResa} from "../../app/actions_serveur/newResa";

// permet de générer des créneaux horaires de 15 minutes pour la sélection de l'heure 
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




import { useState } from "react";

export function BoutonAddResa() {
  const [startDate, setStartDate] = useState("");  //date sans heure
  const [startTime, setStartTime] = useState("09:00"); //heure sans date

  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("09:15");

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false); // gère l'état de chargement du bouton quand on soumet le formulaire

  const start = new Date(`${startDate}T${startTime}`); // fusion de la date et de l'heure pour créer un objet Date
  const end = new Date(`${endDate}T${endTime}`);
  
  const handleSubmit = async (e: React.FormEvent) => {e.preventDefault(); setLoading(true); // Empêche le rechargement de la page et active l'état de chargement
    try {
      // Conversion des dates en objets Date
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Envoi vers le serveur via la fonction newResa
      await newResa(start, end, name);

      // Remise à zéro des champs
      setName("");
      setStartDate("");
      setEndDate("");
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
                min={startDate} // Empêche de choisir une date antérieure au début
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
        </div>

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