import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from './providers/theme-provider';

export const metadata: Metadata = {
  title: "Tosma App",
  description: "Application de gestion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body 
        className="min-h-full flex flex-col bg-background text-foreground" 
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}