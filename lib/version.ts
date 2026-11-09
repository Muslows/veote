/**
 * Version affichée en UI (footer / header).
 * Règle : toute modification de code doit bumper APP_VERSION (v1.0.x) avant commit.
 */

export const APP_VERSION = "v1.0.1";

/**
 * Horodatage ISO injecté au build via `next.config` → `env.NEXT_PUBLIC_BUILD_TIME`.
 * Fallback : chaîne vide (le label utilise alors « inconnu » côté formatage).
 */
export const BUILD_TIME =
  process.env.NEXT_PUBLIC_BUILD_TIME ?? process.env.BUILD_TIME ?? "";

/** `Build vX.Y.Z • compilé le JJ/MM à HH:MM` (Europe/Paris). */
export function formatBuildLabel(iso = BUILD_TIME): string {
  if (!iso) {
    return `Build ${APP_VERSION} • compilé le —/— à —:—`;
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return `Build ${APP_VERSION} • compilé le —/— à —:—`;
  }

  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "—";

  return `Build ${APP_VERSION} • compilé le ${get("day")}/${get("month")} à ${get("hour")}:${get("minute")}`;
}
