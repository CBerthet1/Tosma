import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "../drizzle/db";
import Reservations_tab from "@/app/actions_serveur/Reservations_tab";
import Matos_tab from "./actions_serveur/matos_tab"; 
import { matosTable } from "../drizzle/schema";
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
  const allMatos = await db.select().from(matosTable);

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full flex-col items-center py-16 px-8 bg-white dark:bg-black sm:items-start max-w-4xl mx-auto">
        
        
        

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
            href="/?tab=Nouvelle-Réservation"
            className={`py-2 px-4 border-b-2 font-medium transition-colors ${
              tab === "Nouvelle-Réservation"
                ? "border-black text-black dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Nouvelle Réservation
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