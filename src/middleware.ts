import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Exclut les routes d'auth, les assets statiques, etc.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};