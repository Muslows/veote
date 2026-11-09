/**
 * Requêtes Prisma Module B — lois & scrutins AN.
 * Copy-ready : remplacez l’import prisma selon votre arborescence.
 */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { LawSearchFilters } from "./search-params";

const lawListInclude = {
  sources: { include: { source: true }, take: 3 },
  votes: {
    orderBy: { votedOn: "desc" as const },
    take: 1,
    include: {
      sources: { include: { source: true }, take: 1 },
    },
  },
  authorGroup: true,
} satisfies Prisma.LawInclude;

export type LawListItem = Prisma.LawGetPayload<{
  include: typeof lawListInclude;
}>;

/** Construit le where Prisma à partir des filtres URL (serveur). */
export function buildLawWhere(
  filters: LawSearchFilters,
): Prisma.LawWhereInput {
  const where: Prisma.LawWhereInput = {
    chamber: "ASSEMBLEE_NATIONALE",
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { officialRef: { contains: filters.q, mode: "insensitive" } },
      { summary: { contains: filters.q, mode: "insensitive" } },
      { themeLabel: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.theme) {
    where.themeSlug = filters.theme;
  }

  // Chronologique « À partir du… » : date de vote principale >= selectedDate
  // (fallback adoptedOn / introducedOn si pas encore de vote lié)
  if (filters.from) {
    const fromDate = new Date(`${filters.from}T00:00:00.000Z`);
    if (!Number.isNaN(fromDate.getTime())) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { votes: { some: { votedOn: { gte: fromDate } } } },
            {
              AND: [
                { votes: { none: {} } },
                {
                  OR: [
                    { adoptedOn: { gte: fromDate } },
                    { introducedOn: { gte: fromDate } },
                  ],
                },
              ],
            },
          ],
        },
      ];
    }
  }

  // Filtre groupe parlementaire : lois où le groupe a une position agrégée
  if (filters.group) {
    where.votes = {
      some: {
        positions: {
          some: {
            isGroupAggregate: true,
            group: { slug: filters.group },
          },
        },
      },
    };
  }

  return where;
}

export async function searchLaws(filters: LawSearchFilters) {
  return prisma.law.findMany({
    where: buildLawWhere(filters),
    include: lawListInclude,
    orderBy: [{ adoptedOn: "desc" }, { introducedOn: "desc" }, { title: "asc" }],
  });
}

export async function listThemes() {
  const rows = await prisma.law.findMany({
    where: {
      chamber: "ASSEMBLEE_NATIONALE",
      themeSlug: { not: null },
    },
    distinct: ["themeSlug"],
    select: { themeSlug: true, themeLabel: true },
    orderBy: { themeLabel: "asc" },
  });
  return rows.filter(
    (r): r is { themeSlug: string; themeLabel: string | null } =>
      Boolean(r.themeSlug),
  );
}

export async function listParliamentaryGroupsForFilter(legislature?: number) {
  return prisma.parliamentaryGroup.findMany({
    where: {
      chamber: "ASSEMBLEE_NATIONALE",
      ...(legislature != null ? { legislature } : {}),
    },
    orderBy: [{ legislature: "desc" }, { acronym: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      acronym: true,
      legislature: true,
    },
  });
}

export async function getLawBySlug(slug: string) {
  return prisma.law.findUnique({
    where: { slug },
    include: {
      sources: { include: { source: true } },
      authorGroup: true,
      arguments: {
        include: { sources: { include: { source: true } } },
        orderBy: [{ camp: "asc" }, { sortOrder: "asc" }],
      },
      votes: {
        include: {
          sources: { include: { source: true } },
          positions: {
            where: { isGroupAggregate: true },
            include: { group: true },
            orderBy: [{ groupId: "asc" }, { position: "asc" }],
          },
        },
        orderBy: { votedOn: "desc" },
      },
    },
  });
}
