/** Formatage dates FR (UTC date-only Prisma @db.Date). */

const fmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const fmtShort = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return fmt.format(d);
}

export function formatDateShort(
  value: Date | string | null | undefined,
): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return fmtShort.format(d);
}

export function formatRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
): string {
  const a = formatDateShort(start);
  if (!end) return `${a} — en cours`;
  return `${a} — ${formatDateShort(end)}`;
}
