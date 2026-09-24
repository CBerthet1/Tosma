'use client';
import {newMatos} from "../../app/actions_serveur/newMatos";




import { useState } from "react";

export function BoutonAddMatos() {
 
  const [name, setName] = useState("");
  const [categorie, setCategorie] = useState("");
  const [loading, setLoading] = useState(false); // gère l'état de chargement du bouton quand on soumet le formulaire


  const handleSubmit = async (e: React.FormEvent) => {e.preventDefault(); setLoading(true); // Empêche le rechargement de la page et active l'état de chargement
    try {
      

      // Envoi vers le serveur
      await newMatos( name, categorie);

      // Remise à zéro des champs
      setName("");
      setCategorie("");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="space-y-6"> 
        {/* En-tête du formulaire */}
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Rajouter du matos
          </h2>
        </div>

        <div className="space-y-4">

          {/* Intitulé de la réservation */}
          <div className="space-y-1.5">
            <label 
              htmlFor="res-title" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nom
            </label>
            <input
              id="res-title"
              type="text"
              placeholder="ex: A360"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300"
            />
            
          </div>
        </div>
        <div className="space-y-4">

          {/* Intitulé de la réservation */}
          <div className="space-y-1.5">
            <label 
              htmlFor="res-category" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Catégorie
            </label>
            <select
              id="res-category"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300 appearance-none"
            >
              <option value="" disabled>Sélectionnez une option</option>
              <option value="caméra">Caméra</option>
              <option value="objo">Objo</option>
              <option value="rej">Rej</option>
              <option value="light">Light</option>
            </select>
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
            {loading ? "Ajout en cours..." : "Ajouter "}
          </button>
        </div>

      </form>
    </div>
  );
}