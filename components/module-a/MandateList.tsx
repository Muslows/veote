import { SourceBadge } from "@/components/source/SourceBadge";

import { formatDate, formatRange } from "@/lib/module-a/format";

type Mandate = {
  id: string;
  legislature: number;
  circonscription: string | null;
  chamber: string;
  startedOn: Date;
  endedOn: Date | null;
  sources: {
    source: {
      label: string;
      url: string;
      organism: string | null;
      publishedAt: Date | null;
    };
  }[];
};

type MandateListProps = {
  mandates: Mandate[];
};

export function MandateList({ mandates }: MandateListProps) {
  return (
    <section className="space-y-4" id="mandats">
      <h2 className="font-display text-xl font-semibold text-veote-text">
        Mandats parlementaires
      </h2>
      {mandates.length === 0 ? (
        <p className="text-sm text-veote-muted">
          Aucun mandat Assemblée nationale indexé (Module B Sénat hors v1).
        </p>
      ) : (
        <ol className="space-y-3">
          {mandates.map((m) => {
            const src = m.sources[0]?.source;
            return (
              <li key={m.id} className="veote-panel rounded-lg p-4">
                <p className="font-medium text-veote-text">
                  {m.chamber === "ASSEMBLEE_NATIONALE"
                    ? "Assemblée nationale"
                    : m.chamber}{" "}
                  · {m.legislature}
                  <sup>e</sup> législature
                </p>
                {m.circonscription ? (
                  <p className="text-sm text-veote-muted">
                    {m.circonscription}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-veote-muted">
                  {formatRange(m.startedOn, m.endedOn)}
                </p>
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
