import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Reservations_tab from "@/app/actions_serveur/Reservations_tab";
import Matos_tab from "./actions_serveur/matos_tab"; 
import { BoutonAddResa } from "@/components/ui/addResa_button";
import { BoutonAddMatos } from "@/components/ui/addMatos_button";

// On type les searchParams pour l'URL
type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

// Ne pas oublier "async" puisque searchParams est une Promise dans Next.js
export default async function Home({ searchParams }: PageProps) {
  // On récupère l'onglet actif (par défaut : resas)
  const { tab = "resas" } = await searchParams;

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full flex-col items-center py-16 px-8 bg-white dark:bg-black sm:items-start max-w-4xl mx-auto">
        
        {/* En-tête avec ton Logo Next.js */}
        <div className="mb-12 flex justify-between w-full items-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
            style={{ width: 'auto', height: 'auto' }} // Fix pour l'avertissement d'hydratation de l'image
          />
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        {/* --- SYSTÈME D'ONGLETS --- */}
        <div className="flex gap-4 border-b border-gray-200 mb-8 w-full">
          <Link
            href="/?tab=resas"
            className={`py-2 px-4 border-b-2 font-medium transition-colors ${
              tab === "resas"
                ? "border-black text-black dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Réservations
          </Link>
          <Link
            href="/?tab=matos"
            className={`py-2 px-4 border-b-2 font-medium transition-colors ${
              tab === "matos"
                ? "border-black text-black dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Matériel
          </Link>
        </div>

        {/* --- CONTENU DYNAMIQUE --- */}
        <div className="w-full">
          
          {/* ONGLET 1 : RÉSERVATIONS */}
          {tab === "resas" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold dark:text-white">Gestion des Réservations</h2>
                {/* On place le bouton d'ajout uniquement dans cet onglet */}
                <BoutonAddResa />
              </div>
              
              {/* On appelle le composant avec la syntaxe JSX */}
              <Reservations_tab />
            </div>
          )}

          {/* ONGLET 2 : MATÉRIEL */}
          {tab === "matos" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold dark:text-white">Inventaire du Matériel</h2>
                {/* On place le bouton d'ajout uniquement dans cet onglet */}
                <BoutonAddMatos />
              </div>

              {/* On appelle le composant avec la syntaxe JSX */}
              <Matos_tab />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}