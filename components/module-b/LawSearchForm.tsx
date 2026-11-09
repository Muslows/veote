"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";

import { Button } from "@/components/ui/Button";

import {
  toLawSearchQuery,
  type LawSearchFilters,
} from "@/lib/module-b/search-params";

export type ThemeOption = { themeSlug: string; themeLabel: string | null };
export type GroupOption = {
  slug: string;
  name: string;
  acronym: string | null;
  legislature: number;
};

type LawSearchFormProps = {
  initial: LawSearchFilters;
  themes: ThemeOption[];
  groups: GroupOption[];
  /** Délai debounce (ms) pour la barre mot-clé — prêt pour saisie live */
  debounceMs?: number;
};

/**
 * Filtres Module B — keyword + thème + groupe + « À partir du… ».
 * Pattern debounce : la saisie `q` attend debounceMs avant navigation ;
 * les selects / date soumettent immédiatement.
 */
export function LawSearchForm({
  initial,
  themes,
  groups,
  debounceMs = 300,
}: LawSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<LawSearchFilters>(initial);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextDebounce = useRef(false);

  const push = useCallback(
    (next: LawSearchFilters) => {
      startTransition(() => {
        router.push(`${pathname}${toLawSearchQuery(next)}`);
      });
    },
    [pathname, router],
  );

  // Debounce keyword only
  useEffect(() => {
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }
    if (filters.q === initial.q) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      push({ ...filters, q: filters.q });
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce on q only
  }, [filters.q, debounceMs]);

  // Sync from URL when navigation settles
  useEffect(() => {
    skipNextDebounce.current = true;
    setFilters(initial);
  }, [initial]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    push(filters);
  }

  function updateImmediate(
    patch: Partial<LawSearchFilters>,
  ) {
    const next = { ...filters, ...patch };
    skipNextDebounce.current = true;
    setFilters(next);
    push(next);
  }

  function reset() {
    skipNextDebounce.current = true;
    setFilters({ q: "", theme: "", group: "", from: "" });
    push({ q: "", theme: "", group: "", from: "" });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="veote-panel space-y-4 rounded-lg p-4 sm:p-5"
      role="search"
      aria-label="Filtrer les lois et scrutins"
      data-pending={isPending ? "true" : "false"}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-1.5 sm:col-span-2 lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-veote-muted">
            Mot-clé
          </span>
          <input
            type="search"
            name="q"
            value={filters.q}
            onChange={(e) =>
              setFilters((f) => ({ ...f, q: e.target.value }))
            }
            placeholder="Titre, référence, thème…"
            className="w-full rounded-md border border-veote-border bg-veote-bg px-3 py-2 text-sm text-veote-text placeholder:text-veote-muted/70 focus:border-veote-focus focus:outline-none focus:ring-1 focus:ring-veote-focus"
            autoComplete="off"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-veote-muted">
            Thème
          </span>
          <select
            name="theme"
            value={filters.theme}
            onChange={(e) => updateImmediate({ theme: e.target.value })}
            className="w-full rounded-md border border-veote-border bg-veote-bg px-3 py-2 text-sm text-veote-text focus:border-veote-focus focus:outline-none focus:ring-1 focus:ring-veote-focus"
          >
            <option value="">Tous les thèmes</option>
            {themes.map((t) => (
              <option key={t.themeSlug} value={t.themeSlug}>
                {t.themeLabel ?? t.themeSlug}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-veote-muted">
            Groupe parlementaire
          </span>
          <select
            name="group"
            value={filters.group}
            onChange={(e) => updateImmediate({ group: e.target.value })}
            className="w-full rounded-md border border-veote-border bg-veote-bg px-3 py-2 text-sm text-veote-text focus:border-veote-focus focus:outline-none focus:ring-1 focus:ring-veote-focus"
          >
            <option value="">Tous les groupes</option>
            {groups.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.acronym
                  ? `${g.acronym} — ${g.name} (L${g.legislature})`
                  : `${g.name} (L${g.legislature})`}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5 sm:col-span-2 lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-veote-muted">
            À partir du…
          </span>
          <input
            type="date"
            name="from"
            value={filters.from}
            onChange={(e) => updateImmediate({ from: e.target.value })}
            className="w-full rounded-md border border-veote-border bg-veote-bg px-3 py-2 text-sm text-veote-text focus:border-veote-focus focus:outline-none focus:ring-1 focus:ring-veote-focus"
          />
          <span className="block text-xs text-veote-muted">
            Filtre chronologique serveur : date de scrutin ≥ date choisie.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={isPending}>
          Rechercher
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Réinitialiser
        </Button>
        {isPending ? (
          <span className="self-center text-xs text-veote-muted">
            Filtrage…
          </span>
        ) : null}
      </div>
    </form>
  );
}
