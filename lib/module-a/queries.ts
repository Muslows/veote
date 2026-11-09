/**
 * Requêtes Prisma Module A — à brancher sur lib/prisma.ts du projet.
 * Copy-ready : remplacez l’import prisma selon votre arborescence.
 */

import { prisma } from "@/lib/prisma";

export async function listCandidates() {
  return prisma.candidate.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      affiliations: {
        where: { endedOn: null },
        include: { party: true },
        orderBy: { startedOn: "desc" },
        take: 1,
      },
      sources: { include: { source: true }, take: 1 },
    },
  });
}

export async function getCandidateBySlug(slug: string) {
  return prisma.candidate.findUnique({
    where: { slug },
    include: {
      sources: { include: { source: true } },
      affiliations: {
        include: {
          party: true,
          sources: { include: { source: true } },
        },
        orderBy: { startedOn: "desc" },
      },
      mandates: {
        include: { sources: { include: { source: true } } },
        orderBy: { startedOn: "desc" },
      },
      hatvpDecls: {
        include: {
          assets: true,
          interests: true,
          sources: { include: { source: true } },
        },
        orderBy: { publishedOn: "desc" },
      },
    },
  });
}

export async function getPartyBySlug(slug: string) {
  return prisma.politicalParty.findUnique({
    where: { slug },
    include: {
      sources: { include: { source: true } },
      historyAsSubject: {
        include: {
          participants: {
            include: { party: true },
            orderBy: { sortOrder: "asc" },
          },
          sources: { include: { source: true } },
        },
        orderBy: { effectiveOn: "asc" },
      },
      historyParticipations: {
        include: {
          history: {
            include: {
              subjectParty: true,
              participants: {
                include: { party: true },
                orderBy: { sortOrder: "asc" },
              },
              sources: { include: { source: true } },
            },
          },
        },
        orderBy: { history: { effectiveOn: "asc" } },
      },
      affiliations: {
        include: { candidate: true },
        where: { endedOn: null },
        orderBy: { startedOn: "desc" },
        take: 24,
      },
    },
  });
}

export async function listParties() {
  return prisma.politicalParty.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      sources: { include: { source: true }, take: 1 },
    },
  });
}
