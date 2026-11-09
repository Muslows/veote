import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SourceBadge } from "@/components/source/SourceBadge";

import { PartyGenealogy } from "@/components/module-a/PartyGenealogy";
import { formatDate } from "@/lib/module-a/format";
import { getPartyBySlug } from "@/lib/module-a/queries";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const party = await getPartyBySlug(decodeURIComponent(slug));
  if (!party) return { title: "Parti introuvable" };
  return {
    title: party.acronym ? `${party.acronym} — ${party.name}` : party.name,
    description:
      party.summary?.slice(0, 160) ?? `Généalogie Veote — ${party.name}`,
  };
}

/**
 * Page parti — généalogie PoliticalPartyHistory (+ participants N-aires).
 * Copier vers : app/candidats/partis/[slug]/page.tsx
 */
export default async function PartyPage({ params }: PageProps) {
  const { slug } = await params;
  const party = await getPartyBySlug(decodeURIComponent(slug));
  if (!party) notFound();

  const primarySource = party.sources[0]?.source;

  // Événements où le parti est sujet + participations (dédupliqués)
  const byId = new Map<
    string,
    (typeof party.historyAsSubject)[number]
  >();
  for (const e of party.historyAsSubject) byId.set(e.id, e);
  for (const p of party.historyParticipations) {
    if (!byId.has(p.history.id)) {
      byId.set(p.history.id, p.history as (typeof party.historyAsSubject)[number]);
    }
  }
  const events = Array.from(byId.values()).sort(
    (a, b) => a.effectiveOn.getTime() - b.effectiveOn.getTime(),
  );

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mb-6 text-sm text-veote-muted">
        <Link
          href="/candidats"
          className="text-veote-muted no-underline hover:text-veote-focus hover:underline"
        >
          ← Candidats &amp; partis
        </Link>
      </nav>

      <header className="max-w-3xl space-y-4 border-b border-veote-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module A · Parti
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          {party.name}
          {party.acronym ? (
            <span className="ml-3 text-veote-muted">{party.acronym}</span>
          ) : null}
        </h1>
        <p className="text-sm text-veote-muted">
          {party.isActive ? "Actif" : "Historique / dissous"}
          {party.foundedOn ? ` · fondé le ${formatDate(party.foundedOn)}` : ""}
          {party.dissolvedOn
            ? ` · fin le ${formatDate(party.dissolvedOn)}`
            : ""}
        </p>
        {party.summary ? (
          <p className="text-base leading-relaxed text-veote-muted">
            {party.summary}
          </p>
        ) : null}
        {primarySource ? (
          <SourceBadge
            label={primarySource.label}
            href={primarySource.url}
            organism={primarySource.organism ?? undefined}
            dateLabel={
              primarySource.publishedAt
                ? formatDate(primarySource.publishedAt)
                : undefined
            }
          />
        ) : null}
        {party.websiteUrl ? (
          <p className="text-sm">
            <a
              href={party.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-veote-accent hover:text-veote-focus"
            >
              Site du parti
            </a>
          </p>
        ) : null}
      </header>

      <div className="mt-10">
        <PartyGenealogy events={events} />
      </div>

      {party.affiliations.length > 0 ? (
        <section className="mt-12 space-y-4" id="participants">
          <h2 className="font-display text-xl font-semibold text-veote-text">
            Figures affiliées (échantillon)
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {party.affiliations.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/candidats/${encodeURIComponent(a.candidate.slug)}`}
                  className="text-veote-accent no-underline hover:text-veote-focus hover:underline"
                >
                  {a.candidate.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
