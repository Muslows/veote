"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/candidats", label: "Candidats", module: "A" },
  { href: "/lois", label: "Lois", module: "B" },
  { href: "/sondages", label: "Sondages", module: "C" },
] as const;

/**
 * En-tête institutionnel — navigation Modules A / B / C.
 * Labels français. Pas de trackers ni de formulaires PII.
 */
export function SiteHeader() {
  const pathname = usePathname() ?? "";

  return (
    <header className="border-b border-veote-border/80 bg-veote-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2 no-underline"
          aria-label="Veote — accueil"
        >
          <span className="font-display text-2xl font-semibold tracking-tight text-veote-text transition-colors group-hover:text-veote-focus">
            Veote
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.14em] text-veote-muted sm:inline">
            Présidentielle 2027
          </span>
        </Link>

        <nav aria-label="Modules principaux">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors",
                      active
                        ? "bg-veote-card text-veote-text ring-1 ring-veote-border"
                        : "text-veote-muted hover:bg-veote-card/60 hover:text-veote-text",
                    ].join(" ")}
                  >
                    <span
                      className="hidden text-[0.65rem] font-semibold uppercase tracking-wider text-veote-accent sm:inline"
                      aria-hidden
                    >
                      {item.module}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
