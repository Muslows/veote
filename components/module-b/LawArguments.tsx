import { SourceBadge } from "@/components/source/SourceBadge";

import { formatDate } from "@/lib/module-b/format";

type ArgSource = {
  source: {
    id: string;
    label: string;
    url: string;
    organism: string | null;
    publishedAt: Date | null;
  };
};

type LawArgumentView = {
  id: string;
  camp: string;
  title: string;
  body: string;
  sources: ArgSource[];
};

type LawArgumentsProps = {
  arguments: LawArgumentView[];
};

function campLabel(camp: string): string {
  if (camp === "POUR") return "Pour";
  if (camp === "CONTRE") return "Contre";
  if (camp === "ABSTENTION") return "Abstention";
  return camp;
}

/**
 * Synthèse d’arguments sourcée par camp — chaque bloc porte SourceBadge.
 */
export function LawArguments({ arguments: args }: LawArgumentsProps) {
  if (args.length === 0) {
    return (
      <p className="text-sm text-veote-muted">
        Aucun argument sourcé indexé pour ce texte.
      </p>
    );
  }

  const camps = ["POUR", "CONTRE", "ABSTENTION"] as const;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {camps.map((camp) => {
        const items = args.filter((a) => a.camp === camp);
        if (items.length === 0) return null;
        return (
          <section
            key={camp}
            className="veote-panel space-y-4 rounded-lg p-5"
            aria-labelledby={`camp-${camp}`}
          >
            <h3
              id={`camp-${camp}`}
              className="font-display text-lg font-semibold text-veote-text"
            >
              Arguments — {campLabel(camp)}
            </h3>
            <ul className="space-y-5">
              {items.map((a) => (
                <li key={a.id} className="space-y-3">
                  <h4 className="text-base font-semibold text-veote-text">
                    {a.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-veote-muted">
                    {a.body}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {a.sources.map(({ source: s }) => (
                      <SourceBadge
                        key={s.id}
                        label={s.label}
                        href={s.url}
                        organism={s.organism ?? undefined}
                        dateLabel={
                          s.publishedAt ? formatDate(s.publishedAt) : undefined
                        }
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
