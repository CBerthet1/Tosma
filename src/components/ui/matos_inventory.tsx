'use client';

import { useEffect, useState } from "react";
import { updateMatos } from "@/app/actions_serveur/updateMatos";

type Material = {
  id: number;
  name: string;
  description: string;
  categorie: string;
  displayCategory: string;
  image: string;
  available: boolean;
  quantity: number;
};

type MaterialValues = Omit<Material, "id" | "displayCategory">;

const inputClassName =
  "w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:focus:ring-slate-300";

export default function MatosInventory({
  categories,
  items,
  isAdmin,
}: {
  categories: readonly string[];
  items: Material[];
  isAdmin: boolean;
}) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [values, setValues] = useState<MaterialValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!selectedMaterial) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedMaterial]);

  const openEditor = (material: Material) => {
    setSelectedMaterial(material);
    setValues({
      name: material.name,
      description: material.description,
      categorie: material.categorie,
      image: material.image,
      available: material.available,
      quantity: material.quantity,
    });
    setError("");
    setSuccess("");
  };

  const closeEditor = () => {
    if (loading) return;
    setSelectedMaterial(null);
    setValues(null);
    setError("");
    setSuccess("");
  };

  const setField = <K extends keyof MaterialValues>(
    field: K,
    value: MaterialValues[K],
  ) => {
    setValues((current) => current ? { ...current, [field]: value } : current);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMaterial || !values) return;

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateMatos(selectedMaterial.id, values);
      setSuccess("Les modifications ont été enregistrées.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue lors de la modification.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asso-panel container mx-auto overflow-hidden rounded-2xl border p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-extrabold">Liste du matos</h1>
        {isAdmin && (
          <p className="text-sm text-muted-foreground">
            Sélectionnez un matériel pour modifier sa fiche.
          </p>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun matériel enregistré.</p>
      ) : (
        <div className="space-y-6">
          {categories.map((categorie) => {
            const categoryItems = items.filter((item) => item.displayCategory === categorie);
            if (categoryItems.length === 0) return null;
            return (
              <section key={categorie} aria-labelledby={`category-${categorie}`}>
                <h2
                  id={`category-${categorie}`}
                  className="mb-3 border-b border-border/70 pb-2 text-lg font-bold"
                >
                  {categorie}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {categoryItems.map((material) => (
                    <li key={material.id}>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => openEditor(material)}
                          className="w-full rounded-xl border border-border/70 bg-background/70 p-4 text-left transition-colors hover:border-primary/50 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Modifier ${material.name || "ce matériel"}`}
                        >
                          <MaterialSummary material={material} />
                        </button>
                      ) : (
                        <article className="rounded-xl border border-border/70 bg-background/70 p-4">
                          <MaterialSummary material={material} />
                        </article>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {selectedMaterial && values && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fermer la modification du matériel"
            onClick={closeEditor}
            disabled={loading}
            className="absolute inset-0 size-full cursor-default bg-black/35"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-material-title"
            className="asso-panel absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto overscroll-contain border-l p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-border/70 pb-5">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Modifier la fiche
                </p>
                <h2 id="edit-material-title" className="text-xl font-extrabold">
                  {selectedMaterial.name || "Matériel sans nom"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                disabled={loading}
                aria-label="Fermer"
                className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
              <div className="space-y-1.5">
                <label htmlFor="edit-material-name" className="text-sm font-medium">Nom</label>
                <input
                  id="edit-material-name"
                  value={values.name}
                  maxLength={255}
                  onChange={(event) => setField("name", event.target.value)}
                  required
                  className={inputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-material-category" className="text-sm font-medium">Catégorie</label>
                <select
                  id="edit-material-category"
                  value={values.categorie}
                  onChange={(event) => setField("categorie", event.target.value)}
                  required
                  className={inputClassName}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-material-description" className="text-sm font-medium">Description</label>
                <textarea
                  id="edit-material-description"
                  value={values.description}
                  onChange={(event) => setField("description", event.target.value)}
                  rows={5}
                  className={inputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-material-image" className="text-sm font-medium">Image (URL)</label>
                <input
                  id="edit-material-image"
                  type="url"
                  value={values.image}
                  maxLength={255}
                  onChange={(event) => setField("image", event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-material-quantity" className="text-sm font-medium">Quantité</label>
                <input
                  id="edit-material-quantity"
                  type="number"
                  min={1}
                  step={1}
                  value={values.quantity}
                  onChange={(event) => setField("quantity", Number(event.target.value))}
                  required
                  className={inputClassName}
                />
              </div>

              <label className="flex items-center gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={values.available}
                  onChange={(event) => setField("available", event.target.checked)}
                  className="size-4 accent-slate-900"
                />
                Matériel disponible pour réservation
              </label>

              {(error || success) && (
                <p
                  role={error ? "alert" : "status"}
                  className={`text-sm ${error ? "text-destructive" : "text-green-700 dark:text-green-400"}`}
                >
                  {error || success}
                </p>
              )}

              <div className="mt-auto flex justify-end gap-3 border-t border-border/70 pt-5">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={loading}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

function MaterialSummary({ material }: { material: Material }) {
  return (
    <>
      <h3 className="font-semibold">{material.name || "Matériel sans nom"}</h3>
      <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
        {material.description.trim() || "Aucune description disponible."}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Quantité : {material.quantity} · {material.available ? "Disponible" : "Indisponible"}
      </p>
    </>
  );
}
