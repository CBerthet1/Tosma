//ce fichier permet de d'avoir un thème sous forme d'état (constante qui reste et peut être modifiée)

'use client'; // ← Ce composant EST côté client

import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark'; //défini le type (ici les valeurs possibles) de Theme (Mettre les deux valeurs possibles permet de voir immédiatement si on a par exemple fait une faute de frappe en attribuant une valeur au thème) 
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);  // crée un contexte pour le thème avec un type défini, initialisé à null. Cela permet de partager l'état du thème et la fonction de basculement entre les composants de l'application.

//fonction qui décide quel thème appliquer, l'appliqe et met à disposition de tous les composant les variable de thème (sert au bouton par exemple)
export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useIsomorphicLayoutEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme: Theme =
      savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme
        : document.documentElement.classList.contains('dark') || systemPrefersDark
          ? 'dark'
          : 'light';

    setTheme(currentTheme);
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.cookie = `theme=${savedTheme}; path=/; max-age=31536000; samesite=lax`;
    }
  }, []);
  //fonction gère le changement de thème
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'; // Le nouveau thème est 'dark' si c'était light et light sinon
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); {/* crée un fichier persistant dans le navigateur qui stocke des informations afin d'avoir un variable thème par défaut */}
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000; samesite=lax`;
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