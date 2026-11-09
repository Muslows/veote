import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

import {
  SimulatorClient,
  edgesToReservoirs,
  toSimulatorPollOption,
} from "@/components/module-c/SimulatorClient";
import { parseSimulatorSearchParams } from "@/lib/module-c/share-params";
import {
  listCandidatesForSimulator,
  listPolls,
  listTransferMatrices,
} from "@/lib/module-c/queries";

/** SSR à chaque requête — évite le prerender build sans Postgres. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Simulateur de report de voix",
  description:
    "Hypothèse de 2ᵉ tour à partir d’un sondage 1er tour et de matrices 2017/2022 sourcées — ou mode personnalisé.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Simulateur 2ᵉ tour — URL partageable (?pollId&c1&c2&matrix&r).
 * Copier vers : app/c/simulateur/page.tsx
 */
export default async function SimulateurPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const initial = parseSimulatorSearchParams(raw);

  const [pollsRaw, matricesRaw, candidates] = await Promise.all([
    listPolls(),
    listTransferMatrices(),
    listCandidatesForSimulator(),
  ]);

  const polls = pollsRaw.map(toSimulatorPollOption);

  const matrices = matricesRaw.map((m) => ({
    id: m.id,
    slug: m.slug,
    label: m.label,
    electionYear: m.electionYear,
    origin: m.origin,
    finalistAId: m.finalistAId,
    finalistBId: m.finalistBId,
    source: m.sources[0]
      ? {
          label: m.sources[0].source.label,
          url: m.sources[0].source.url,
          organism: m.sources[0].source.organism,
        }
      : null,
    reservoirs: edgesToReservoirs(
      m.edges,
      m.finalistAId,
      m.finalistBId,
    ),
  }));

  // Préremplir finalistes depuis matrice si absents de l’URL
  let c1 = initial.c1;
  let c2 = initial.c2;
  if ((!c1 || !c2) && initial.matrix && initial.matrix !== "custom") {
    const m = matrices.find(
      (x) => x.slug === initial.matrix || x.id === initial.matrix,
    );
    if (m) {
      c1 = c1 ?? m.finalistAId;
      c2 = c2 ?? m.finalistBId;
    }
  }

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mb-6 text-sm text-veote-muted">
        <Link
          href="/c"
          className="text-veote-muted no-underline hover:text-veote-focus hover:underline"
        >
          ← Observatoire
        </Link>
      </nav>

      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-veote-accent">
          Module C · Simulateur
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-veote-text sm:text-4xl">
          Report de voix — 2ᵉ tour
        </h1>
        <p className="text-base leading-relaxed text-veote-muted">
          Choisissez un sondage de 1er tour, deux finalistes, puis une matrice
          post-électorale sourcée (2017 / 2022) ou le mode personnalisé (3
          curseurs verrouillés à 100&nbsp;% par électorat). Les scores sont en{" "}
          <strong className="font-medium text-veote-text">
            suffrages exprimés
          </strong>
          .
        </p>
      </header>

      <div className="mt-10">
        <SimulatorClient
          polls={polls}
          matrices={matrices}
          candidates={candidates}
          initial={{
            pollId: initial.pollId,
            c1,
            c2,
            matrix: initial.matrix,
            reservoirs: initial.reservoirs,
          }}
        />
      </div>
    </Container>
  );
}
