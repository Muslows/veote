/**
 * Requêtes Prisma Module C — sondages & matrices de report.
 */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const pollListInclude = {
  sources: { include: { source: true }, take: 4 },
  results: {
    include: { candidate: true },
    orderBy: { percent: "desc" as const },
  },
} satisfies Prisma.PollInclude;

export type PollListItem = Prisma.PollGetPayload<{
  include: typeof pollListInclude;
}>;

export async function listPolls(opts?: { institute?: string | null }) {
  return prisma.poll.findMany({
    where: opts?.institute ? { institute: opts.institute } : undefined,
    include: pollListInclude,
    orderBy: [{ fieldworkEnd: "desc" }, { publishedOn: "desc" }],
  });
}

export async function listInstitutes(): Promise<string[]> {
  const rows = await prisma.poll.findMany({
    distinct: ["institute"],
    select: { institute: true },
    orderBy: { institute: "asc" },
  });
  return rows.map((r) => r.institute);
}

export async function getPollBySlug(slug: string) {
  return prisma.poll.findUnique({
    where: { slug },
    include: {
      sources: { include: { source: true } },
      results: {
        include: { candidate: true },
        orderBy: { percent: "desc" },
      },
      matrices: {
        include: {
          sources: { include: { source: true } },
          finalistA: true,
          finalistB: true,
        },
      },
    },
  });
}

export async function getPollById(id: string) {
  return prisma.poll.findUnique({
    where: { id },
    include: {
      sources: { include: { source: true } },
      results: {
        include: { candidate: true },
        orderBy: { percent: "desc" },
      },
    },
  });
}

/** Série pour Recharts — une ligne par candidat, points = sondages filtrables. */
export async function getEvolutionSeries(institute?: string | null) {
  const polls = await prisma.poll.findMany({
    where: {
      round: "PREMIER_TOUR",
      ...(institute ? { institute } : {}),
      // Inclut historiques + test (UI marque le test)
    },
    include: {
      results: {
        where: { candidateId: { not: null } },
        include: { candidate: true },
      },
      sources: { include: { source: true }, take: 2 },
    },
    orderBy: { fieldworkEnd: "asc" },
  });
  return polls;
}

export async function listTransferMatrices() {
  return prisma.voteTransferMatrix.findMany({
    include: {
      sources: { include: { source: true } },
      finalistA: true,
      finalistB: true,
      edges: {
        include: {
          fromCandidate: true,
          toCandidate: true,
        },
      },
      poll: true,
    },
    orderBy: [{ electionYear: "desc" }, { label: "asc" }],
  });
}

export async function getTransferMatrixBySlugOrId(key: string) {
  return prisma.voteTransferMatrix.findFirst({
    where: { OR: [{ slug: key }, { id: key }] },
    include: {
      sources: { include: { source: true } },
      finalistA: true,
      finalistB: true,
      edges: {
        include: { fromCandidate: true, toCandidate: true },
      },
      poll: true,
    },
  });
}

export async function listCandidatesForSimulator() {
  return prisma.candidate.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      slug: true,
      displayName: true,
      isDeclared2027: true,
    },
  });
}
