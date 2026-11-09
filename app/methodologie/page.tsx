import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Méthodologie & mentions légales",
  description:
    "Critères de sélection des candidats, sources officielles, fonctionnement du simulateur de report de voix, et rappel de la loi du 19 juillet 1977 sur les sondages.",
};

/**
 * Page institutionnelle neutre — méthodologie + mentions légales.
 * Copier vers : app/methodologie/page.tsx
 * Lien footer : SiteFooter → /methodologie
 */
export default function MethodologiePage() {
  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Transparence
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          Méthodologie &amp; mentions légales
        </h1>
        <p className="text-base leading-relaxed text-veote-muted">
          Veote est une plateforme civic-tech neutre consacrée à la
          présidentielle française. Cette page décrit comment les figures sont
          indexées, d’où viennent les données, comment fonctionne le simulateur
          de report de voix, et le cadre légal applicable aux sondages.
        </p>
      </header>

      <div className="mt-12 max-w-3xl space-y-12 text-base leading-relaxed text-veote-muted">
        <section aria-labelledby="selection" className="space-y-3">
          <h2
            id="selection"
            className="font-display text-xl font-semibold text-veote-text"
          >
            Critères objectifs de sélection des candidats
          </h2>
          <p>
            L’index Module&nbsp;A n’est pas un classement d’intentions de vote
            inventées. Une figure peut être référencée lorsqu’au moins un des
            critères objectifs suivants est documenté par une source publique
            vérifiable&nbsp;:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-veote-text">
                Parrainages
              </strong>{" "}
              — publication ou suivi des parrainages d’élus pour l’élection
              présidentielle (Conseil constitutionnel / sources officielles
              associées), dès qu’ils sont disponibles pour le cycle en cours.
            </li>
            <li>
              <strong className="font-medium text-veote-text">
                Représentation parlementaire
              </strong>{" "}
              — mandat ou parcours documenté à l’Assemblée nationale (Open Data
              AN, Sycomore), utile pour contextualiser votes et affiliations.
            </li>
            <li>
              <strong className="font-medium text-veote-text">
                Sondages nationaux sourcés
              </strong>{" "}
              — présence dans des intentions de vote nationales publiées avec
              les mentions obligatoires (institut, commanditaire, terrain,
              échantillon, marge) et une notice accessible. Les structures
              pédagogiques de test sont explicitement labellisées{" "}
              <em>
                [Sondage de test - Structure Commission des sondages]
              </em>{" "}
              et ne sont jamais présentées comme intentions officielles 2027.
            </li>
          </ul>
          <p>
            L’inclusion d’une fiche n’implique aucune préférence éditoriale.
            Chaque bloc de données porte une provenance (SourceBadge).
          </p>
        </section>

        <section aria-labelledby="sources" className="space-y-3">
          <h2
            id="sources"
            className="font-display text-xl font-semibold text-veote-text"
          >
            Sources officielles
          </h2>
          <p>Les données affichées s’appuient principalement sur&nbsp;:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-veote-text">
                Open Data Assemblée nationale
              </strong>{" "}
              — dossiers législatifs et scrutins (
              <a
                href="https://data.assemblee-nationale.fr/"
                className="text-veote-accent underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                data.assemblee-nationale.fr
              </a>
              ), synchronisés via{" "}
              <code className="text-veote-text">scripts/sync-an.ts</code>.
            </li>
            <li>
              <strong className="font-medium text-veote-text">HATVP</strong>{" "}
              — déclarations d’intérêts et de patrimoine (
              <a
                href="https://www.hatvp.fr/"
                className="text-veote-accent underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                hatvp.fr
              </a>
              ). Les lignes détail sont optionnelles&nbsp;; sans import Veote,
              l’interface renvoie vers le portail officiel.
            </li>
            <li>
              <strong className="font-medium text-veote-text">
                Vie-publique.fr
              </strong>{" "}
              — dossiers et chronologies institutionnelles (
              <a
                href="https://www.vie-publique.fr/"
                className="text-veote-accent underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                vie-publique.fr
              </a>
              ).
            </li>
            <li>
              <strong className="font-medium text-veote-text">
                Commission des sondages
              </strong>{" "}
              — notices et cadre de publication des sondages électoraux (
              <a
                href="https://www.commission-des-sondages.fr/"
                className="text-veote-accent underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                commission-des-sondages.fr
              </a>
              ), complétés par les publications des instituts.
            </li>
          </ul>
          <p>
            Aucun cookie de suivi, aucune collecte de données personnelles
            utilisateur (RGPD). Pas de compte, pas de formulaire PII.
          </p>
        </section>

        <section aria-labelledby="simulateur" className="space-y-3">
          <h2
            id="simulateur"
            className="font-display text-xl font-semibold text-veote-text"
          >
            Fonctionnement mathématique du simulateur de report
          </h2>
          <p>
            Le simulateur (Module&nbsp;C) projette un second tour à partir
            d’intentions de premier tour et d’une matrice de report. Il ne
            prédit pas le résultat officiel&nbsp;: c’est un outil pédagogique
            transparent.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Pour chaque électorat du 1<sup>er</sup> tour (candidat éliminé ou
              finaliste), on dispose d’un triplet de pourcentages&nbsp;: part
              reportée vers le finaliste&nbsp;A, vers le finaliste&nbsp;B, et
              vers l’abstention / blanc / nul. La somme du triplet est
              verrouillée à <strong className="font-medium text-veote-text">
                100&nbsp;%
              </strong>{" "}
              (mode personnalisé inclus).
            </li>
            <li>
              Contribution au score&nbsp;A = part 1<sup>er</sup> tour × (%
              →&nbsp;A) / 100 (idem pour B et abstention/blanc).
            </li>
            <li>
              Les scores bruts A et B sont ensuite renormalisés en{" "}
              <strong className="font-medium text-veote-text">
                suffrages exprimés
              </strong>
              &nbsp;:{" "}
              <code className="text-veote-text">
                exprimésA = 100 × scoreA / (scoreA + scoreB)
              </code>
              .
            </li>
            <li>
              Les matrices préconfigurées sont soit liées à un sondage (
              <code className="text-veote-text">POLL_LINKED</code>), soit
              éditoriales post-électorales sourcées (
              <code className="text-veote-text">EDITORIAL_SOURCED</code>, ex.
              sociologie Ipsos 2017 / 2022). Une URL partageable encode
              sondage, finalistes et paramètres de report.
            </li>
          </ol>
          <p>
            Implémentation de référence&nbsp;:{" "}
            <code className="text-veote-text">
              lib/module-c/transfer-math.ts
            </code>
            .
          </p>
        </section>

        <section aria-labelledby="loi-1977" className="space-y-3">
          <h2
            id="loi-1977"
            className="font-display text-xl font-semibold text-veote-text"
          >
            Rappel légal — loi du 19 juillet 1977
          </h2>
          <p>
            La loi n°&nbsp;77-808 du 19 juillet 1977 relative à la publication
            et à la diffusion de certains sondages d’opinion encadre la
            publication des sondages électoraux en France. En particulier, toute
            publication doit permettre d’identifier l’institut, le
            commanditaire, la période de terrain, la taille de l’échantillon,
            la marge d’erreur et la méthodologie, et renvoyer vers les
            informations déposées auprès de la Commission des sondages.
          </p>
          <p>
            Veote affiche ces mentions via le bloc de conformité de chaque
            sondage et n’édite pas d’intentions 2027 présentées comme
            officielles lorsqu’elles ne le sont pas. Les exemples pédagogiques
            sont clairement marqués comme structures de test.
          </p>
          <p>
            Texte de référence (Légifrance)&nbsp;:{" "}
            <a
              href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000522221"
              className="text-veote-accent underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              loi du 19 juillet 1977
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="mentions" className="space-y-3">
          <h2
            id="mentions"
            className="font-display text-xl font-semibold text-veote-text"
          >
            Mentions légales (hébergement)
          </h2>
          <p>
            Éditeur&nbsp;: projet Veote (civic-tech indépendante). Hébergement
            applicatif prévu sur o2switch (France) — Node.js via Phusion
            Passenger, base PostgreSQL. Contact et raison sociale définitifs à
            compléter avant mise en production publique.
          </p>
          <p>
            Contenu sourcé à caractère informatif&nbsp;; Veote n’est affiliée à
            aucun parti, candidat ou institut de sondage.
          </p>
        </section>

        <p className="border-t border-veote-border pt-8">
          <Link
            href="/"
            className="text-veote-accent no-underline hover:underline"
          >
            ← Retour à l’accueil
          </Link>
        </p>
      </div>
    </Container>
  );
}
