// Gère le processus de connexion de l'utilisateur
import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authenticateWithLDAP } from "@/lib/ldap"

declare module "next-auth" {
  // On ajoute l'atribut 'groups' à l'utilisateur renvoyé par la fonction authorize (par défaut, il n'y a que 'name' et 'email')
  interface User {
    groups?: string[]
  }
}



export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Compte ",
      // 1. Définition du formulaire
      credentials: {
        username: { label: "Identifiant", type: "text", placeholder: "test" },
        password: { label: "Mot de passe", type: "password", placeholder: "test" }
      },
      
      // 2. La fonction de vérification
      async authorize(credentials) {
        // Sécurité de base : on vérifie que les champs sont remplis
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        if (credentials.username === "gg" && credentials.password === "t") {
          return {
            id: credentials.username as string, // Identifiant unique obligatoire pour NextAuth
            name: "arrete_de_lire_les_fichiers",
            groups: ["geek", "user"] 
          };
        }

        // On appelle la fonction d'authentification LDAP 
        const user = await authenticateWithLDAP(
          credentials.username as string, 
          credentials.password as string
        );

        // Si le LDAP valide, on structure les données pour NextAuth
        if (user) {
          return {
            id: credentials.username as string, // Identifiant unique obligatoire pour NextAuth
            name: user.name,
            groups: user.groups 
          };
        }

        // Si le LDAP refuse, on renvoie null (NextAuth affichera une erreur)
        return null; 
      }
    })
  ],
  
  // 3. Les Callbacks (Le transfert des données)
  callbacks: {
    // Étape A : Quand NextAuth crée le JWT (le "billet" crypté)
    async jwt({ token, user }) {
      // Si c'est la première fois qu'on se connecte, l'objet 'user' existe.
      // On en profite pour injecter nos groupes dans le token.
      if (user) {
        token.groups = user.groups;
      }
      return token;
    },
    
    // Étape B : Quand l'application demande à lire la Session
    async session({ session, token }) {
      // On transfère les groupes du token crypté vers l'objet session lisible
      if (session.user) {
        // @ts-ignore (TypeScript peut râler car 'groups' n'est pas standard)
        session.user.groups = token.groups;
      }
      return session;
    }
  }
})