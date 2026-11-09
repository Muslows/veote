import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SourceBadge } from "@/components/source/SourceBadge";

import { listCandidates, listParties } from "@/lib/module-a/queries";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Candidats & partis",
  description:
    "Module A Veote — fiches candidats, parcours, affiliations et généalogie des partis, sourcés.",
};

/**
 * Liste Module A — candidats + accès partis.
 * Copier vers : app/a/page.tsx (ou app/(modules)/a/page.tsx)
 */
export default async function ModuleAIndexPage() {
  const [candidates, parties] = await Promise.all([
    listCandidates(),
    listParties(),
  ]);

  const activeParties = parties.filter((p) => p.isActive);

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module A
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          Candidats &amp; parcours
        </h1>
        <p className="text-base leading-relaxed text-veote-muted">
          Fiches sourcées (Assemblée nationale, HATVP, Vie-publique, partis).
          Aucune intention de vote 2027 inventée. Transparence HATVP avec
          lignes détail optionnelles.
        </p>
      </header>

      <section className="mt-10 space-y-4" aria-labelledby="liste-candidats">
        <h2
          id="liste-candidats"
          className="font-display text-xl font-semibold text-veote-text"
        >
          Figures indexées
        </h2>
        {candidates.length === 0 ? (
          <p className="rounded-md border border-dashed border-veote-border px-4 py-6 text-sm text-veote-muted">
            Aucun candidat indexé pour le moment. Les fiches apparaîtront ici
            après seed ou synchronisation des sources.
          </p>
        ) : (
          <ul className="divide-y divide-veote-border border-y border-veote-border">
            {candidates.map((c) => {
              const party = c.affiliations[0]?.party;
              const src = c.sources[0]?.source;
              return (
                <li key={c.id} className="py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <Link
                        href={`/candidats/${encodeURIComponent(c.slug)}`}
                        className="font-display text-lg font-semibold text-veote-text no-underline hover:text-veote-focus hover:underline"
                      >
                        {c.displayName}
                      </Link>
                      {party ? (
                        <p className="mt-1 text-sm text-veote-muted">
                          <Link
                            href={`/candidats/partis/${encodeURIComponent(party.slug)}`}
                            className="text-veote-muted no-underline hover:text-veote-focus hover:underline"
                          >
                            {party.acronym ?? party.name}
                          </Link>
                        </p>
                      ) : null}
                    </div>
                    {src ? (
                      <SourceBadge
                        label={src.label}
                        href={src.url}
                        organism={src.organism ?? undefined}
                        className="shrink-0"
                      />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12 space-y-4" aria-labelledby="liste-partis">
        <h2
          id="liste-partis"
          className="font-display text-xl font-semibold text-veote-text"
        >
          Partis actifs
        </h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {activeParties.map((p) => (
            <li key={p.id}>
              <Link
                href={`/candidats/partis/${encodeURIComponent(p.slug)}`}
                className="text-veote-accent no-underline hover:text-veote-focus hover:underline"
              >
                {p.acronym ? `${p.acronym} — ${p.name}` : p.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
