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

## Organisation du code

- `src/app` contient les routes, les pages et les actions serveur Next.js.
- `src/components` regroupe les composants d'interface réutilisables.
- `src/db` rassemble la connexion Drizzle, le schéma et les migrations.
- `src/lib` contient les fonctions métier et utilitaires.
- `scripts` contient les scripts SQL ponctuels de migration de la base.

Les fichiers de configuration de Next.js, TypeScript et des outils associés restent à la racine, à l'emplacement attendu par ces outils.

