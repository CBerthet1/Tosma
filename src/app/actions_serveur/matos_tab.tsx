'use server'; // Ce composant est côté serveur

import { db } from "../../drizzle/db";
import { matosTable } from "../../drizzle/schema";
import { asc } from 'drizzle-orm';
import { CATEGORIES } from "@/lib/categories";
import MatosInventory from "@/components/ui/matos_inventory";

// Fonction pour récupérer les réservations


export default async function Matos_tab({ isAdmin }: { isAdmin: boolean }) {
  const matos_list = await db.select({
    id: matosTable.id,
    name: matosTable.name,
    description: matosTable.description,
    categorie: matosTable.categorie,
    image: matosTable.image,
    available: matosTable.available,
    quantity: matosTable.quantity,
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
  const categorizedItems = matos_list.map((matos) => ({
    ...matos,
    displayCategory: CATEGORIES.find(
      (name) => name.toLocaleLowerCase("fr") === matos.categorie.trim().toLocaleLowerCase("fr"),
    ) ?? matos.categorie,
  }));

  return (
    <MatosInventory
      categories={categoryOrder}
      items={categorizedItems.map((matos) => ({
        ...matos,
        name: matos.name ?? "",
        description: matos.description ?? "",
        image: matos.image ?? "",
        available: Boolean(matos.available),
      }))}
      isAdmin={isAdmin}
    />
  );
}