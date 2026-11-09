/**
 * Helpers HATVP Module A — lignes détail optionnelles + fallback portail.
 */

export const HATVP_PORTAL_URL = "https://www.hatvp.fr/";
export const HATVP_PORTAL_LABEL = "Portail HATVP";

export type HatvpInterestLine = {
  id: string;
  category: string;
  label: string;
  organization: string | null;
  startedOn: Date | null;
  endedOn: Date | null;
  notes: string | null;
};

export type HatvpAssetLine = {
  id: string;
  category: string;
  label: string;
  /** Jamais inventé — uniquement si présent en base depuis source HATVP */
  amountEuros: { toString(): string } | null;
  notes: string | null;
};

export type HatvpDeclarationView = {
  id: string;
  kind: string;
  hatvpUrl: string;
  mandateLabel: string | null;
  summary: string | null;
  declaredOn: Date | null;
  publishedOn: Date | null;
  assets: HatvpAssetLine[];
  interests: HatvpInterestLine[];
  sources: {
    source: {
      label: string;
      url: string;
      organism: string | null;
      publishedAt: Date | null;
    };
  }[];
};

/**
 * true si aucune déclaration importée → UI doit afficher le portail général.
 */
export function needsHatvpPortalFallback(
  declarations: HatvpDeclarationView[] | null | undefined,
): boolean {
  return !declarations || declarations.length === 0;
}

/**
 * true si une déclaration existe mais sans lignes détail (cas normal / optionnel).
 */
export function hasNoDetailLines(declaration: HatvpDeclarationView): boolean {
  return declaration.assets.length === 0 && declaration.interests.length === 0;
}
