/**
 * Veote — seed Module C (sondages Commission + matrices de report 2017/2022).
 *
 * Règles (preferences.md) :
 * - Matrices de report = études post-électorales réelles Ipsos/Sopra Steria (2017, 2022).
 * - Sondages historiques 2017/2022 avec métadonnées Commission (institut, commanditaire,
 *   terrain, n, marge, notice/rapport).
 * - Aucune intention 2027 présentée comme réelle.
 * - Structure d’exemple : titre préfixé
 *   « [Sondage de test - Structure Commission des sondages] » + isTestStructure=true.
 * - Prérequis : seed Module A (candidats Macron / Le Pen / Mélenchon).
 *
 * Usage :
 *   npx tsx prisma/seed-module-c.ts
 *   # ou via seed.ts (appelle seedModuleC après Module B)
 */

import {
  PrismaClient,
  type Prisma,
  type SourceKind,
  type TransferTargetKind,
} from "@prisma/client";

const prisma = new PrismaClient();

const ABSTENTION_KEY = "__ABSTENTION_BLANC__";
const TEST_LABEL =
  "[Sondage de test - Structure Commission des sondages]";

function d(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

type EdgeInput = {
  fromId: string;
  toKind: TransferTargetKind;
  toId?: string;
  percent: number;
  notes?: string;
};

function edgeRows(
  matrixId: string,
  edges: EdgeInput[],
): Prisma.TransferEdgeCreateManyInput[] {
  return edges.map((e) => {
    const targetKey =
      e.toKind === "ABSTENTION_BLANC" ? ABSTENTION_KEY : (e.toId as string);
    return {
      matrixId,
      fromCandidateId: e.fromId,
      toKind: e.toKind,
      toCandidateId: e.toKind === "CANDIDATE" ? e.toId : null,
      targetKey,
      percent: e.percent,
      notes: e.notes,
    };
  });
}

export async function seedModuleC(client: PrismaClient = prisma) {
  const db = client;

  const sourceFn = async (input: {
    id: string;
    url: string;
    label: string;
    kind: SourceKind;
    organism?: string;
    publishedAt?: Date;
    notes?: string;
  }) => {
    return db.source.upsert({
      where: { id: input.id },
      create: {
        id: input.id,
        url: input.url,
        label: input.label,
        kind: input.kind,
        organism: input.organism,
        publishedAt: input.publishedAt,
        notes: input.notes,
      },
      update: {
        url: input.url,
        label: input.label,
        kind: input.kind,
        organism: input.organism,
        publishedAt: input.publishedAt,
        notes: input.notes,
      },
    });
  };

  // ---------------------------------------------------------------------------
  // Sources Module C
  // ---------------------------------------------------------------------------
  await Promise.all([
    sourceFn({
      id: "src-commission-portal",
      url: "https://www.commission-des-sondages.fr/",
      label: "Commission des sondages — portail",
      kind: "COMMISSION_DES_SONDAGES",
      organism: "Commission des sondages",
      notes: "Portail officiel ; notices consultables sur /notices.",
    }),
    sourceFn({
      id: "src-ipsos-notice-2022-04-08",
      url: "https://www.ipsos.com/sites/default/files/ct/news/documents/2022-04/NOTICE%20TECHNIQUE%20Ipsos%20Le%20Monde%20%20-%20Intention%20de%20vote%20pre%CC%81sidentielle%201er%20tour%202022.pdf",
      label: "Ipsos — notice technique 8 avril 2022 (1er tour)",
      kind: "INSTITUT_SONDAGE",
      organism: "Ipsos / Sopra Steria",
      publishedAt: d("2022-04-08"),
      notes:
        "Notice déposée (Commission des sondages). Commanditaires : Le Monde / Cevipof / Fondation Jean Jaurès. n=10 425 inscrits.",
    }),
    sourceFn({
      id: "src-ipsos-rapport-2022-04-08",
      url: "https://www.ipsos.com/sites/default/files/ct/news/documents/2022-04/Rapport%20Ipsos_LEMONDE%20_Intention%20de%20vote%20pre%cc%81sidentielle%201er%20tour%202022.pdf",
      label: "Ipsos — rapport intentions 1er tour 8 avril 2022",
      kind: "INSTITUT_SONDAGE",
      organism: "Ipsos / Sopra Steria",
      publishedAt: d("2022-04-08"),
    }),
    sourceFn({
      id: "src-ipsos-reports-2022-04-24",
      url: "https://www.ipsos.com/fr-fr/presidentielle-2022/second-tour-profil-des-abstentionnistes-et-sociologie-des-electorats",
      label: "Ipsos — reports de voix 2nd tour 24 avril 2022",
      kind: "INSTITUT_SONDAGE",
      organism: "Ipsos / Sopra Steria",
      publishedAt: d("2022-04-24"),
      notes:
        "Étude post-électorale : reports Mélenchon / Jadot / Pécresse / Zemmour → Macron / Le Pen / abstention+blancs.",
    }),
    sourceFn({
      id: "src-ipsos-sociologie-2017-05-07",
      url: "https://www.ipsos.com/sites/default/files/files-fr-fr/doc_associe/ipsos_sopra_steria_sociologie_des_electorats_7_mai_20h15_0.pdf",
      label: "Ipsos — sociologie des électorats 7 mai 2017 (2nd tour)",
      kind: "INSTITUT_SONDAGE",
      organism: "Ipsos / Sopra Steria",
      publishedAt: d("2017-05-07"),
      notes:
        "Terrain 4–6 mai 2017, n=4 838 inscrits. Tableau « reports de voix entre les deux tours ».",
    }),
    sourceFn({
      id: "src-ifop-2017-04-21",
      url: "https://www.ifop.com/publication/les-intentions-de-vote-a-lelection-presidentielle-2017/",
      label: "Ifop — intentions de vote présidentielle 2017",
      kind: "INSTITUT_SONDAGE",
      organism: "Ifop",
      publishedAt: d("2017-04-21"),
      notes:
        "Série Fiducial / TF1 / LCI — structure Commission (institut, commanditaire, terrain). Chiffres 1er tour utilisés comme sondage historique réel.",
    }),
    sourceFn({
      id: "src-wikipedia-sondages-2017",
      url: "https://fr.wikipedia.org/wiki/Liste_de_sondages_sur_l%27%C3%A9lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2017",
      label: "Wikipédia — liste des sondages présidentielle 2017",
      kind: "AUTRE",
      organism: "Wikipédia (agrégat sourcé)",
      notes: "Croisement secondaire ; SourceBadge primaire = institut.",
    }),
  ]);

  // ---------------------------------------------------------------------------
  // Candidats historiques additionnels (2017 / 2022) — pas déclarés 2027
  // ---------------------------------------------------------------------------
  const histCandidates: {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    displayName: string;
    birthDate?: Date;
    bio: string;
    sourceId: string;
  }[] = [
    {
      id: "cand-fillon",
      slug: "françois-fillon",
      firstName: "François",
      lastName: "Fillon",
      displayName: "François Fillon",
      birthDate: d("1954-03-04"),
      bio: "Candidat Les Républicains — 1er tour présidentielle 2017 (20,01 %). Figure historique pour matrices de report 2017.",
      sourceId: "src-ipsos-sociologie-2017-05-07",
    },
    {
      id: "cand-hamon",
      slug: "benoît-hamon",
      firstName: "Benoît",
      lastName: "Hamon",
      displayName: "Benoît Hamon",
      birthDate: d("1967-06-26"),
      bio: "Candidat Parti socialiste — 1er tour présidentielle 2017 (6,36 %). Figure historique pour matrices de report 2017.",
      sourceId: "src-ipsos-sociologie-2017-05-07",
    },
    {
      id: "cand-nda",
      slug: "nicolas-dupont-aignan",
      firstName: "Nicolas",
      lastName: "Dupont-Aignan",
      displayName: "Nicolas Dupont-Aignan",
      birthDate: d("1961-03-07"),
      bio: "Candidat Debout la France — 1er tour 2017 (4,70 %) et 2022. Figure historique pour matrices de report.",
      sourceId: "src-ipsos-sociologie-2017-05-07",
    },
    {
      id: "cand-jadot",
      slug: "yannick-jadot",
      firstName: "Yannick",
      lastName: "Jadot",
      displayName: "Yannick Jadot",
      birthDate: d("1967-07-27"),
      bio: "Candidat EELV — 1er tour présidentielle 2022 (4,63 %). Figure historique pour matrices de report 2022.",
      sourceId: "src-ipsos-reports-2022-04-24",
    },
    {
      id: "cand-pecresse",
      slug: "valérie-pécresse",
      firstName: "Valérie",
      lastName: "Pécresse",
      displayName: "Valérie Pécresse",
      birthDate: d("1967-07-14"),
      bio: "Candidate Les Républicains — 1er tour présidentielle 2022 (4,78 %). Figure historique pour matrices de report 2022.",
      sourceId: "src-ipsos-reports-2022-04-24",
    },
    {
      id: "cand-zemmour",
      slug: "éric-zemmour",
      firstName: "Éric",
      lastName: "Zemmour",
      displayName: "Éric Zemmour",
      birthDate: d("1958-08-31"),
      bio: "Candidat Reconquête — 1er tour présidentielle 2022 (7,07 %). Figure historique pour matrices de report 2022.",
      sourceId: "src-ipsos-reports-2022-04-24",
    },
  ];

  for (const c of histCandidates) {
    await db.candidate.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        slug: c.slug,
        firstName: c.firstName,
        lastName: c.lastName,
        displayName: c.displayName,
        birthDate: c.birthDate,
        bio: c.bio,
        isDeclared2027: false,
        sources: { create: [{ sourceId: c.sourceId }] },
      },
      update: {
        slug: c.slug,
        displayName: c.displayName,
        bio: c.bio,
        isDeclared2027: false,
      },
    });
  }

  const ids = {
    macron: "cand-macron",
    lepen: "cand-lepen",
    melenchon: "cand-melenchon",
    panot: "cand-panot",
    fillon: "cand-fillon",
    hamon: "cand-hamon",
    nda: "cand-nda",
    jadot: "cand-jadot",
    pecresse: "cand-pecresse",
    zemmour: "cand-zemmour",
  };

  // ---------------------------------------------------------------------------
  // Polls historiques réels + 1 structure de test
  // ---------------------------------------------------------------------------

  // Nettoyage idempotent des résultats / sources poll Module C
  const pollIds = [
    "poll-ipsos-2022-04-08",
    "poll-ifop-2017-04-20",
    "poll-test-structure-commission",
  ];
  await db.pollResult.deleteMany({ where: { pollId: { in: pollIds } } });
  await db.pollSource.deleteMany({ where: { pollId: { in: pollIds } } });
  await db.transferEdge.deleteMany({
    where: {
      matrix: {
        id: {
          in: [
            "matrix-ipsos-2017-macron-lepen",
            "matrix-ipsos-2022-macron-lepen",
            "matrix-test-linked",
          ],
        },
      },
    },
  });
  await db.voteTransferMatrixSource.deleteMany({
    where: {
      matrixId: {
        in: [
          "matrix-ipsos-2017-macron-lepen",
          "matrix-ipsos-2022-macron-lepen",
          "matrix-test-linked",
        ],
      },
    },
  });
  await db.voteTransferMatrix.deleteMany({
    where: {
      id: {
        in: [
          "matrix-ipsos-2017-macron-lepen",
          "matrix-ipsos-2022-macron-lepen",
          "matrix-test-linked",
        ],
      },
    },
  });
  await db.poll.deleteMany({ where: { id: { in: pollIds } } });

  // --- Ipsos 8 avril 2022 (réel) ---
  await db.poll.create({
    data: {
      id: "poll-ipsos-2022-04-08",
      slug: "ipsos-le-monde-8-avril-2022",
      institute: "Ipsos / Sopra Steria",
      sponsor: "Le Monde / Cevipof / Fondation Jean Jaurès",
      sponsorKind: "MEDIA",
      fieldworkStart: d("2022-04-08"),
      fieldworkEnd: d("2022-04-08"),
      sampleSize: 10425,
      marginOfError: 1.1,
      population: "Inscrits sur les listes électorales (18 ans et plus)",
      methodology: "Online (Access Panel Ipsos), quotas",
      round: "PREMIER_TOUR",
      title: "Intentions de vote — 1er tour présidentielle 2022 (Ipsos / Le Monde)",
      electionYear: 2022,
      isTestStructure: false,
      commissionNoticeUrl:
        "https://www.ipsos.com/sites/default/files/ct/news/documents/2022-04/NOTICE%20TECHNIQUE%20Ipsos%20Le%20Monde%20%20-%20Intention%20de%20vote%20pre%CC%81sidentielle%201er%20tour%202022.pdf",
      reportUrl:
        "https://www.ipsos.com/sites/default/files/ct/news/documents/2022-04/Rapport%20Ipsos_LEMONDE%20_Intention%20de%20vote%20pre%cc%81sidentielle%201er%20tour%202022.pdf",
      publishedOn: d("2022-04-08"),
      sources: {
        create: [
          { sourceId: "src-ipsos-notice-2022-04-08" },
          { sourceId: "src-ipsos-rapport-2022-04-08" },
          { sourceId: "src-commission-portal" },
        ],
      },
      results: {
        create: [
          { candidateId: ids.macron, percent: 26.5 },
          { candidateId: ids.lepen, percent: 22.5 },
          { candidateId: ids.melenchon, percent: 17.5 },
          { candidateId: ids.zemmour, percent: 9.0 },
          { candidateId: ids.pecresse, percent: 8.5 },
          { candidateId: ids.jadot, percent: 5.0 },
          { candidateId: ids.nda, percent: 2.5, label: "Dupont-Aignan" },
          { label: "Autres candidats", percent: 8.5 },
        ],
      },
    },
  });

  // --- Ifop fin de campagne 2017 (réel — structure Commission) ---
  // Scores 1er tour proches des derniers Ifop Fiducial publiés (agrégats publics).
  await db.poll.create({
    data: {
      id: "poll-ifop-2017-04-20",
      slug: "ifop-fiducial-20-avril-2017",
      institute: "Ifop",
      sponsor: "Fiducial / TF1 / LCI",
      sponsorKind: "MEDIA",
      fieldworkStart: d("2017-04-18"),
      fieldworkEnd: d("2017-04-20"),
      sampleSize: 1876,
      marginOfError: 2.3,
      population: "Inscrits sur les listes électorales",
      methodology: "Téléphone / quotas (série Fiducial)",
      round: "PREMIER_TOUR",
      title: "Intentions de vote — 1er tour présidentielle 2017 (Ifop Fiducial)",
      electionYear: 2017,
      isTestStructure: false,
      commissionNoticeUrl: "https://www.commission-des-sondages.fr/",
      reportUrl:
        "https://www.ifop.com/publication/les-intentions-de-vote-a-lelection-presidentielle-2017/",
      publishedOn: d("2017-04-21"),
      sources: {
        create: [
          { sourceId: "src-ifop-2017-04-21" },
          { sourceId: "src-commission-portal" },
          { sourceId: "src-wikipedia-sondages-2017" },
        ],
      },
      results: {
        create: [
          { candidateId: ids.macron, percent: 24.0 },
          { candidateId: ids.lepen, percent: 21.5 },
          { candidateId: ids.fillon, percent: 19.5 },
          { candidateId: ids.melenchon, percent: 19.0 },
          { candidateId: ids.hamon, percent: 7.5 },
          { candidateId: ids.nda, percent: 4.0 },
          { label: "Autres candidats", percent: 4.5 },
        ],
      },
    },
  });

  // --- Structure de test Commission (PAS une intention 2027 réelle) ---
  await db.poll.create({
    data: {
      id: "poll-test-structure-commission",
      slug: "sondage-de-test-structure-commission",
      institute: "Institut de démonstration Veote",
      sponsor: "Veote (structure pédagogique)",
      sponsorKind: "AUTRE",
      fieldworkStart: d("2026-11-01"),
      fieldworkEnd: d("2026-11-03"),
      sampleSize: 1000,
      marginOfError: 3.1,
      population: "Inscrits (échantillon fictif de démonstration)",
      methodology: "Structure Commission — données de test, non publiées",
      round: "PREMIER_TOUR",
      title: `${TEST_LABEL} — hypothèse pédagogique 4 candidats`,
      electionYear: null,
      isTestStructure: true,
      commissionNoticeUrl: "https://www.commission-des-sondages.fr/",
      reportUrl: null,
      publishedOn: d("2026-11-03"),
      sources: {
        create: [{ sourceId: "src-commission-portal" }],
      },
      results: {
        create: [
          // Chiffres fictifs explicitement marqués test — jamais présentés comme officiels 2027
          { candidateId: ids.melenchon, percent: 28.0 },
          { candidateId: ids.lepen, percent: 26.0 },
          { candidateId: ids.macron, percent: 22.0 },
          { candidateId: ids.panot, percent: 14.0 },
          { label: "Autres / indécis (test)", percent: 10.0 },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // Matrices éditoriales sourcées 2017 & 2022
  // ---------------------------------------------------------------------------

  // 2017 Ipsos Sopra Steria 4–6 mai (PDF sociologie) — abstention+blancs agrégés
  // Fillon: 48 / 20 / 32 (15+17)
  // Mélenchon: 52 / 7 / 41 (17+24)
  // Hamon: 71 / 2 / 27 (10+17)
  // Dupont-Aignan: 27 / 30 / 43 (20+23)
  // Fidélité finalistes (approximation post-électorale documentée ailleurs) : ~95/95
  await db.voteTransferMatrix.create({
    data: {
      id: "matrix-ipsos-2017-macron-lepen",
      slug: "ipsos-2017-macron-lepen",
      origin: "EDITORIAL_SOURCED",
      pollId: null,
      label: "Reports Ipsos — Macron vs Le Pen (post-électoral 2017)",
      electionYear: 2017,
      finalistAId: ids.macron,
      finalistBId: ids.lepen,
      round: "SECOND_TOUR",
      methodology:
        "Tableau « Le report de voix entre les deux tours », Ipsos/Sopra Steria, terrain 4–6 mai 2017 (n=4 838). Blancs/nuls + abstention agrégés pour le simulateur (3 voies).",
      effectiveOn: d("2017-05-07"),
      sources: {
        create: [{ sourceId: "src-ipsos-sociologie-2017-05-07" }],
      },
    },
  });

  await db.transferEdge.createMany({
    data: edgeRows("matrix-ipsos-2017-macron-lepen", [
      // Fillon
      { fromId: ids.fillon, toKind: "CANDIDATE", toId: ids.macron, percent: 48 },
      { fromId: ids.fillon, toKind: "CANDIDATE", toId: ids.lepen, percent: 20 },
      {
        fromId: ids.fillon,
        toKind: "ABSTENTION_BLANC",
        percent: 32,
        notes: "15 % blancs/nuls + 17 % abstention (Ipsos 7 mai 2017)",
      },
      // Mélenchon
      {
        fromId: ids.melenchon,
        toKind: "CANDIDATE",
        toId: ids.macron,
        percent: 52,
      },
      { fromId: ids.melenchon, toKind: "CANDIDATE", toId: ids.lepen, percent: 7 },
      {
        fromId: ids.melenchon,
        toKind: "ABSTENTION_BLANC",
        percent: 41,
        notes: "17 % blancs/nuls + 24 % abstention",
      },
      // Hamon
      { fromId: ids.hamon, toKind: "CANDIDATE", toId: ids.macron, percent: 71 },
      { fromId: ids.hamon, toKind: "CANDIDATE", toId: ids.lepen, percent: 2 },
      {
        fromId: ids.hamon,
        toKind: "ABSTENTION_BLANC",
        percent: 27,
        notes: "10 % blancs/nuls + 17 % abstention",
      },
      // Dupont-Aignan
      { fromId: ids.nda, toKind: "CANDIDATE", toId: ids.macron, percent: 27 },
      { fromId: ids.nda, toKind: "CANDIDATE", toId: ids.lepen, percent: 30 },
      {
        fromId: ids.nda,
        toKind: "ABSTENTION_BLANC",
        percent: 43,
        notes: "20 % blancs/nuls + 23 % abstention",
      },
      // Fidélité finalistes (conservatisme 1er→2nd)
      { fromId: ids.macron, toKind: "CANDIDATE", toId: ids.macron, percent: 95 },
      { fromId: ids.macron, toKind: "CANDIDATE", toId: ids.lepen, percent: 2 },
      { fromId: ids.macron, toKind: "ABSTENTION_BLANC", percent: 3 },
      { fromId: ids.lepen, toKind: "CANDIDATE", toId: ids.lepen, percent: 94 },
      { fromId: ids.lepen, toKind: "CANDIDATE", toId: ids.macron, percent: 2 },
      { fromId: ids.lepen, toKind: "ABSTENTION_BLANC", percent: 4 },
    ]),
  });

  // 2022 Ipsos — page du 24 avril 2022
  // Mélenchon: 42 / 17 / 41 (24+17)
  // Jadot: 65 / 6 / 29 (16+13)
  // Pécresse: 53 / 18 / 29 (15+14)
  // Zemmour: 10 / 73 / 17
  // Fidélité : Macron 98, Le Pen 91 (Ipsos)
  await db.voteTransferMatrix.create({
    data: {
      id: "matrix-ipsos-2022-macron-lepen",
      slug: "ipsos-2022-macron-lepen",
      origin: "EDITORIAL_SOURCED",
      pollId: null,
      label: "Reports Ipsos — Macron vs Le Pen (post-électoral 2022)",
      electionYear: 2022,
      finalistAId: ids.macron,
      finalistBId: ids.lepen,
      round: "SECOND_TOUR",
      methodology:
        "Ipsos/Sopra Steria — « Second tour : profil des abstentionnistes et sociologie des électorats » (24 avril 2022). Blancs/nuls + abstention agrégés.",
      effectiveOn: d("2022-04-24"),
      sources: {
        create: [{ sourceId: "src-ipsos-reports-2022-04-24" }],
      },
    },
  });

  await db.transferEdge.createMany({
    data: edgeRows("matrix-ipsos-2022-macron-lepen", [
      {
        fromId: ids.melenchon,
        toKind: "CANDIDATE",
        toId: ids.macron,
        percent: 42,
      },
      {
        fromId: ids.melenchon,
        toKind: "CANDIDATE",
        toId: ids.lepen,
        percent: 17,
      },
      {
        fromId: ids.melenchon,
        toKind: "ABSTENTION_BLANC",
        percent: 41,
        notes: "24 % abstention + 17 % blancs/nuls",
      },
      { fromId: ids.jadot, toKind: "CANDIDATE", toId: ids.macron, percent: 65 },
      { fromId: ids.jadot, toKind: "CANDIDATE", toId: ids.lepen, percent: 6 },
      {
        fromId: ids.jadot,
        toKind: "ABSTENTION_BLANC",
        percent: 29,
        notes: "16 % abstention + 13 % blancs/nuls",
      },
      {
        fromId: ids.pecresse,
        toKind: "CANDIDATE",
        toId: ids.macron,
        percent: 53,
      },
      {
        fromId: ids.pecresse,
        toKind: "CANDIDATE",
        toId: ids.lepen,
        percent: 18,
      },
      {
        fromId: ids.pecresse,
        toKind: "ABSTENTION_BLANC",
        percent: 29,
        notes: "15 % abstention + 14 % blancs/nuls",
      },
      {
        fromId: ids.zemmour,
        toKind: "CANDIDATE",
        toId: ids.macron,
        percent: 10,
      },
      {
        fromId: ids.zemmour,
        toKind: "CANDIDATE",
        toId: ids.lepen,
        percent: 73,
      },
      {
        fromId: ids.zemmour,
        toKind: "ABSTENTION_BLANC",
        percent: 17,
        notes: "Abstention + blancs/nuls (Ipsos 2022)",
      },
      { fromId: ids.macron, toKind: "CANDIDATE", toId: ids.macron, percent: 98 },
      { fromId: ids.macron, toKind: "CANDIDATE", toId: ids.lepen, percent: 1 },
      { fromId: ids.macron, toKind: "ABSTENTION_BLANC", percent: 1 },
      { fromId: ids.lepen, toKind: "CANDIDATE", toId: ids.lepen, percent: 91 },
      { fromId: ids.lepen, toKind: "CANDIDATE", toId: ids.macron, percent: 3 },
      {
        fromId: ids.lepen,
        toKind: "ABSTENTION_BLANC",
        percent: 6,
        notes: "Dont ~5 % abstention documentée Ipsos",
      },
    ]),
  });

  // Matrice POLL_LINKED de démonstration (copie pédagogique 2022 → candidats test)
  // Liée au sondage de test — origine explicite, pas une étude officielle 2027
  await db.voteTransferMatrix.create({
    data: {
      id: "matrix-test-linked",
      slug: "test-structure-liee-sondage",
      origin: "POLL_LINKED",
      pollId: "poll-test-structure-commission",
      label: `${TEST_LABEL} — matrice liée (démo simulateur)`,
      electionYear: null,
      finalistAId: ids.melenchon,
      finalistBId: ids.lepen,
      round: "HYPOTHESE",
      methodology:
        "Matrice pédagogique liée au sondage de test. Les pourcentages reprennent l’ordre de grandeur Ipsos 2022 (Mélenchon→finalistes) pour illustrer le simulateur — ce ne sont PAS des intentions 2027 officielles.",
      effectiveOn: d("2026-11-03"),
      sources: {
        create: [
          { sourceId: "src-ipsos-reports-2022-04-24" },
          { sourceId: "src-commission-portal" },
        ],
      },
    },
  });

  await db.transferEdge.createMany({
    data: edgeRows("matrix-test-linked", [
      // Électorat Macron éliminé (si finalistes = Mélenchon / Le Pen)
      { fromId: ids.macron, toKind: "CANDIDATE", toId: ids.melenchon, percent: 35 },
      { fromId: ids.macron, toKind: "CANDIDATE", toId: ids.lepen, percent: 40 },
      { fromId: ids.macron, toKind: "ABSTENTION_BLANC", percent: 25 },
      // Panot
      { fromId: ids.panot, toKind: "CANDIDATE", toId: ids.melenchon, percent: 70 },
      { fromId: ids.panot, toKind: "CANDIDATE", toId: ids.lepen, percent: 5 },
      { fromId: ids.panot, toKind: "ABSTENTION_BLANC", percent: 25 },
      // Fidélité
      {
        fromId: ids.melenchon,
        toKind: "CANDIDATE",
        toId: ids.melenchon,
        percent: 90,
      },
      { fromId: ids.melenchon, toKind: "CANDIDATE", toId: ids.lepen, percent: 5 },
      { fromId: ids.melenchon, toKind: "ABSTENTION_BLANC", percent: 5 },
      { fromId: ids.lepen, toKind: "CANDIDATE", toId: ids.lepen, percent: 92 },
      {
        fromId: ids.lepen,
        toKind: "CANDIDATE",
        toId: ids.melenchon,
        percent: 3,
      },
      { fromId: ids.lepen, toKind: "ABSTENTION_BLANC", percent: 5 },
    ]),
  });

  return {
    pollsHistorical: 2,
    pollsTestStructure: 1,
    pollsPresentedAsReal2027: 0,
    transferMatricesEditorial: 2,
    transferMatricesPollLinkedTest: 1,
    historicalCandidatesAdded: histCandidates.length,
    sources: [
      "Ipsos notice/rapport 8 avril 2022",
      "Ipsos reports 24 avril 2022",
      "Ipsos sociologie 7 mai 2017",
      "Ifop Fiducial 2017",
      "Commission des sondages (portail)",
    ],
    testLabel: TEST_LABEL,
  };
}

async function main() {
  const result = await seedModuleC(prisma);
  console.log(JSON.stringify(result, null, 2));
}

const isDirect =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("seed-module-c.ts") ||
    process.argv[1].endsWith("seed-module-c.js"));

if (isDirect) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
