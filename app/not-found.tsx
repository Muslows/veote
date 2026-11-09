import Link from "next/link";

import { Container } from "@/components/ui/Container";

/**
 * 404 App Router — thème Slate Dark (même shell que le reste du site).
 */
export default function NotFound() {
  return (
    <Container className="py-20 sm:py-28">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
        Erreur 404
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
        Page introuvable
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-veote-muted">
        Cette adresse ne correspond à aucune page Veote. Les modules publics sont
        sur des chemins français&nbsp;: candidats, lois, sondages, méthodologie.
      </p>
      <ul className="mt-10 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
        <li>
          <Link
            href="/"
            className="text-veote-focus no-underline hover:underline"
          >
            Accueil
          </Link>
        </li>
        <li>
          <Link
            href="/candidats"
            className="text-veote-focus no-underline hover:underline"
          >
            Candidats
          </Link>
        </li>
        <li>
          <Link
            href="/lois"
            className="text-veote-focus no-underline hover:underline"
          >
            Lois
          </Link>
        </li>
        <li>
          <Link
            href="/sondages"
            className="text-veote-focus no-underline hover:underline"
          >
            Sondages
          </Link>
        </li>
        <li>
          <Link
            href="/methodologie"
            className="text-veote-focus no-underline hover:underline"
          >
            Méthodologie
          </Link>
        </li>
      </ul>
    </Container>
  );
}
