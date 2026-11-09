/**
 * Parsing des filtres Module B (URL search params).
 * Côté serveur : page.tsx lit searchParams.
 * Côté client : LawSearchForm pousse les mêmes clés (debounce prêt).
 */

export type LawSearchFilters = {
  q: string;
  theme: string;
  group: string;
  /** ISO date YYYY-MM-DD — filtre chronologique « À partir du… » (date >=) */
  from: string;
};

export const EMPTY_FILTERS: LawSearchFilters = {
  q: "",
  theme: "",
  group: "",
  from: "",
};

export function parseLawSearchParams(
  raw: Record<string, string | string[] | undefined> | URLSearchParams,
): LawSearchFilters {
  const get = (key: string): string => {
    if (raw instanceof URLSearchParams) {
      return (raw.get(key) ?? "").trim();
    }
    const v = raw[key];
    if (Array.isArray(v)) return (v[0] ?? "").trim();
    return (v ?? "").trim();
  };

  return {
    q: get("q"),
    theme: get("theme"),
    group: get("group"),
    from: get("from"),
  };
}

/** Construit une query string sans paramètres vides. */
export function toLawSearchQuery(filters: LawSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.theme) params.set("theme", filters.theme);
  if (filters.group) params.set("group", filters.group);
  if (filters.from) params.set("from", filters.from);
  const s = params.toString();
  return s ? `?${s}` : "";
}
