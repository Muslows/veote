import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-veote-sans",
  display: "swap",
});

const display = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-veote-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Veote — Présidentielle 2027",
    template: "%s · Veote",
  },
  description:
    "Plateforme civic-tech neutre : candidats, lois et sondages sourcés pour la présidentielle française 2027.",
  robots: {
    index: true,
    follow: true,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Shell App Router — thème Slate Dark institutionnel.
 * Pas de scripts analytics, pas de cookies de tracking.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="contenu-principal" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
