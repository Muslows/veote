import { formatPercent, toNumber } from "@/lib/module-c/format";

type ResultRow = {
  id: string;
  percent: number | string | { toNumber?: () => number };
  label?: string | null;
  candidate?: { displayName: string; slug: string } | null;
};

/**
 * Tableau d’intentions — pourcentages 1er tour.
 */
export function PollResultTable({
  results,
  className = "",
}: {
  results: ResultRow[];
  className?: string;
}) {
  const max = Math.max(
    ...results.map((r) => toNumber(r.percent)),
    0.0001,
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <ul className="space-y-2" aria-label="Intentions de vote">
        {results.map((r) => {
          const pct = toNumber(r.percent);
          const name =
            r.candidate?.displayName ?? r.label ?? "Non attribué";
          const width = Math.max(2, (pct / max) * 100);
          return (
            <li key={r.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-veote-text">{name}</span>
                <span className="tabular-nums text-veote-muted">
                  {formatPercent(pct)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-veote-bg ring-1 ring-veote-border">
                <span
                  className="block h-full bg-veote-accent transition-[width] duration-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
