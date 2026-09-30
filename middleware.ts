export { auth as middleware } from "@/lib/auth"

export const config = {
  // Le middleware bloquera toutes les URL qui commencent par /dashboard
  matcher: ["/dashboard/:path*"], 
}