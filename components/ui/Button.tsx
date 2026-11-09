import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-veote-accent text-veote-text hover:bg-veote-focus focus-visible:ring-veote-focus",
  secondary:
    "bg-veote-card text-veote-text ring-1 ring-veote-border hover:bg-veote-accent-soft focus-visible:ring-veote-focus",
  ghost:
    "bg-transparent text-veote-muted hover:bg-veote-card hover:text-veote-text focus-visible:ring-veote-focus",
};

/**
 * Bouton neutre (CTA / actions) — accents slate/blue uniquement.
 */
export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-veote-bg",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
