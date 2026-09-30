import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// On initialise NextAuth uniquement avec la config légère
const { auth } = NextAuth(authConfig)

export const middleware = auth

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}