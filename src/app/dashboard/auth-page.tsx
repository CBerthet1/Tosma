import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // On décrypte la session (le cookie)
  const session = await auth();

  // Si l'utilisateur n'est pas connecté, on le renvoie vers la page de connexion
  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Bienvenue, {session.user?.name} 👋</h1>
      
      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f3f4f6", borderRadius: "8px" }}>
        <h2>Vos informations LDAP :</h2>
        <p><strong>Identifiant :</strong> {session.user?.id}</p>
        
        <h3 style={{ marginTop: "1rem" }}>Vos groupes :</h3>
        {session.user?.groups && session.user.groups.length > 0 ? (
          <ul>
            {session.user.groups.map((group, index) => (
              <li key={index}>{group}</li>
            ))}
          </ul>
        ) : (
          <p>Vous n&apos;appartenez à aucun groupe.</p>
        )}
      </div>
    </div>
  );
}