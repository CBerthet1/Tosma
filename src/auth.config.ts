//gère la config de l'auth (séparation intérmédiaire et auth du ldap pour des questions de réactivité)
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // les providers lourds restent dans auth.ts
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        // Déjà connecté : on renvoie vers la page d'accueil
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // false => Auth.js redirige automatiquement vers pages.signIn
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;