/** Formatage dates FR (UTC date-only Prisma @db.Date) — Module B. */

const fmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return fmt.format(d);
}

export function statusLabel(
  status: string,
  adopted?: boolean | null,
): string {
  switch (status) {
    case "PROMULGUE":
      return "Promulgué";
    case "ADOPTE":
      return "Adopté";
    case "REJETE":
      return "Rejeté";
    case "RETIRE":
      return "Retiré";
    case "EN_COURS":
      return "En cours";
    default:
      return status;
  }
}

/** Statut vote d’un scrutin (adopté / rejeté). */
export function voteOutcomeLabel(adopted: boolean | null | undefined): string {
  if (adopted === true) return "Adopté";
  if (adopted === false) return "Rejeté";
  return "Résultat non renseigné";
}

export function authorKindLabel(kind: string): string {
  switch (kind) {
    case "GOUVERNEMENT":
      return "Gouvernement";
    case "GROUPE_PARLEMENTAIRE":
      return "Groupe parlementaire";
    case "DEPUTE":
      return "Député·e";
    default:
      return "Autre";
  }
}
