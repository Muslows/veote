import Link from "next/link";

import { SourceBadge } from "@/components/source/SourceBadge";

import { formatRange, formatDate } from "@/lib/module-a/format";

type Affiliation = {
  id: string;
  role: string | null;
  startedOn: Date;
  endedOn: Date | null;
  isPrimary: boolean;
  party: {
    slug: string;
    name: string;
    acronym: string | null;
  };
  sources: {
    source: {
      label: string;
      url: string;
      organism: string | null;
      publishedAt: Date | null;
    };
  }[];
};

type AffiliationTimelineProps = {
  affiliations: Affiliation[];
};

export function AffiliationTimeline({ affiliations }: AffiliationTimelineProps) {
  return (
    <section className="space-y-4" id="affiliations">
      <h2 className="font-display text-xl font-semibold text-veote-text">
        Affiliations
      </h2>
      {affiliations.length === 0 ? (
        <p className="text-sm text-veote-muted">Aucune affiliation indexée.</p>
      ) : (
        <ol className="space-y-3">
          {affiliations.map((a) => {
            const src = a.sources[0]?.source;
            return (
              <li key={a.id} className="veote-panel rounded-lg p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={`/a/partis/${encodeURIComponent(a.party.slug)}`}
                    className="font-medium text-veote-text no-underline hover:text-veote-focus hover:underline"
                  >
                    {a.party.name}
                    {a.party.acronym ? ` (${a.party.acronym})` : ""}
                  </Link>
                  <span className="text-sm text-veote-muted">
                    {formatRange(a.startedOn, a.endedOn)}
                  </span>
                </div>
                {a.role ? (
                  <p className="mt-1 text-sm text-veote-muted">{a.role}</p>
                ) : null}
                {src ? (
                  <div className="mt-3">
                    <SourceBadge
                      label={src.label}
                      href={src.url}
                      organism={src.organism ?? undefined}
                      dateLabel={
                        src.publishedAt
                          ? formatDate(src.publishedAt)
                          : undefined
                      }
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
