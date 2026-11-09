import Link from "next/link";

import { SourceBadge } from "@/components/source/SourceBadge";

import { formatDate } from "@/lib/module-a/format";

type Participant = {
  role: string;
  sortOrder: number;
  party: {
    slug: string;
    name: string;
    acronym: string | null;
  };
};

type HistoryEvent = {
  id: string;
  eventType: string;
  label: string;
  description: string | null;
  effectiveOn: Date;
  participants: Participant[];
  sources: {
    source: {
      label: string;
      url: string;
      organism: string | null;
      publishedAt: Date | null;
    };
  }[];
};

type PartyGenealogyProps = {
  events: HistoryEvent[];
  title?: string;
};

const ROLE_FR: Record<string, string> = {
  SUBJECT: "Sujet",
  PREDECESSOR: "Prédécesseur",
  SUCCESSOR: "Successeur",
  PARTNER: "Partenaire",
};

/**
 * Généalogie N-aire depuis PoliticalPartyHistory (+ participants).
 */
export function PartyGenealogy({
  events,
  title = "Généalogie politique",
}: PartyGenealogyProps) {
  if (events.length === 0) {
    return (
      <section className="veote-panel rounded-lg p-5">
        <h2 className="font-display text-xl font-semibold text-veote-text">
          {title}
        </h2>
        <p className="mt-2 text-sm text-veote-muted">
          Aucun événement de généalogie indexé pour ce parti.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4" id="genealogie">
      <h2 className="font-display text-xl font-semibold text-veote-text">
        {title}
      </h2>
      <ol className="space-y-4">
        {events.map((event) => {
          const src = event.sources[0]?.source;
          return (
            <li key={event.id} className="veote-panel rounded-lg p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-veote-text">
                  {event.label}
                </h3>
                <time className="text-sm text-veote-muted">
                  {formatDate(event.effectiveOn)}
                </time>
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-veote-accent">
                {event.eventType}
              </p>
              {event.description ? (
                <p className="mt-3 text-sm leading-relaxed text-veote-muted">
                  {event.description}
                </p>
              ) : null}

              <ul className="mt-4 space-y-1.5 text-sm">
                {event.participants.map((p) => (
                  <li
                    key={`${event.id}-${p.party.slug}-${p.role}`}
                    className="flex flex-wrap items-baseline gap-x-2"
                  >
                    <span className="text-veote-muted">
                      {ROLE_FR[p.role] ?? p.role}
                    </span>
                    <Link
                      href={`/a/partis/${encodeURIComponent(p.party.slug)}`}
                      className="font-medium text-veote-text no-underline hover:text-veote-focus hover:underline"
                    >
                      {p.party.name}
                      {p.party.acronym ? ` (${p.party.acronym})` : ""}
                    </Link>
                  </li>
                ))}
              </ul>

              {src ? (
                <div className="mt-4">
                  <SourceBadge
                    label={src.label}
                    href={src.url}
                    organism={src.organism ?? undefined}
                    dateLabel={
                      src.publishedAt ? formatDate(src.publishedAt) : undefined
                    }
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
