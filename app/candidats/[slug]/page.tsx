import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SourceBadge } from "@/components/source/SourceBadge";

import { AffiliationTimeline } from "@/components/module-a/AffiliationTimeline";
import { HatvpSection } from "@/components/module-a/HatvpSection";
import { MandateList } from "@/components/module-a/MandateList";
import { formatDate } from "@/lib/module-a/format";
import { getCandidateBySlug } from "@/lib/module-a/queries";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(decodeURIComponent(slug));
  if (!candidate) return { title: "Candidat introuvable" };
  return {
    title: candidate.displayName,
    description:
      candidate.bio?.slice(0, 160) ??
      `Fiche Veote — ${candidate.displayName}`,
  };
}

/**
 * Fiche candidat — parcours, mandats, affiliations, HATVP (détails optionnels).
 * Copier vers : app/a/[slug]/page.tsx
 */
export default async function CandidatePage({ params }: PageProps) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(decodeURIComponent(slug));
  if (!candidate) notFound();

  const primarySource = candidate.sources[0]?.source;

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mb-6 text-sm text-veote-muted">
        <Link
          href="/candidats"
          className="text-veote-muted no-underline hover:text-veote-focus hover:underline"
        >
          ← Candidats
        </Link>
      </nav>

      <header className="max-w-3xl space-y-4 border-b border-veote-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module A · Fiche
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          {candidate.displayName}
        </h1>
        <p className="text-sm text-veote-muted">
          {candidate.birthDate ? (
            <>
              Né·e le {formatDate(candidate.birthDate)}
              {candidate.birthPlace ? ` · ${candidate.birthPlace}` : ""}
            </>
          ) : candidate.birthPlace ? (
            candidate.birthPlace
          ) : null}
        </p>
        {candidate.bio ? (
          <p className="text-base leading-relaxed text-veote-muted">
            {candidate.bio}
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
        {candidate.websiteUrl ? (
          <p className="text-sm">
            <a
              href={candidate.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-veote-accent hover:text-veote-focus"
            >
              Site officiel
            </a>
          </p>
        ) : null}
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <AffiliationTimeline affiliations={candidate.affiliations} />
        <MandateList mandates={candidate.mandates} />
      </div>

      <div className="mt-12">
        <HatvpSection
          candidateName={candidate.displayName}
          declarations={candidate.hatvpDecls}
        />
      </div>
    </Container>
  );
}
