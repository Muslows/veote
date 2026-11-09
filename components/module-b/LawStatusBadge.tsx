type LawStatusBadgeProps = {
  status: string;
  adopted?: boolean | null;
  className?: string;
};

/**
 * Pastille statut loi / scrutin — accents neutres Slate Dark uniquement.
 */
export function LawStatusBadge({
  status,
  adopted,
  className = "",
}: LawStatusBadgeProps) {
  const label =
    status === "PROMULGUE"
      ? "Promulgué"
      : status === "ADOPTE" || adopted === true
        ? "Adopté"
        : status === "REJETE" || adopted === false
          ? "Rejeté"
          : status === "EN_COURS"
            ? "En cours"
            : status === "RETIRE"
              ? "Retiré"
              : status;

  const tone =
    status === "REJETE" || adopted === false
      ? "text-veote-muted ring-veote-border"
      : "text-veote-accent ring-veote-accent/40";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ${tone} ${className}`}
    >
      {label}
    </span>
  );
}
