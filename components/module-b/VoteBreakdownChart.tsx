type VoteBreakdownChartProps = {
  pour: number;
  contre: number;
  abstention: number;
  nonVotant?: number;
  className?: string;
};

/**
 * Répartition visuelle Pour / Contre / Abstention (barres CSS, sans lib chart).
 * Couleurs neutres Slate Dark — pas de couleurs partisanes.
 */
export function VoteBreakdownChart({
  pour,
  contre,
  abstention,
  nonVotant = 0,
  className = "",
}: VoteBreakdownChartProps) {
  const total = pour + contre + abstention + nonVotant;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

  const rows = [
    { key: "pour", label: "Pour", value: pour, bar: "bg-veote-accent" },
    { key: "contre", label: "Contre", value: contre, bar: "bg-veote-muted" },
    {
      key: "abstention",
      label: "Abstention",
      value: abstention,
      bar: "bg-veote-border",
    },
  ] as const;

  return (
    <div className={`space-y-3 ${className}`} aria-label="Répartition des votes">
      <div
        className="flex h-3 overflow-hidden rounded-full bg-veote-bg ring-1 ring-veote-border"
        role="img"
        aria-label={`Pour ${pour}, Contre ${contre}, Abstention ${abstention}`}
      >
        {total > 0 ? (
          <>
            <span
              className="bg-veote-accent transition-[width] duration-500"
              style={{ width: `${pct(pour)}%` }}
            />
            <span
              className="bg-veote-muted transition-[width] duration-500"
              style={{ width: `${pct(contre)}%` }}
            />
            <span
              className="bg-veote-border transition-[width] duration-500"
              style={{ width: `${pct(abstention)}%` }}
            />
          </>
        ) : null}
      </div>

      <ul className="grid gap-2 sm:grid-cols-3">
        {rows.map((r) => (
          <li
            key={r.key}
            className="flex items-baseline justify-between gap-2 border-t border-veote-border/60 pt-2 text-sm"
          >
            <span className="flex items-center gap-2 text-veote-muted">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-sm ${r.bar}`}
                aria-hidden
              />
              {r.label}
            </span>
            <span className="font-semibold tabular-nums text-veote-text">
              {r.value}
              <span className="ml-1 font-normal text-veote-muted">
                ({pct(r.value)} %)
              </span>
            </span>
          </li>
        ))}
      </ul>

      {nonVotant > 0 ? (
        <p className="text-xs text-veote-muted">
          Non votants (présidence / séance) : {nonVotant}
        </p>
      ) : null}
    </div>
  );
}
