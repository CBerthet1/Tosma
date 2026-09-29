import { handlers } from "@/lib/auth"; 

// NextAuth gère automatiquement toutes les requêtes GET et POST
export const { GET, POST } = handlers;