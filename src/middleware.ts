//Intermédiaire entre le serveur et NextAuth pour gérer l'authentification (vérifie que l'utilisateur est bien connecté et que le token est valide avant de laisser accéder à une page)

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

//précise la config que doit prendre le middleware
export default NextAuth(authConfig).auth;

export const config = {
  // Exclut les routes d'auth, les assets statiques, etc.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};