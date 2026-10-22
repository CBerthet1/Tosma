This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

``` bash
docker compose build

docker compose up -d 

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Organisation du code

- `src/app` contient les routes, les pages et les actions serveur Next.js.
- `src/components` regroupe les composants d'interface réutilisables.
- `src/db` rassemble la connexion Drizzle, le schéma et les migrations.
- `src/lib` contient les fonctions métier et utilitaires.

Les fichiers de configuration de Next.js, TypeScript et des outils associés restent à la racine, à l'emplacement attendu par ces outils.

## En local, attention c'est lancé sur le port 8084 donc localhost:8084 , et il faut migrate :

``` bash
docker compose build 

docker compose up -d

``` 
Attendre 3s pour que la db se lance
``` bash
docker exec -it tosma2-tosma_app_v2-1 pnpm drizzle-kit migrate

docker compose down

docker compose run --rm -e WATCHPACK_POLLING=true -v .:/app -v /app/node_modules --service-ports tosma_app_v2 pnpm dev

```
Ouvrir localhost:8084 sur le navigateur

Compte tests:
admin: nom:"gg" mdp:"t"
user:  nom:"gt" mdp:"t"