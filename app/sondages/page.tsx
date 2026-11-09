import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SourceBadge } from "@/components/source/SourceBadge";

import { InstituteFilter } from "@/components/module-c/InstituteFilter";
import { PollComplianceBlock } from "@/components/module-c/PollComplianceBlock";
import {
  formatFieldworkRange,
  formatPercent,
  toNumber,
} from "@/lib/module-c/format";
import { listInstitutes, listPolls } from "@/lib/module-c/queries";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Observatoire des sondages",
  description:
    "Module C Veote — sondages présidentiels sourcés (Commission des sondages), évolution et simulateur de report.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Liste observatoire — chaque sondage affiche les mentions Commission.
 * Copier vers : app/c/page.tsx
 */
export default async function ModuleCIndexPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const instituteRaw = raw.institute;
  const institute = Array.isArray(instituteRaw)
    ? instituteRaw[0]
    : instituteRaw;

  const [polls, institutes] = await Promise.all([
    listPolls({ institute }),
    listInstitutes(),
  ]);

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module C
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          Observatoire des sondages
        </h1>
        <p className="text-base leading-relaxed text-veote-muted">
          Intentions de vote sourcées (institut, commanditaire, terrain,
          échantillon, marge d’erreur, notice). Aucune intention 2027 inventée
          n’est présentée comme officielle.
        </p>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/sondages/evolution"
            className="font-medium text-veote-accent no-underline hover:text-veote-focus hover:underline"
          >
            Évolution dans le temps
          </Link>
          <Link
            href="/sondages/simulateur"
            className="font-medium text-veote-accent no-underline hover:text-veote-focus hover:underline"
          >
            Simulateur 2ᵉ tour
          </Link>
        </nav>
      </header>

      <div className="mt-8">
        <InstituteFilter institutes={institutes} selected={institute} />
      </div>

      <section className="mt-10 space-y-6" aria-labelledby="liste-sondages">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="liste-sondages"
            className="font-display text-xl font-semibold text-veote-text"
          >
            Sondages
          </h2>
          <p className="text-sm text-veote-muted">
            {polls.length} enquête{polls.length > 1 ? "s" : ""}
          </p>
        </div>

        {polls.length === 0 ? (
          <p className="rounded-md border border-dashed border-veote-border px-4 py-6 text-sm text-veote-muted">
            Aucun sondage pour ce filtre.
          </p>
        ) : (
          <ul className="space-y-8">
            {polls.map((poll) => {
              const top = poll.results[0];
              const noticeSrc =
                poll.sources.find((s) =>
                  ["COMMISSION_DES_SONDAGES", "INSTITUT_SONDAGE"].includes(
                    s.source.kind,
                  ),
                )?.source ?? poll.sources[0]?.source;

              return (
                <li key={poll.id} className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 max-w-2xl space-y-2">
                      {poll.isTestStructure ? (
                        <span className="inline-block rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-100">
                          Sondage de test — Structure Commission
                        </span>
                      ) : poll.electionYear ? (
                        <span className="text-xs text-veote-muted">
                          Présidentielle {poll.electionYear}
                        </span>
                      ) : null}
                      <Link
                        href={`/sondages/${encodeURIComponent(poll.slug)}`}
                        className="font-display text-lg font-semibold text-veote-text no-underline hover:text-veote-focus hover:underline"
                      >
                        {poll.title}
                      </Link>
                      <p className="text-sm text-veote-muted">
                        {poll.institute} · {poll.sponsor} ·{" "}
                        {formatFieldworkRange(
                          poll.fieldworkStart,
                          poll.fieldworkEnd,
                        )}
                        {top
                          ? ` · tête : ${
                              top.candidate?.displayName ?? top.label ?? "—"
                            } (${formatPercent(toNumber(top.percent))})`
                          : ""}
                      </p>
                    </div>
                    {noticeSrc ? (
                      <SourceBadge
                        label={noticeSrc.label}
                        href={noticeSrc.url}
                        organism={noticeSrc.organism ?? undefined}
                        className="shrink-0"
                      />
                    ) : (
                      <SourceBadge
                        label="Notice / institut"
                        href={poll.commissionNoticeUrl}
                        organism={poll.institute}
                        className="shrink-0"
                      />
                    )}
                  </div>
                  <PollComplianceBlock
                    poll={{
                      ...poll,
                      sources: poll.sources.map((s) => ({
                        label: s.source.label,
                        url: s.source.url,
                        organism: s.source.organism,
                      })),
                    }}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Container>
  );
}
