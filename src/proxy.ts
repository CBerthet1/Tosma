//Intermédiaire entre le serveur et NextAuth pour gérer l'authentification (vérifie que l'utilisateur est bien connecté et que le token est valide avant de laisser accéder à une page)

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";




export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};