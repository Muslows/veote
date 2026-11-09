"use client";

import { useRouter, usePathname } from "next/navigation";

type InstituteFilterProps = {
  institutes: string[];
  selected?: string | null;
  paramName?: string;
};

/**
 * Filtre institut — navigation URL (SSR-friendly, sans useSearchParams).
 */
export function InstituteFilter({
  institutes,
  selected,
  paramName = "institute",
}: InstituteFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  function onChange(value: string) {
    const next = new URLSearchParams();
    if (value) next.set(paramName, value);
    const q = next.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <label className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-3">
      <span className="text-veote-muted">Institut</span>
      <select
        className="rounded-md border border-veote-border bg-veote-card px-3 py-2 text-veote-text focus:border-veote-focus focus:outline-none"
        value={selected ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filtrer par institut"
      >
        <option value="">Tous les instituts</option>
        {institutes.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
