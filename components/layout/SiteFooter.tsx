import Link from "next/link";

/**
 * Pied de page institutionnel — neutralité, méthodologie, pas de trackers.
 * Copier vers : components/layout/SiteFooter.tsx
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-veote-border/80 bg-veote-bg">
      <div className="mx-auto flex max-w-shell flex-col gap-4 px-4 py-8 text-sm text-veote-muted sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="space-y-2">
          <p className="font-display text-base text-veote-text">Veote</p>
          <p className="max-w-md leading-relaxed">
            Plateforme civic-tech neutre. Données publiques sourcées. Aucun
            cookie de suivi, aucune collecte de données personnelles.
          </p>
        </div>

        <nav aria-label="Pied de page">
          <ul className="flex flex-col gap-2 sm:items-end">
            <li>
              <Link
                href="/methodologie"
                className="text-veote-muted no-underline hover:text-veote-text hover:underline"
              >
                Méthodologie &amp; mentions légales
              </Link>
            </li>
            <li>
              <Link
                href="/a"
                className="text-veote-muted no-underline hover:text-veote-text hover:underline"
              >
                Candidats
              </Link>
            </li>
            <li>
              <Link
                href="/b"
                className="text-veote-muted no-underline hover:text-veote-text hover:underline"
              >
                Lois
              </Link>
            </li>
            <li>
              <Link
                href="/c"
                className="text-veote-muted no-underline hover:text-veote-text hover:underline"
              >
                Sondages
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
