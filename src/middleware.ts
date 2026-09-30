//Intermédiaire entre le serveur et NextAuth pour gérer l'authentification (vérifie que l'utilisateur est bien connecté et que le token est valide avant de laisser accéder à une page)

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

//empêche l'accès à la page matos
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  
  if (nextUrl.searchParams.get("tab") === "matos") {
    
    // On extrait les groupes LDAP de la session et on vérifie si l'utilisateur a le groupe requis
    const geek = session?.user?.groups?.includes("geek") 
    
    // 2. Si l'utilisateur n'a pas le groupe requis (ou n'est pas connecté)
    if (!geek) {
      // Option A : Redirection vers un rickroll
      return NextResponse.redirect(new URL("https://www.youtube.com/watch?v=DLzxrzFCyOs&list=RDDLzxrzFCyOs&start_radio=1", req.url));

    }
  }
  // 3. L'utilisateur a le groupe requis (ou ne demande pas cet onglet)
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};