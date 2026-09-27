import Link from "next/link";
import { db } from "../drizzle/db";
import Reservations_tab from "@/app/actions_serveur/Reservations_tab";
import Matos_tab from "./actions_serveur/matos_tab"; 
import { matosTable } from "../drizzle/schema";
import { BoutonAddResa } from "@/components/ui/addResa_button";
import { BoutonAddMatos } from "@/components/ui/addMatos_button";
import { ThemeToggle } from "@/components/ui/switch-theme";
import { FieldLabel } from "@/components/ui/field";

// On type les searchParams pour l'URL
type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

// Ne pas oublier "async" puisque searchParams est une Promise dans Next.js
export default async function Home({ searchParams }: PageProps) {
  // On récupère l'onglet actif (par défaut : resas)
  const { tab = "resas" } = await searchParams;
  const allMatos = await db.select().from(matosTable);

  return (
    <div className="flex flex-col flex-1 min-h-screen font-sans bg-white dark:bg-black">
      
      {/* --- HEADER (anciennement dans le layout) --- */}
      <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-zinc-100 dark:bg-zinc-900/50">
        <div className="max-w-8xl mx-auto px-6 py-4 grid grid-cols-3 items-center gap-4">
          
          {/* COLONNE 1 : LOGO / TITRE (A gauche) */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tosma
            </h1>
          </div>

          {/* COLONNE 2 : LES ONGLETS (Au centre, répartis sur 3 sous-colonnes) */}
          <nav className="grid grid-cols-3 gap-2 bg-zinc-200/60 dark:bg-zinc-800/60 p-1 rounded-xl text-center">
            <Link
              href="/?tab=resas"
              className={`py-1.5 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                tab === "resas"
                  ? "bg-white text-black shadow dark:bg-zinc-700 dark:text-white"
                  : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Planning
            </Link>

            <Link
              href="/?tab=Nouvelle-Réservation"
              className={`py-1.5 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                tab === "Nouvelle-Réservation"
                  ? "bg-white text-black shadow dark:bg-zinc-700 dark:text-white"
                  : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Créer Réservation
            </Link>

            <Link
              href="/?tab=matos"
              className={`py-1.5 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                tab === "matos"
                  ? "bg-white text-black shadow dark:bg-zinc-700 dark:text-white"
                  : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Matériel
            </Link>
          </nav>

          {/* COLONNE 3 : MODE SOMBRE (À droite) */}
          <div className="flex justify-end items-center gap-3">
            <FieldLabel htmlFor="switch-focus-mode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mode sombre
            </FieldLabel>
            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* --- CONTENU DYNAMIQUE --- */}
      <main className="flex flex-1 w-full flex-col items-start p-8 mx-auto container">
        <div className="w-full">
          
          {/* ONGLET 1 : RÉSERVATIONS */}
          {tab === "resas" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">  
              <Reservations_tab />
            </div>
          )}

          {/* ONGLET 2 : MATÉRIEL */}
          {tab === "matos" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
              <BoutonAddMatos />
              <Matos_tab />
            </div>
          )}

          {/* ONGLET 3 : Rajouter Resa */}
          {tab === "Nouvelle-Réservation" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
              <BoutonAddResa matosList={allMatos} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}