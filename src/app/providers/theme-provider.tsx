//ce fichier permet de d'avoir un thème sous forme d'état (constante qui reste et peut être modifiée)

'use client'; // ← Ce composant EST côté client

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark'; //défini le type (ici les valeurs possibles) de Theme (Mettre les deux valeurs possibles permet de voir immédiatement si on a par exemple fait une faute de frappe en attribuant une valeur au thème) 

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);  // crée un contexte pour le thème avec un type défini, initialisé à null. Cela permet de partager l'état du thème et la fonction de basculement entre les composants de l'application.

//fonction qui décide quel thème appliquer, l'appliqe et met à disposition de tous les composant les variable de thème (sert au bouton par exemple)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light'); //permet de définir l'état initial du thème sur 'light' et de fournir une fonction pour le mettre à jour. Le type Theme est utilisé pour garantir que seules les valeurs 'light' ou 'dark' peuvent être attribuées à l'état du thème. Cet état reste même si la page est rechargée ce qui est utile pour faire un thème qui ne disparait pas en rechargeant la page

  // fonction gère le thème initial
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null; {/* regarde dans les cookies du navigateur s'il y a une variable Theme, sinon la met à null */}
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; //regarde les préférences du navigateur en terme de thème (sombre ou non)
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light'); {/* Privilégie le thème sauvegardé, sinon le thème du navigateur sinon le thème light par défaut */}
    setTheme(initialTheme); {/* Met la valeur par défaut de theme à initialTheme */}
    
    {/* Appliquer la classe au document HTML (permet d'avoir la classe dark pour tout le doc) */}
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);
  //fonction gère le changement de thème
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'; // Le nouveau thème est 'dark' si c'était light et light sinon
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); {/* crée un fichier persistant dans le navigateur qui stocke des informations afin d'avoir un variable thème par défaut */}
    document.documentElement.classList.toggle('dark', newTheme === 'dark'); {/* ajoute ou enlève la classe dark selon si elle est présente ou non */}
  };
  // donne au contexte (la variable accessible par tous) la valeur theme,toggleTheme 
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// permet de pouvoir écrire useTheme au lieu de devoir écrire useContext(ThemeContext)
export function useTheme() {
  const context = useContext(ThemeContext);
   if (!context) {          {/*certains composants détectent que la valeur null peut être prise et ne veulent donc pas fonctionner ==> mettre une alerte en cas de problème résout le ça*/}
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}