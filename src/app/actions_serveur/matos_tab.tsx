'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { matosTable } from "../../drizzle/schema";
import { asc } from 'drizzle-orm';
import { CATEGORIES } from "@/lib/categories";


// Fonction pour récupérer les réservations


export default async function Matos_tab() {
  const matos_list = await db.select({
    id: matosTable.id,
    name: matosTable.name,
    description: matosTable.description,
    categorie: matosTable.categorie,
  })
    .from(matosTable)
    .orderBy(asc(matosTable.name));

  const matosByCategory = new Map<
    string,
    typeof matos_list
  >();
  for (const matos of matos_list) {
    const category = CATEGORIES.find(
      (name) => name.toLocaleLowerCase("fr") === matos.categorie.trim().toLocaleLowerCase("fr"),
    ) ?? matos.categorie;
    const categoryItems = matosByCategory.get(category) ?? [];
    categoryItems.push(matos);
    matosByCategory.set(category, categoryItems);
  }
  const categoryOrder = [
    ...CATEGORIES.slice(0, -2),
    ...[...matosByCategory.keys()].filter(
      (category) => !CATEGORIES.some((knownCategory) => knownCategory === category),
    ),
    ...CATEGORIES.slice(-2),
  ];

  return (
    <div className="asso-panel container mx-auto overflow-hidden rounded-2xl border p-5 sm:p-6">
      <h1 className="mb-4 text-xl font-extrabold">Liste du matos</h1>
      {matosByCategory.size === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun matériel enregistré.</p>
      ) : (
        <div className="space-y-6">
          {categoryOrder.map((categorie) => {
            const items = matosByCategory.get(categorie);
            if (!items) return null;
            return (
              <section key={categorie} aria-labelledby={`category-${categorie}`}>
                <h2
                  id={`category-${categorie}`}
                  className="mb-3 border-b border-border/70 pb-2 text-lg font-bold"
                >
                  {categorie}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((matos) => (
                    <li
                      key={matos.id}
                      className="rounded-xl border border-border/70 bg-background/70 p-4"
                    >
                      <h3 className="font-semibold">
                        {matos.name ?? "Matériel sans nom"}
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                        {matos.description?.trim() || "Aucune description disponible."}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}