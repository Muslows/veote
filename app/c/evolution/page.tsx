import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SourceBadge } from "@/components/source/SourceBadge";

import {
  EvolutionChart,
  buildEvolutionSeriesColors,
  type EvolutionPoint,
} from "@/components/module-c/EvolutionChart";
import { InstituteFilter } from "@/components/module-c/InstituteFilter";
import { formatDateShort, toNumber } from "@/lib/module-c/format";
import {
  getEvolutionSeries,
  listInstitutes,
} from "@/lib/module-c/queries";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Évolution des intentions",
  description:
    "Courbes Recharts des intentions de vote filtrables par institut — Module C Veote.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Évolution interactive — Recharts + filtre institut.
 * Copier vers : app/c/evolution/page.tsx
 */
export default async function EvolutionPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const instituteRaw = raw.institute;
  const institute = Array.isArray(instituteRaw)
    ? instituteRaw[0]
    : instituteRaw;

  const [polls, institutes] = await Promise.all([
    getEvolutionSeries(institute),
    listInstitutes(),
  ]);

  // Construire séries candidats (clés stables = candidateId)
  const candidateMeta = new Map<string, string>();
  for (const poll of polls) {
    for (const r of poll.results) {
      if (r.candidateId && r.candidate) {
        candidateMeta.set(r.candidateId, r.candidate.displayName);
      }
    }
  }

  const seriesKeys = [...candidateMeta.entries()].map(([key, label]) => ({
    key,
    label,
  }));
  const series = buildEvolutionSeriesColors(seriesKeys);

  const data: EvolutionPoint[] = polls.map((poll) => {
    const point: EvolutionPoint = {
      date: poll.fieldworkEnd.toISOString().slice(0, 10),
      dateLabel: formatDateShort(poll.fieldworkEnd),
      pollTitle: poll.title,
      isTestStructure: poll.isTestStructure,
      institute: poll.institute,
    };
    for (const r of poll.results) {
      if (r.candidateId) {
        point[r.candidateId] = toNumber(r.percent);
      }
    }
    return point;
  });

  const sampleSources = polls
    .flatMap((p) => p.sources.map((s) => s.source))
    .filter(
      (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i,
    )
    .slice(0, 4);

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mb-6 text-sm text-veote-muted">
        <Link
          href="/c"
          className="text-veote-muted no-underline hover:text-veote-focus hover:underline"
        >
          ← Observatoire
        </Link>
      </nav>

      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module C · Évolution
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          Intentions dans le temps
        </h1>
        <p className="text-base leading-relaxed text-veote-muted">
          Courbes interactives (Recharts) des intentions publiées. Filtrez par
          institut. Les points marqués TEST sont des structures Commission, pas
          des intentions 2027 officielles.
        </p>
      </header>

      <div className="mt-8">
        <InstituteFilter institutes={institutes} selected={institute} />
      </div>

      <section className="veote-panel mt-8 rounded-lg p-4 sm:p-6">
        <EvolutionChart data={data} series={series} />
      </section>

      {sampleSources.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="font-display text-lg font-semibold text-veote-text">
            Sources des points affichés
          </h2>
          <ul className="flex flex-wrap gap-2">
            {sampleSources.map((s) => (
              <li key={s.id}>
                <SourceBadge
                  label={s.label}
                  href={s.url}
                  organism={s.organism ?? undefined}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
