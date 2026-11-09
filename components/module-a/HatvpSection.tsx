import { SourceBadge } from "@/components/source/SourceBadge";

import { formatDate } from "@/lib/module-a/format";
import {
  HATVP_PORTAL_LABEL,
  HATVP_PORTAL_URL,
  hasNoDetailLines,
  needsHatvpPortalFallback,
  type HatvpDeclarationView,
} from "@/lib/module-a/hatvp";

type HatvpSectionProps = {
  declarations: HatvpDeclarationView[];
  candidateName: string;
};

/**
 * Section HATVP — lignes détail optionnelles.
 * Sans déclaration importée → portail général + SourceBadge (pas d’état vide cassé).
 */
export function HatvpSection({
  declarations,
  candidateName,
}: HatvpSectionProps) {
  if (needsHatvpPortalFallback(declarations)) {
    return (
      <section className="veote-panel space-y-4 rounded-lg p-5" id="hatvp">
        <header className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-veote-text">
            Transparence HATVP
          </h2>
          <p className="text-sm text-veote-muted">
            Aucune déclaration nominative récente n’est encore indexée pour{" "}
            {candidateName}. Consultez le portail officiel de la Haute
            Autorité.
          </p>
        </header>
        <SourceBadge
          label={HATVP_PORTAL_LABEL}
          href={HATVP_PORTAL_URL}
          organism="Haute Autorité pour la transparence de la vie publique"
        />
        <p className="text-sm text-veote-muted">
          <a
            href={HATVP_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-veote-accent hover:text-veote-focus"
          >
            Ouvrir hatvp.fr
          </a>
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6" id="hatvp">
      <header className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-veote-text">
          Transparence HATVP
        </h2>
        <p className="text-sm text-veote-muted">
          Les lignes patrimoine / intérêts détaillées sont optionnelles : une
          fiche peut renvoyer vers HATVP sans montants stockés localement.
        </p>
      </header>

      {declarations.map((decl) => {
        const primarySource = decl.sources[0]?.source;
        const emptyDetails = hasNoDetailLines(decl);

        return (
          <article
            key={decl.id}
            className="veote-panel space-y-4 rounded-lg p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-semibold text-veote-text">
                {decl.mandateLabel ?? `Déclaration ${decl.kind}`}
              </h3>
              <span className="text-xs uppercase tracking-wide text-veote-muted">
                {decl.kind}
              </span>
            </div>

            {decl.summary ? (
              <p className="text-sm leading-relaxed text-veote-muted">
                {decl.summary}
              </p>
            ) : null}

            <p className="text-sm text-veote-muted">
              <a
                href={decl.hatvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-veote-accent hover:text-veote-focus"
              >
                Voir sur HATVP
              </a>
              {decl.publishedOn || decl.declaredOn ? (
                <span>
                  {" "}
                  · {formatDate(decl.publishedOn ?? decl.declaredOn)}
                </span>
              ) : null}
            </p>

            {primarySource ? (
              <SourceBadge
                label={primarySource.label}
                href={primarySource.url}
                organism={primarySource.organism ?? undefined}
                dateLabel={
                  primarySource.publishedAt
                    ? formatDate(primarySource.publishedAt)
                    : undefined
                }
              />
            ) : (
              <SourceBadge
                label={HATVP_PORTAL_LABEL}
                href={HATVP_PORTAL_URL}
                organism="HATVP"
              />
            )}

            {emptyDetails ? (
              <p className="rounded-md border border-dashed border-veote-border bg-veote-bg/40 px-3 py-3 text-sm text-veote-muted">
                Pas de lignes détail (actifs / intérêts) importées pour cette
                déclaration. Utilisez le lien HATVP ci-dessus — aucun montant
                n’a été inventé.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {decl.interests.length > 0 ? (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-veote-muted">
                      Intérêts / activités
                    </h4>
                    <ul className="space-y-2">
                      {decl.interests.map((row) => (
                        <li
                          key={row.id}
                          className="border-t border-veote-border/60 pt-2 text-sm"
                        >
                          <p className="font-medium text-veote-text">
                            {row.label}
                          </p>
                          <p className="text-veote-muted">
                            {row.category}
                            {row.organization ? ` · ${row.organization}` : ""}
                          </p>
                          {row.notes ? (
                            <p className="mt-1 text-xs text-veote-muted/80">
                              {row.notes}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {decl.assets.length > 0 ? (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-veote-muted">
                      Patrimoine (lignes sourcées)
                    </h4>
                    <ul className="space-y-2">
                      {decl.assets.map((row) => (
                        <li
                          key={row.id}
                          className="border-t border-veote-border/60 pt-2 text-sm"
                        >
                          <p className="font-medium text-veote-text">
                            {row.label}
                          </p>
                          <p className="text-veote-muted">{row.category}</p>
                          {row.amountEuros != null ? (
                            <p className="text-veote-text">
                              {row.amountEuros.toString()} €
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
