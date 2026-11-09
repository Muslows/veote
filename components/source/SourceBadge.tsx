import type { ReactNode } from "react";

export type SourceBadgeProps = {
  /** Libellé court affiché (ex. « HATVP — Déclaration 2024 ») */
  label: string;
  /** URL canonique de la source officielle */
  href: string;
  /** Organisme émetteur optionnel */
  organism?: string;
  /** Date de publication / collecte affichée */
  dateLabel?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Badge de provenance obligatoire — lien externe sécurisé.
 * Pas de tracking ; ouverture nouvel onglet avec rel noopener.
 */
export function SourceBadge({
  label,
  href,
  organism,
  dateLabel,
  className = "",
  children,
}: SourceBadgeProps) {
  return (
    <aside
      className={`veote-panel inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md px-3 py-2 text-sm text-veote-muted ${className}`}
      aria-label={`Source : ${label}`}
    >
      <span className="font-medium uppercase tracking-wide text-veote-muted/80">
        Source
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-veote-text no-underline hover:text-veote-focus hover:underline"
      >
        {label}
        <span className="sr-only"> (ouvre un nouvel onglet)</span>
      </a>
      {organism ? (
        <span className="text-veote-muted">· {organism}</span>
      ) : null}
      {dateLabel ? (
        <time className="text-veote-muted/80">{dateLabel}</time>
      ) : null}
      {children}
    </aside>
  );
}
