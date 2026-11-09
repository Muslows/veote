import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SourceBadge } from "@/components/source/SourceBadge";

import { LawSearchForm } from "@/components/module-b/LawSearchForm";
import { LawStatusBadge } from "@/components/module-b/LawStatusBadge";
import {
  authorKindLabel,
  formatDate,
  voteOutcomeLabel,
} from "@/lib/module-b/format";
import {
  listParliamentaryGroupsForFilter,
  listThemes,
  searchLaws,
} from "@/lib/module-b/queries";
import { parseLawSearchParams } from "@/lib/module-b/search-params";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lois & votes — Assemblée nationale",
  description:
    "Module B Veote — lois et scrutins de l’Assemblée nationale, sourcés (Open Data AN, Vie-publique).",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Liste / recherche Module B.
 * Copier vers : app/b/page.tsx
 */
export default async function ModuleBIndexPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = parseLawSearchParams(raw);

  const [laws, themes, groups] = await Promise.all([
    searchLaws(filters),
    listThemes(),
    listParliamentaryGroupsForFilter(16),
  ]);

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module B
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          Lois &amp; votes — Assemblée nationale
        </h1>
        <p className="text-base leading-relaxed text-veote-muted">
          Scrutins publics et dossiers législatifs sourcés
          (assemblee-nationale.fr, Vie-publique). Périmètre v1 : Assemblée
          nationale uniquement — pas de Sénat.
        </p>
      </header>

      <div className="mt-8">
        <LawSearchForm
          initial={filters}
          themes={themes}
          groups={groups}
        />
      </div>

      <section className="mt-10 space-y-4" aria-labelledby="liste-lois">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="liste-lois"
            className="font-display text-xl font-semibold text-veote-text"
          >
            Résultats
          </h2>
          <p className="text-sm text-veote-muted">
            {laws.length} texte{laws.length > 1 ? "s" : ""}
          </p>
        </div>

        {laws.length === 0 ? (
          <p className="rounded-md border border-dashed border-veote-border px-4 py-6 text-sm text-veote-muted">
            Aucune loi ne correspond à ces filtres. Élargissez la recherche ou
            réinitialisez.
          </p>
        ) : (
          <ul className="divide-y divide-veote-border border-y border-veote-border">
            {laws.map((law) => {
              const vote = law.votes[0];
              const dossierSrc =
                law.sources.find(
                  (s) => s.source.kind === "ASSEMBLEE_NATIONALE",
                )?.source ?? law.sources[0]?.source;
              const voteDate = vote?.votedOn ?? law.adoptedOn;

              return (
                <li key={law.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 max-w-2xl space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <LawStatusBadge
                          status={law.status}
                          adopted={vote?.adopted}
                        />
                        {law.themeLabel ? (
                          <span className="text-xs text-veote-muted">
                            {law.themeLabel}
                          </span>
                        ) : null}
                      </div>
                      <Link
                        href={`/b/${encodeURIComponent(law.slug)}`}
                        className="font-display text-lg font-semibold text-veote-text no-underline hover:text-veote-focus hover:underline"
                      >
                        {law.title}
                      </Link>
                      <p className="text-sm text-veote-muted">
                        {law.authorLabel ?? authorKindLabel(law.authorKind)}
                        {law.officialRef ? ` · ${law.officialRef}` : ""}
                        {voteDate ? ` · ${formatDate(voteDate)}` : ""}
                        {vote
                          ? ` · ${voteOutcomeLabel(vote.adopted)}`
                          : ""}
                      </p>
                    </div>
                    {dossierSrc ? (
                      <SourceBadge
                        label={dossierSrc.label}
                        href={dossierSrc.url}
                        organism={dossierSrc.organism ?? undefined}
                        className="shrink-0"
                      />
                    ) : (
                      <SourceBadge
                        label="Dossier Assemblée nationale"
                        href={law.officialUrl}
                        organism="Assemblée nationale"
                        className="shrink-0"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Container>
  );
}
