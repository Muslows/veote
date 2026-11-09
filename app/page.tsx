import Link from "next/link";

import { Container } from "@/components/ui/Container";

const MODULES = [
  {
    href: "/a",
    label: "Candidats",
    blurb: "Parcours, partis, généalogie politique et déclarations HATVP sourcées.",
  },
  {
    href: "/b",
    label: "Lois",
    blurb: "Textes et scrutins de l’Assemblée nationale, avec décomptes officiels.",
  },
  {
    href: "/c",
    label: "Sondages",
    blurb: "Intentions publiées et simulateur de reports, toujours sourcés.",
  },
] as const;

export default function HomePage() {
  return (
    <Container className="py-16 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-veote-muted">
        Présidentielle 2027
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-veote-text sm:text-5xl">
        Veote
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-veote-muted">
        Plateforme civic-tech neutre : candidats, lois et sondages sourcés — sans
        tracking ni données personnelles.
      </p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-3">
        {MODULES.map((m) => (
          <li key={m.href}>
            <Link
              href={m.href}
              className="block rounded-lg border border-veote-border bg-veote-card/60 p-5 no-underline transition-colors hover:border-veote-focus/60 hover:bg-veote-card"
            >
              <span className="font-display text-xl font-semibold text-veote-text">
                {m.label}
              </span>
              <span className="mt-2 block text-sm text-veote-muted">
                {m.blurb}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
