'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { categoryTable, matosTable } from "../../drizzle/schema";
import { asc, eq } from 'drizzle-orm';


// Fonction pour récupérer les réservations


export default async function Matos_tab() {
  const matos_list = await db.select({
    id: matosTable.id,
    name: matosTable.name,
    description: matosTable.description,
    categoryId: matosTable.categoryId,
    categoryName: categoryTable.name,
  })
    .from(matosTable)
    .leftJoin(categoryTable, eq(matosTable.categoryId, categoryTable.id))
    .orderBy(asc(categoryTable.name), asc(matosTable.name));

  const matosByCategory = new Map<
    number,
    { name: string; items: typeof matos_list }
  >();
  for (const matos of matos_list) {
    let category = matosByCategory.get(matos.categoryId);
    if (!category) {
      category = {
        name: matos.categoryName ?? `Catégorie ${matos.categoryId}`,
        items: [],
      };
      matosByCategory.set(matos.categoryId, category);
    }
    category.items.push(matos);
  }

  return (
    <div className="asso-panel container mx-auto overflow-hidden rounded-2xl border p-5 sm:p-6">
      <h1 className="mb-4 text-xl font-extrabold">Liste du matos</h1>
      {matosByCategory.size === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun matériel enregistré.</p>
      ) : (
        <div className="space-y-6">
          {[...matosByCategory.entries()].map(([categoryId, category]) => (
            <section key={categoryId} aria-labelledby={`category-${categoryId}`}>
              <h2
                id={`category-${categoryId}`}
                className="mb-3 border-b border-border/70 pb-2 text-lg font-bold"
              >
                {category.name}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((matos) => (
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
          ))}
        </div>
      )}
    </div>
  );
}