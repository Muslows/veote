/** Formatage dates / nombres FR — Module C sondages. */

const fmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const fmtShort = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
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

/** Terrain : « 8 avril 2022 » ou « 18 – 20 avril 2017 ». */
export function formatFieldworkRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
): string {
  if (!start && !end) return "—";
  const a = formatDate(start);
  const b = formatDate(end);
  if (!start) return b;
  if (!end || a === b) return a;
  return `${a} – ${b}`;
}

export function formatPercent(
  value: number | string | { toNumber?: () => number } | null | undefined,
  digits = 1,
): string {
  if (value == null) return "—";
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : typeof value.toNumber === "function"
          ? value.toNumber()
          : Number(value);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(digits).replace(".", ",")} %`;
}

export function formatSampleSize(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function toNumber(
  value: number | string | { toNumber?: () => number } | null | undefined,
): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value) || 0;
}
