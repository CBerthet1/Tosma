import { handlers } from "@/auth"; 

// NextAuth gère automatiquement toutes les requêtes GET et POST
export const { GET, POST } = handlers;