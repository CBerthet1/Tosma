import Link from "next/link";
import { auth } from "@/auth";
import { db } from "../drizzle/db";
import Reservations_tab from "@/app/actions_serveur/Reservations_tab";
import MesReservations_tab from "@/app/actions_serveur/MesReservations_tab";
import Matos_tab from "./actions_serveur/matos_tab"; 
import { logout } from "@/app/actions_serveur/logout";
import { matosTable } from "../drizzle/schema";
import { CATEGORIES } from "@/lib/categories";
import { BoutonAddResa } from "@/components/ui/addResa_button";
import { BoutonAddMatos } from "@/components/ui/addMatos_button";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/switch-theme";
import { FieldLabel } from "@/components/ui/field";
import Image from "next/image";
import { LogOut } from "lucide-react";

// On type les searchParams pour l'URL
type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

// Ne pas oublier "async" puisque searchParams est une Promise dans Next.js
export default async function Home({ searchParams }: PageProps) {
  const [{ tab = "resas" }, session] = await Promise.all([
    searchParams,
    auth(),
  ]);

  const isAdmin = Boolean(session?.user?.groups?.includes("geek"));
  const showReservations =
    tab === "reservations" ||
    tab === "Nouvelle-Réservation" ||
    tab === "mes-reservations";
  const allMatos = showReservations
    ? await db.select({
        id: matosTable.id,
        name: matosTable.name,
        categorie: matosTable.categorie,
      }).from(matosTable)
    : [];

  return (
    <div className="flex flex-col flex-1 min-h-screen font-sans bg-background text-foreground">
      <header className="w-full border-b border-border/80 bg-card/75 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-5 py-3 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3 lg:justify-self-start">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 shadow-sm">
              <Image
                src="/logo_Hyris.png"
                alt="Logo Hyris"
                width={44}
                height={48}
                unoptimized
                className="h-11 w-10 object-contain"
              />
            </span>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">Tosma</h1>
            </div>
          </div>

          <nav className={`grid w-full max-w-xl gap-1 rounded-2xl border border-border/70 bg-secondary/75 p-1 text-center lg:w-auto ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
            <Link
              href="/?tab=resas"
              className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                tab === "resas"
                  ? "bg-primary/12 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              Planning
            </Link>
            <Link
              href="/?tab=reservations"
              className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                tab === "reservations" || tab === "Nouvelle-Réservation" || tab === "mes-reservations"
                  ? "bg-primary/12 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              Réservations
            </Link>
            {isAdmin && (
            <Link
              href="/?tab=matos"
              className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                tab === "matos"
                  ? "bg-primary/12 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              Le matos
            </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 lg:justify-self-end">
            <FieldLabel htmlFor="switch-focus-mode" className="text-sm font-medium text-muted-foreground">
              Mode nuit
            </FieldLabel>
            <ThemeToggle />
            <form action={logout}>
              <Button type="submit" variant="outline" className="gap-2">
                <LogOut aria-hidden="true" />
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex w-full min-w-0 flex-1 flex-col items-start px-4 py-8 sm:px-6 lg:px-8 sm:py-3">
        <div className="w-full min-w-0">
          {/* ONGLET 1 : RÉSERVATIONS */}
          {tab === "resas" && (
            <div className="flex w-full min-w-0 flex-col gap-6">
              <Reservations_tab />
            </div>
          )}

          {/* ONGLET 2 : MATÉRIEL */}
          {tab === "matos" && isAdmin && (
            <div className="flex flex-col gap-6 w-full">
              <BoutonAddMatos categories={CATEGORIES} />
              <Matos_tab />
            </div>
          )}

          {/* ONGLET : CRÉER ET MODIFIER LES RÉSERVATIONS */}
          {showReservations && (
            <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2">
              <BoutonAddResa matosList={allMatos} categories={CATEGORIES} />
              <MesReservations_tab matosList={allMatos} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}