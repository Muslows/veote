type ExpressedScoreGaugeProps = {
  labelA: string;
  labelB: string;
  expressedA: number;
  expressedB: number;
  scoreA?: number;
  scoreB?: number;
  abstentionBlanc?: number;
  className?: string;
};

/**
 * Jauge visuelle des scores en suffrages exprimés (hors abstention/blanc).
 */
export function ExpressedScoreGauge({
  labelA,
  labelB,
  expressedA,
  expressedB,
  scoreA,
  scoreB,
  abstentionBlanc,
  className = "",
}: ExpressedScoreGaugeProps) {
  const a = Math.max(0, expressedA);
  const b = Math.max(0, expressedB);

  return (
    <section
      className={`veote-panel space-y-4 rounded-lg p-5 ${className}`}
      aria-label="Scores en suffrages exprimés"
    >
      <header className="space-y-1">
        <h3 className="font-display text-lg font-semibold text-veote-text">
          Suffrages exprimés
        </h3>
        <p className="text-sm text-veote-muted">
          Hors abstention / blancs / nuls. La barre totalise 100&nbsp;% des
          exprimés.
        </p>
      </header>

      <div
        className="flex h-4 overflow-hidden rounded-full bg-veote-bg ring-1 ring-veote-border"
        role="img"
        aria-label={`${labelA} ${a} pour cent, ${labelB} ${b} pour cent`}
      >
        <span
          className="bg-veote-accent transition-[width] duration-500"
          style={{ width: `${a}%` }}
        />
        <span
          className="bg-veote-muted transition-[width] duration-500"
          style={{ width: `${b}%` }}
        />
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="space-y-1 border-t border-veote-border/60 pt-3">
          <p className="text-xs uppercase tracking-wide text-veote-muted/80">
            {labelA}
          </p>
          <p className="font-display text-3xl font-semibold tabular-nums text-veote-text">
            {a.toFixed(1).replace(".", ",")}
            <span className="ml-1 text-base font-normal text-veote-muted">
              %
            </span>
          </p>
          {scoreA != null ? (
            <p className="text-xs text-veote-muted">
              {scoreA.toFixed(1).replace(".", ",")} pts du corps électoral
            </p>
          ) : null}
        </li>
        <li className="space-y-1 border-t border-veote-border/60 pt-3">
          <p className="text-xs uppercase tracking-wide text-veote-muted/80">
            {labelB}
          </p>
          <p className="font-display text-3xl font-semibold tabular-nums text-veote-text">
            {b.toFixed(1).replace(".", ",")}
            <span className="ml-1 text-base font-normal text-veote-muted">
              %
            </span>
          </p>
          {scoreB != null ? (
            <p className="text-xs text-veote-muted">
              {scoreB.toFixed(1).replace(".", ",")} pts du corps électoral
            </p>
          ) : null}
        </li>
      </ul>

      {abstentionBlanc != null ? (
        <p className="text-xs text-veote-muted">
          Abstention / blanc / nul (hors exprimés) :{" "}
          {abstentionBlanc.toFixed(1).replace(".", ",")} pts
        </p>
      ) : null}
    </section>
  );
}
