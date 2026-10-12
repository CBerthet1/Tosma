This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Connexion à la base existante

La connexion MySQL utilise la variable d'environnement `DATABASE_URL`. Les catégories proposées par l'application sont définies en dur dans `src/lib/categories.ts` ; aucune table de catégories n'est nécessaire. La colonne `materiel.categorie` conserve la catégorie de chaque matériel.

Pour convertir une ancienne base, exécutez une seule fois `scripts/migrate-categories-to-text.sql`, puis `scripts/assign-equipment-categories.sql`. Les matériels non répertoriés dans le script de classement restent dans `Autre`.

Si la conversion vers la colonne texte est déjà faite, exécutez une seule fois `scripts/remove-category-tables.sql` sur la base existante. Ce script remplace les catégories `temp` par `Autre` et supprime les tables `category`, `categorie` et `categories` si elles existent.

Pour uniformiser la majuscule des catégories dans une base déjà utilisée, exécutez une seule fois `scripts/capitalize-categories.sql`. L'ordre d'affichage du matériel est défini dans le code : `Accessoire` apparaît avant-dernier et `Autre` en dernier.

Pour fusionner les réservations et leurs matériels, exécutez une seule fois `scripts/merge-resa-matos.sql` sur la base existante avant de déployer le code mis à jour. Le script conserve les réservations et leurs quantités dans la colonne JSON `resa.matos`, puis supprime `resa_matos`. Faites une sauvegarde de la base avant d'exécuter la migration.

Pour intégrer la table `image` à `materiel`, exécutez une seule fois `scripts/merge-image-into-materiel.sql` avant de déployer le code mis à jour. L'URL est transférée dans `materiel.image`; lorsqu'un matériel a plusieurs images, celle dont l'identifiant est le plus petit est conservée. Le script supprime ensuite la table `image`. Faites une sauvegarde de la base avant d'exécuter la migration.

Les migrations Drizzle historiques du projet décrivent un autre schéma. Ne les appliquez pas à cette base préexistante.
