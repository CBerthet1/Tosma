'use client';

import { useState } from "react";
import { newMatos } from "@/app/actions_serveur/newMatos";
import type { Category } from "@/lib/categories";

const initialValues = {
  name: "",
  categorie: "",
  description: "",
  image: "",
  quantity: "1",
  available: true,
};

export function BoutonAddMatos({ categories }: { categories: readonly Category[] }) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await newMatos({
        ...values,
        quantity: Number(values.quantity),
      });
      setValues(initialValues);
      setSuccess("Le matériel a été ajouté.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue lors de l'ajout du matériel.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateValue = <K extends keyof typeof initialValues>(
    field: K,
    value: (typeof initialValues)[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="asso-panel w-full rounded-2xl border p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="asso-form space-y-6">
        <div className="border-b border-border/70 pb-4">
          <h2 className="text-xl font-semibold">Ajouter du matériel</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Renseignez les informations du matériel à ajouter à la liste.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="matos-name" className="text-sm font-medium">
              Nom
            </label>
            <input
              id="matos-name"
              type="text"
              placeholder="Ex. : A360"
              value={values.name}
              maxLength={255}
              onChange={(event) => updateValue("name", event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="matos-category" className="text-sm font-medium">
              Catégorie
            </label>
            <select
              id="matos-category"
              value={values.categorie}
              onChange={(event) => updateValue("categorie", event.target.value)}
              required
              className="w-full appearance-none rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300"
            >
              <option value="" disabled>Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="matos-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="matos-description"
              value={values.description}
              onChange={(event) => updateValue("description", event.target.value)}
              rows={4}
              placeholder="Décrivez le matériel, son état ou toute information utile."
              className="w-full resize-y rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="matos-image" className="text-sm font-medium">
              Image (URL)
            </label>
            <input
              id="matos-image"
              type="url"
              value={values.image}
              maxLength={255}
              onChange={(event) => updateValue("image", event.target.value)}
              placeholder="https://…"
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="matos-quantity" className="text-sm font-medium">
              Quantité
            </label>
            <input
              id="matos-quantity"
              type="number"
              min={1}
              step={1}
              value={values.quantity}
              onChange={(event) => updateValue("quantity", event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300"
            />
          </div>

          <label className="flex items-center gap-3 self-end rounded-md border border-border/70 px-3 py-2.5 text-sm font-medium">
            <input
              type="checkbox"
              checked={values.available}
              onChange={(event) => updateValue("available", event.target.checked)}
              className="size-4 accent-slate-900"
            />
            Matériel disponible pour réservation
          </label>
        </div>

        {(error || success) && (
          <p role={error ? "alert" : "status"} className={`text-sm ${error ? "text-destructive" : "text-green-700 dark:text-green-400"}`}>
            {error || success}
          </p>
        )}

        <div className="flex justify-end border-t border-border/70 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {loading ? "Ajout en cours..." : "Ajouter le matériel"}
          </button>
        </div>
      </form>
    </section>
  );
}
