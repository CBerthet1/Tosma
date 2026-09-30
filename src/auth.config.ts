import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // les providers lourds restent dans lib/auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        // Déjà connecté : on renvoie vers le dashboard
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      // false => Auth.js redirige automatiquement vers pages.signIn
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;