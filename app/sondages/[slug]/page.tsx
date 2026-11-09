import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SourceBadge } from "@/components/source/SourceBadge";

import { PollComplianceBlock } from "@/components/module-c/PollComplianceBlock";
import { PollResultTable } from "@/components/module-c/PollResultTable";
import { formatDate } from "@/lib/module-c/format";
import { getPollBySlug } from "@/lib/module-c/queries";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const poll = await getPollBySlug(decodeURIComponent(slug));
  if (!poll) return { title: "Sondage introuvable" };
  return {
    title: poll.title,
    description: `${poll.institute} — ${poll.sponsor} · Commission des sondages`,
  };
}

/**
 * Fiche sondage — mentions Commission + résultats + SourceBadge.
 * Copier vers : app/c/[slug]/page.tsx
 */
export default async function PollDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const poll = await getPollBySlug(decodeURIComponent(slug));
  if (!poll) notFound();

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mb-6 text-sm text-veote-muted">
        <Link
          href="/sondages"
          className="text-veote-muted no-underline hover:text-veote-focus hover:underline"
        >
          ← Observatoire des sondages
        </Link>
      </nav>

      <header className="max-w-3xl space-y-4 border-b border-veote-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module C · Sondage
        </p>
        {poll.isTestStructure ? (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            [Sondage de test - Structure Commission des sondages] — ne pas
            interpréter comme une intention de vote 2027 réelle.
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          {poll.title}
        </h1>
        <p className="text-sm text-veote-muted">
          Publié le {formatDate(poll.publishedOn)}
          {poll.electionYear ? ` · cycle ${poll.electionYear}` : ""}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
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

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-veote-text">
              Intentions (suffrages exprimés / hypothèse publiée)
            </h2>
            <PollResultTable results={poll.results} />
          </section>
        </div>

        <aside className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-veote-text">
            Sources
          </h2>
          <ul className="space-y-2">
            {poll.sources.map(({ source }) => (
              <li key={source.id}>
                <SourceBadge
                  label={source.label}
                  href={source.url}
                  organism={source.organism ?? undefined}
                />
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <Link
              href={`/sondages/simulateur?pollId=${encodeURIComponent(poll.id)}`}
              className="inline-flex text-sm font-medium text-veote-accent no-underline hover:text-veote-focus hover:underline"
            >
              Ouvrir dans le simulateur →
            </Link>
          </div>

          {poll.matrices.length > 0 ? (
            <section className="space-y-2 pt-4">
              <h3 className="text-sm font-semibold text-veote-text">
                Matrices liées
              </h3>
              <ul className="space-y-2 text-sm text-veote-muted">
                {poll.matrices.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/sondages/simulateur?pollId=${encodeURIComponent(poll.id)}&matrix=${encodeURIComponent(m.slug)}`}
                      className="text-veote-accent no-underline hover:underline"
                    >
                      {m.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}
