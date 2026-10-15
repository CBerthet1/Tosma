FROM node:22-alpine

# 1. Activation de Corepack pour gérer pnpm
RUN npm install -g pnpm@9

# 2. Définition du répertoire de travail dans le conteneur
WORKDIR /app

# 3. Copie des fichiers de configuration des dépendances
COPY package.json pnpm-lock.yaml ./

# 4. Installation stricte des dépendances
RUN pnpm install --frozen-lockfile

# 5. Copie du reste du code source
COPY . .

# 6. Compilation de l'application Next.js
RUN pnpm run build

# 7. Information sur le port d'écoute
EXPOSE 3000

# 8. Commande d'exécution au démarrage du conteneur
CMD ["pnpm", "start"]