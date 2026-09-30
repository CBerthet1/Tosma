import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Vide ici pour l'Edge runtime !
} satisfies NextAuthConfig