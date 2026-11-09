import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SourceBadge } from "@/components/source/SourceBadge";

import { GroupVoteTable } from "@/components/module-b/GroupVoteTable";
import { LawArguments } from "@/components/module-b/LawArguments";
import { LawStatusBadge } from "@/components/module-b/LawStatusBadge";
import { VoteBreakdownChart } from "@/components/module-b/VoteBreakdownChart";
import {
  authorKindLabel,
  formatDate,
  voteOutcomeLabel,
} from "@/lib/module-b/format";
import { getLawBySlug } from "@/lib/module-b/queries";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const law = await getLawBySlug(decodeURIComponent(slug));
  if (!law) return { title: "Loi introuvable" };
  return {
    title: law.title,
    description:
      law.summary?.slice(0, 160) ??
      `Fiche Veote — ${law.title} (Assemblée nationale)`,
  };
}

/**
 * Fiche loi — vote, répartition par groupe, arguments sourcés, SourceBadge.
 * Copier vers : app/b/[slug]/page.tsx
 */
export default async function LawDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const law = await getLawBySlug(decodeURIComponent(slug));
  if (!law) notFound();

  const primaryVote = law.votes[0];
  const anSources = law.sources.filter(
    (s) => s.source.kind === "ASSEMBLEE_NATIONALE",
  );
  const otherSources = law.sources.filter(
    (s) => s.source.kind !== "ASSEMBLEE_NATIONALE",
  );

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mb-6 text-sm text-veote-muted">
        <Link
          href="/lois"
          className="text-veote-muted no-underline hover:text-veote-focus hover:underline"
        >
          ← Lois &amp; votes
        </Link>
      </nav>

      <header className="max-w-3xl space-y-4 border-b border-veote-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module B · Assemblée nationale
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <LawStatusBadge
            status={law.status}
            adopted={primaryVote?.adopted}
          />
          {law.themeLabel ? (
            <span className="text-xs text-veote-muted">{law.themeLabel}</span>
          ) : null}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          {law.title}
        </h1>
        <dl className="grid gap-2 text-sm text-veote-muted sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
              Auteur
            </dt>
            <dd className="text-veote-text">
              {law.authorLabel ?? authorKindLabel(law.authorKind)}
              {law.authorGroup
                ? ` (${law.authorGroup.acronym ?? law.authorGroup.name})`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
              Référence
            </dt>
            <dd className="text-veote-text">{law.officialRef ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
              Date de vote
            </dt>
            <dd className="text-veote-text">
              {primaryVote
                ? formatDate(primaryVote.votedOn)
                : law.adoptedOn
                  ? formatDate(law.adoptedOn)
                  : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
              Statut du scrutin
            </dt>
            <dd className="text-veote-text">
              {primaryVote
                ? voteOutcomeLabel(primaryVote.adopted)
                : law.status}
            </dd>
          </div>
        </dl>

        {law.summary ? (
          <div className="space-y-2">
            <p className="text-base leading-relaxed text-veote-muted">
              {law.summary}
            </p>
            {law.summaryUrl ? (
              <SourceBadge
                label="Résumé Vie-publique / exposé des motifs"
                href={law.summaryUrl}
                organism="Vie-publique / DILA"
              />
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <SourceBadge
            label="Dossier législatif Assemblée nationale"
            href={law.officialUrl}
            organism="Assemblée nationale"
          />
          {anSources.map(({ source: s }) =>
            s.url !== law.officialUrl ? (
              <SourceBadge
                key={s.id}
                label={s.label}
                href={s.url}
                organism={s.organism ?? undefined}
                dateLabel={
                  s.publishedAt ? formatDate(s.publishedAt) : undefined
                }
              />
            ) : null,
          )}
          {otherSources.map(({ source: s }) =>
            s.url !== law.summaryUrl ? (
              <SourceBadge
                key={s.id}
                label={s.label}
                href={s.url}
                organism={s.organism ?? undefined}
                dateLabel={
                  s.publishedAt ? formatDate(s.publishedAt) : undefined
                }
              />
            ) : null,
          )}
        </div>
      </header>

      {law.votes.map((vote) => (
        <section
          key={vote.id}
          className="mt-10 space-y-6"
          aria-labelledby={`vote-${vote.id}`}
        >
          <header className="space-y-2">
            <h2
              id={`vote-${vote.id}`}
              className="font-display text-xl font-semibold text-veote-text"
            >
              Scrutin
              {vote.scrutinRef ? ` n°${vote.scrutinRef}` : ""}
            </h2>
            <p className="text-sm text-veote-muted">{vote.title}</p>
            <p className="text-sm text-veote-muted">
              {formatDate(vote.votedOn)}
              {" · "}
              {voteOutcomeLabel(vote.adopted)}
              {" · "}
              {vote.voteType.replace(/_/g, " ").toLowerCase()}
            </p>
            <SourceBadge
              label={
                vote.sources[0]?.source.label ??
                `Scrutin Assemblée nationale${vote.scrutinRef ? ` n°${vote.scrutinRef}` : ""}`
              }
              href={vote.officialUrl}
              organism="Assemblée nationale"
              dateLabel={formatDate(vote.votedOn)}
            />
          </header>

          <div className="veote-panel space-y-4 rounded-lg p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-veote-muted">
              Résultat d’ensemble
            </h3>
            <VoteBreakdownChart
              pour={vote.pour}
              contre={vote.contre}
              abstention={vote.abstention}
              nonVotant={vote.nonVotant}
            />
          </div>

          <div className="veote-panel space-y-4 rounded-lg p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-veote-muted">
              Répartition par groupe parlementaire
            </h3>
            <GroupVoteTable positions={vote.positions} />
          </div>
        </section>
      ))}

      <section className="mt-12 space-y-4" aria-labelledby="arguments">
        <h2
          id="arguments"
          className="font-display text-xl font-semibold text-veote-text"
        >
          Arguments sourcés
        </h2>
        <p className="max-w-2xl text-sm text-veote-muted">
          Synthèses neutres tirées de l’exposé des motifs / Vie-publique et des
          résultats de scrutin officiels — chaque camp porte ses SourceBadge.
        </p>
        <LawArguments arguments={law.arguments} />
      </section>
    </Container>
  );
}
