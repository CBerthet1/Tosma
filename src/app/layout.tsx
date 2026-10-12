import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from './providers/theme-provider';

export const metadata: Metadata = {
  title: "Tosma App",
  description: "Application de gestion",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get('theme')?.value;
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';

  return (
    <html
      lang="fr"
      className={`h-full antialiased${initialTheme === 'dark' ? ' dark' : ''}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const savedTheme = localStorage.getItem('theme');
              const cookieTheme = document.cookie
                .split('; ')
                .find((cookie) => cookie.startsWith('theme='))
                ?.split('=')[1];
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const theme = savedTheme === 'dark' || savedTheme === 'light'
                ? savedTheme
                : cookieTheme === 'dark' || cookieTheme === 'light'
                  ? cookieTheme
                  : prefersDark ? 'dark' : 'light';
              if (savedTheme === 'dark' || savedTheme === 'light') {
                document.cookie = 'theme=' + savedTheme + '; path=/; max-age=31536000; samesite=lax';
              }
              document.documentElement.classList.toggle('dark', theme === 'dark');
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider initialTheme={initialTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}