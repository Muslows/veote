/**
 * Veote — seed Module B (Assemblée nationale : lois & scrutins).
 *
 * Règles (preferences.md) :
 * - Scrutins / lois historiques AN réels et sourcés uniquement.
 * - Jamais inventer de tallies ; URLs officielles assemblee-nationale.fr.
 * - Résumés tirés de Vie-publique / exposé des motifs (sourcés).
 * - AN only (pas de Sénat).
 * - Prérequis : seed Module A (partis) déjà exécuté pour les liens partyId.
 *
 * Usage :
 *   npx tsx prisma/seed-module-b.ts
 *   # ou via seed.ts (appelle seedModuleB à la fin)
 */

import { PrismaClient, type SourceKind } from "@prisma/client";

const prisma = new PrismaClient();

function d(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

type GroupAgg = {
  groupId: string;
  pour?: number;
  contre?: number;
  abstention?: number;
  nonVotant?: number;
};

async function replaceGroupAggregates(
  db: PrismaClient,
  voteRecordId: string,
  rows: GroupAgg[],
) {
  await db.votePosition.deleteMany({
    where: { voteRecordId, isGroupAggregate: true },
  });
  const data: {
    voteRecordId: string;
    groupId: string;
    position: "POUR" | "CONTRE" | "ABSTENTION" | "NON_VOTANT";
    isGroupAggregate: boolean;
    count: number;
  }[] = [];
  for (const r of rows) {
    if (r.pour)
      data.push({
        voteRecordId,
        groupId: r.groupId,
        position: "POUR",
        isGroupAggregate: true,
        count: r.pour,
      });
    if (r.contre)
      data.push({
        voteRecordId,
        groupId: r.groupId,
        position: "CONTRE",
        isGroupAggregate: true,
        count: r.contre,
      });
    if (r.abstention)
      data.push({
        voteRecordId,
        groupId: r.groupId,
        position: "ABSTENTION",
        isGroupAggregate: true,
        count: r.abstention,
      });
    if (r.nonVotant)
      data.push({
        voteRecordId,
        groupId: r.groupId,
        position: "NON_VOTANT",
        isGroupAggregate: true,
        count: r.nonVotant,
      });
  }
  if (data.length) await db.votePosition.createMany({ data });
}

export async function seedModuleB(client: PrismaClient = prisma) {
  // Réutilise le client injecté (seed.ts) ou le module-level
  const db = client;

  // ---------------------------------------------------------------------------
  // Sources Module B
  // ---------------------------------------------------------------------------
  // shadow module-level helpers onto injected client for upserts below
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

  await Promise.all([
    sourceFn({
      id: "src-an-dossier-immigration",
      url: "https://www.assemblee-nationale.fr/dyn/16/dossiers/DLR5L16N47118",
      label: "AN — Dossier immigration / intégration",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
    }),
    sourceFn({
      id: "src-an-scrutin-3213",
      url: "https://www.assemblee-nationale.fr/dyn/16/scrutins/3213",
      label: "AN — Scrutin n°3213 (19 déc. 2023)",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
      publishedAt: d("2023-12-19"),
    }),
    sourceFn({
      id: "src-vp-immigration",
      url: "https://www.vie-publique.fr/loi/287993-loi-immigration-integration-asile-du-26-janvier-2024",
      label: "Vie-publique — Loi immigration 26 janv. 2024",
      kind: "AUTRE",
      organism: "Vie-publique / DILA",
      publishedAt: d("2024-01-26"),
    }),
    sourceFn({
      id: "src-vp-immigration-dossier",
      url: "https://www.vie-publique.fr/dossierlegislatif/JORFDOLE000047079143",
      label: "Vie-publique — Dossier / exposé des motifs immigration",
      kind: "AUTRE",
      organism: "Vie-publique / DILA",
    }),
    sourceFn({
      id: "src-an-dossier-plfrss-2023",
      url: "https://www.assemblee-nationale.fr/dyn/16/dossiers/plrfss_pour_2023",
      label: "AN — Dossier PLFRSS 2023 (retraites)",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
    }),
    sourceFn({
      id: "src-an-scrutin-1240",
      url: "https://www.assemblee-nationale.fr/dyn/16/scrutins/1240",
      label: "AN — Scrutin n°1240 motion de censure (20 mars 2023)",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
      publishedAt: d("2023-03-20"),
    }),
    sourceFn({
      id: "src-an-actu-retraites",
      url: "https://www.assemblee-nationale.fr/dyn/actualites-accueil-hub/reforme-des-retraites-plfrss-pour-2023-rejet-de-deux-motions-de-censure-et-adoption-du-texte-lecture-cmp",
      label: "AN — Actualité PLFRSS / motions de censure 20 mars 2023",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
      publishedAt: d("2023-03-20"),
    }),
    sourceFn({
      id: "src-an-dossier-sren",
      url: "https://www.assemblee-nationale.fr/dyn/16/dossiers/DLR5L16N47884",
      label: "AN — Dossier SREN (espace numérique)",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
    }),
    sourceFn({
      id: "src-an-scrutin-3668",
      url: "https://www.assemblee-nationale.fr/dyn/16/scrutins/3668",
      label: "AN — Scrutin n°3668 SREN CMP (10 avril 2024)",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
      publishedAt: d("2024-04-10"),
    }),
    sourceFn({
      id: "src-vp-sren",
      url: "https://www.vie-publique.fr/dossierlegislatif/JORFDOLE000047533100",
      label: "Vie-publique — Loi SREN 21 mai 2024",
      kind: "AUTRE",
      organism: "Vie-publique / DILA",
      publishedAt: d("2024-05-21"),
    }),
    sourceFn({
      id: "src-opendata-an",
      url: "https://data.assemblee-nationale.fr/",
      label: "Open Data Assemblée nationale",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
      notes: "Point d’entrée des archives JSON (scrutins, dossiers) pour sync-an.ts.",
    }),
  ]);

  // ---------------------------------------------------------------------------
  // Groupes parlementaires — XVIe législature (AN only)
  // ---------------------------------------------------------------------------
  const groups = [
    {
      id: "grp-re-16",
      slug: "renaissance-16",
      name: "Renaissance",
      acronym: "RE",
      partyId: "party-renaissance",
      legislature: 16,
      anOrganeUid: null as string | null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-rn-16",
      slug: "rassemblement-national-16",
      name: "Rassemblement National",
      acronym: "RN",
      partyId: "party-rn",
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-lfi-16",
      slug: "lfi-nupes-16",
      name: "La France insoumise - Nouvelle Union Populaire écologique et sociale",
      acronym: "LFI-NUPES",
      partyId: "party-lfi",
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-lr-16",
      slug: "les-republicains-16",
      name: "Les Républicains",
      acronym: "LR",
      partyId: "party-lr",
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-dem-16",
      slug: "democrate-modem-16",
      name: "Démocrate (MoDem et Indépendants)",
      acronym: "DEM",
      partyId: null as string | null,
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-soc-16",
      slug: "socialistes-16",
      name: "Socialistes et apparentés",
      acronym: "SOC",
      partyId: "party-ps",
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-hor-16",
      slug: "horizons-16",
      name: "Horizons et apparentés",
      acronym: "HOR",
      partyId: null,
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-eco-16",
      slug: "ecologiste-nupes-16",
      name: "Écologiste - NUPES",
      acronym: "ECOLO",
      partyId: null,
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-gdr-16",
      slug: "gdr-nupes-16",
      name: "Gauche démocrate et républicaine - NUPES",
      acronym: "GDR",
      partyId: null,
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-liot-16",
      slug: "liot-16",
      name: "Libertés, Indépendants, Outre-mer et Territoires",
      acronym: "LIOT",
      partyId: null,
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
    {
      id: "grp-ni-16",
      slug: "non-inscrits-16",
      name: "Députés non inscrits",
      acronym: "NI",
      partyId: null,
      legislature: 16,
      anOrganeUid: null,
      sourceIds: ["src-opendata-an"],
    },
  ];

  for (const g of groups) {
    await db.parliamentaryGroup.upsert({
      where: { id: g.id },
      create: {
        id: g.id,
        slug: g.slug,
        name: g.name,
        acronym: g.acronym,
        partyId: g.partyId,
        legislature: g.legislature,
        chamber: "ASSEMBLEE_NATIONALE",
        isActive: false, // XVIe close
        anOrganeUid: g.anOrganeUid,
        sources: { create: g.sourceIds.map((sourceId) => ({ sourceId })) },
      },
      update: {
        slug: g.slug,
        name: g.name,
        acronym: g.acronym,
        partyId: g.partyId,
        legislature: g.legislature,
        chamber: "ASSEMBLEE_NATIONALE",
        anOrganeUid: g.anOrganeUid,
      },
    });
    await db.parliamentaryGroupSource.deleteMany({ where: { groupId: g.id } });
    await db.parliamentaryGroupSource.createMany({
      data: g.sourceIds.map((sourceId) => ({ groupId: g.id, sourceId })),
    });
  }

  // Link Module A mandates to groups where known (optional enrichment)
  await db.deputyMandate.updateMany({
    where: { id: { in: ["man-lepen-16", "man-lepen-17"] } },
    data: { groupId: "grp-rn-16" },
  });
  await db.deputyMandate.updateMany({
    where: { id: "man-panot-17" },
    data: { groupId: "grp-lfi-16" },
  });

  // ---------------------------------------------------------------------------
  // Loi 1 — Immigration (scrutin 3213, 19 déc. 2023)
  // Tallies : 349 Pour / 186 Contre / 38 Abst. — source AN scrutin 3213
  // ---------------------------------------------------------------------------
  await db.law.upsert({
    where: { id: "law-immigration-2024" },
    create: {
      id: "law-immigration-2024",
      slug: "loi-immigration-integration-2024",
      title:
        "Loi pour contrôler l’immigration, améliorer l’intégration",
      officialRef: "n° 2024-42 du 26 janvier 2024",
      lawType: "PROJET_DE_LOI",
      status: "PROMULGUE",
      officialUrl:
        "https://www.assemblee-nationale.fr/dyn/16/dossiers/DLR5L16N47118",
      chamber: "ASSEMBLEE_NATIONALE",
      introducedOn: d("2022-11-01"),
      adoptedOn: d("2023-12-19"),
      promulgatedOn: d("2024-01-26"),
      legislature: 16,
      themeSlug: "immigration",
      themeLabel: "Immigration & asile",
      authorKind: "GOUVERNEMENT",
      authorLabel: "Gouvernement",
      anDossierUid: "DLR5L16N47118",
      summaryUrl:
        "https://www.vie-publique.fr/loi/287993-loi-immigration-integration-asile-du-26-janvier-2024",
      summary:
        "Projet de loi du Gouvernement visant notamment à renforcer l’intégration par la langue et le travail, à lutter contre l’immigration irrégulière, à réformer le système d’asile (pôles « France asile », CNDA) et à simplifier le contentieux des étrangers. Résumé neutre d’après Vie-publique / exposé des motifs — pas de commentaire éditorial Veote.",
      sources: {
        create: [
          { sourceId: "src-an-dossier-immigration" },
          { sourceId: "src-vp-immigration" },
          { sourceId: "src-vp-immigration-dossier" },
        ],
      },
    },
    update: {
      title:
        "Loi pour contrôler l’immigration, améliorer l’intégration",
      officialRef: "n° 2024-42 du 26 janvier 2024",
      status: "PROMULGUE",
      officialUrl:
        "https://www.assemblee-nationale.fr/dyn/16/dossiers/DLR5L16N47118",
      adoptedOn: d("2023-12-19"),
      promulgatedOn: d("2024-01-26"),
      themeSlug: "immigration",
      themeLabel: "Immigration & asile",
      authorKind: "GOUVERNEMENT",
      authorLabel: "Gouvernement",
      anDossierUid: "DLR5L16N47118",
      summaryUrl:
        "https://www.vie-publique.fr/loi/287993-loi-immigration-integration-asile-du-26-janvier-2024",
      summary:
        "Projet de loi du Gouvernement visant notamment à renforcer l’intégration par la langue et le travail, à lutter contre l’immigration irrégulière, à réformer le système d’asile (pôles « France asile », CNDA) et à simplifier le contentieux des étrangers. Résumé neutre d’après Vie-publique / exposé des motifs — pas de commentaire éditorial Veote.",
    },
  });
  await db.lawSource.deleteMany({ where: { lawId: "law-immigration-2024" } });
  await db.lawSource.createMany({
    data: [
      { lawId: "law-immigration-2024", sourceId: "src-an-dossier-immigration" },
      { lawId: "law-immigration-2024", sourceId: "src-vp-immigration" },
      { lawId: "law-immigration-2024", sourceId: "src-vp-immigration-dossier" },
    ],
  });

  await db.voteRecord.upsert({
    where: { id: "vote-immigration-3213" },
    create: {
      id: "vote-immigration-3213",
      lawId: "law-immigration-2024",
      scrutinRef: "3213",
      anScrutinUid: "VTANR5L16V3213",
      title:
        "Ensemble du projet de loi pour contrôler l’immigration, améliorer l’intégration (texte CMP)",
      voteType: "SOLENNEL",
      chamber: "ASSEMBLEE_NATIONALE",
      votedOn: d("2023-12-19"),
      officialUrl: "https://www.assemblee-nationale.fr/dyn/16/scrutins/3213",
      pour: 349,
      contre: 186,
      abstention: 38,
      nonVotant: 0,
      adopted: true,
      legislature: 16,
      sources: { create: [{ sourceId: "src-an-scrutin-3213" }] },
    },
    update: {
      lawId: "law-immigration-2024",
      scrutinRef: "3213",
      anScrutinUid: "VTANR5L16V3213",
      title:
        "Ensemble du projet de loi pour contrôler l’immigration, améliorer l’intégration (texte CMP)",
      votedOn: d("2023-12-19"),
      officialUrl: "https://www.assemblee-nationale.fr/dyn/16/scrutins/3213",
      pour: 349,
      contre: 186,
      abstention: 38,
      adopted: true,
      legislature: 16,
    },
  });
  await db.voteRecordSource.deleteMany({
    where: { voteRecordId: "vote-immigration-3213" },
  });
  await db.voteRecordSource.createMany({
    data: [
      { voteRecordId: "vote-immigration-3213", sourceId: "src-an-scrutin-3213" },
    ],
  });

  // Répartition par groupe — page AN scrutin 3213 (chiffres officiels)
  await replaceGroupAggregates(db, "vote-immigration-3213", [
    { groupId: "grp-re-16", pour: 131, contre: 20, abstention: 17 },
    { groupId: "grp-rn-16", pour: 88 },
    { groupId: "grp-lfi-16", contre: 75 },
    { groupId: "grp-lr-16", pour: 62 },
    { groupId: "grp-dem-16", pour: 30, contre: 5, abstention: 15 },
    { groupId: "grp-soc-16", contre: 31 },
    { groupId: "grp-hor-16", pour: 28, contre: 2 },
    { groupId: "grp-eco-16", contre: 23 },
    { groupId: "grp-gdr-16", contre: 21 },
    { groupId: "grp-liot-16", pour: 8, contre: 8, abstention: 5 },
    { groupId: "grp-ni-16", pour: 2, contre: 1, abstention: 1 },
  ]);

  // Arguments sourcés (synthèse neutre)
  await db.lawArgument.deleteMany({ where: { lawId: "law-immigration-2024" } });
  await db.lawArgument.create({
    data: {
      id: "arg-immig-pour",
      lawId: "law-immigration-2024",
      camp: "POUR",
      title: "Contrôle des flux et intégration par le travail et la langue",
      body: "Selon l’exposé des motifs relayé par Vie-publique, le texte vise à conditionner davantage les titres de séjour à la maîtrise du français et au respect des principes de la République, à créer à titre expérimental une carte « métiers en tension », à faciliter l’éloignement des étrangers condamnés pour crimes ou délits graves, et à accélérer l’asile via des pôles territoriaux et une réforme de la CNDA.",
      sortOrder: 0,
      sources: {
        create: [
          { sourceId: "src-vp-immigration-dossier" },
          { sourceId: "src-vp-immigration" },
        ],
      },
    },
  });
  await db.lawArgument.create({
    data: {
      id: "arg-immig-contre",
      lawId: "law-immigration-2024",
      camp: "CONTRE",
      title: "Durcissement et risque d’inconstitutionnalité",
      body: "Les groupes de gauche (LFI-NUPES, SOC, Écologiste, GDR) ont voté contre le texte de la CMP (scrutin n°3213). Le débat public a notamment porté sur le durcissement issu de la navette parlementaire et sur la saisine du Conseil constitutionnel ; plusieurs dispositions ont ensuite été censurées (décision 2023-863 DC) — fait institutionnel, pas un jugement de valeur Veote.",
      sortOrder: 1,
      sources: {
        create: [
          { sourceId: "src-an-scrutin-3213" },
          { sourceId: "src-vp-immigration" },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // Loi 2 — PLFRSS 2023 (retraites) — adopté via 49.3 ; scrutin clé = motion 1240
  // Tallies motion Pancher : 278 Pour / 0 Contre — non adoptée (maj. abs. 287)
  // ---------------------------------------------------------------------------
  await db.law.upsert({
    where: { id: "law-plfrss-retraites-2023" },
    create: {
      id: "law-plfrss-retraites-2023",
      slug: "plfrss-retraites-2023",
      title:
        "Projet de loi de financement rectificative de la sécurité sociale pour 2023 (réforme des retraites)",
      officialRef: "loi du 14 avril 2023 (PLFRSS 2023)",
      lawType: "PROJET_DE_LOI",
      status: "PROMULGUE",
      officialUrl:
        "https://www.assemblee-nationale.fr/dyn/16/dossiers/plrfss_pour_2023",
      chamber: "ASSEMBLEE_NATIONALE",
      introducedOn: d("2023-01-23"),
      adoptedOn: d("2023-03-20"),
      promulgatedOn: d("2023-04-14"),
      legislature: 16,
      themeSlug: "retraites",
      themeLabel: "Retraites & protection sociale",
      authorKind: "GOUVERNEMENT",
      authorLabel: "Gouvernement",
      summaryUrl:
        "https://www.assemblee-nationale.fr/dyn/actualites-accueil-hub/reforme-des-retraites-plfrss-pour-2023-rejet-de-deux-motions-de-censure-et-adoption-du-texte-lecture-cmp",
      summary:
        "Texte considéré comme adopté par l’Assemblée nationale le 20 mars 2023 en application de l’article 49, alinéa 3, de la Constitution (lecture CMP), après rejet des motions de censure. Le dossier AN documente le dépôt (23 janv. 2023), l’accord CMP et la promulgation (14 avril 2023). Aucun vote d’ensemble direct sur le texte à l’AN — le scrutin public documenté ici est la motion de censure transpartisane n°1240.",
      sources: {
        create: [
          { sourceId: "src-an-dossier-plfrss-2023" },
          { sourceId: "src-an-actu-retraites" },
        ],
      },
    },
    update: {
      title:
        "Projet de loi de financement rectificative de la sécurité sociale pour 2023 (réforme des retraites)",
      status: "PROMULGUE",
      officialUrl:
        "https://www.assemblee-nationale.fr/dyn/16/dossiers/plrfss_pour_2023",
      adoptedOn: d("2023-03-20"),
      promulgatedOn: d("2023-04-14"),
      themeSlug: "retraites",
      themeLabel: "Retraites & protection sociale",
      authorKind: "GOUVERNEMENT",
      authorLabel: "Gouvernement",
      summary:
        "Texte considéré comme adopté par l’Assemblée nationale le 20 mars 2023 en application de l’article 49, alinéa 3, de la Constitution (lecture CMP), après rejet des motions de censure. Le dossier AN documente le dépôt (23 janv. 2023), l’accord CMP et la promulgation (14 avril 2023). Aucun vote d’ensemble direct sur le texte à l’AN — le scrutin public documenté ici est la motion de censure transpartisane n°1240.",
    },
  });
  await db.lawSource.deleteMany({
    where: { lawId: "law-plfrss-retraites-2023" },
  });
  await db.lawSource.createMany({
    data: [
      {
        lawId: "law-plfrss-retraites-2023",
        sourceId: "src-an-dossier-plfrss-2023",
      },
      { lawId: "law-plfrss-retraites-2023", sourceId: "src-an-actu-retraites" },
      { lawId: "law-plfrss-retraites-2023", sourceId: "src-an-scrutin-1240" },
    ],
  });

  await db.voteRecord.upsert({
    where: { id: "vote-censure-1240" },
    create: {
      id: "vote-censure-1240",
      lawId: "law-plfrss-retraites-2023",
      scrutinRef: "1240",
      anScrutinUid: "VTANR5L16V1240",
      title:
        "Motion de censure (art. 49 al. 3) déposée par M. Bertrand Pancher et 90 membres",
      voteType: "MOTION_DE_CENSURE",
      chamber: "ASSEMBLEE_NATIONALE",
      votedOn: d("2023-03-20"),
      officialUrl: "https://www.assemblee-nationale.fr/dyn/16/scrutins/1240",
      pour: 278,
      contre: 0,
      abstention: 0,
      nonVotant: 0,
      adopted: false,
      legislature: 16,
      sources: {
        create: [
          { sourceId: "src-an-scrutin-1240" },
          { sourceId: "src-an-actu-retraites" },
        ],
      },
    },
    update: {
      lawId: "law-plfrss-retraites-2023",
      scrutinRef: "1240",
      anScrutinUid: "VTANR5L16V1240",
      votedOn: d("2023-03-20"),
      officialUrl: "https://www.assemblee-nationale.fr/dyn/16/scrutins/1240",
      pour: 278,
      contre: 0,
      abstention: 0,
      adopted: false,
      legislature: 16,
    },
  });
  await db.voteRecordSource.deleteMany({
    where: { voteRecordId: "vote-censure-1240" },
  });
  await db.voteRecordSource.createMany({
    data: [
      { voteRecordId: "vote-censure-1240", sourceId: "src-an-scrutin-1240" },
      { voteRecordId: "vote-censure-1240", sourceId: "src-an-actu-retraites" },
    ],
  });

  // Groupes ayant voté POUR la motion (page AN) — pas de « Contre » publié
  await replaceGroupAggregates(db, "vote-censure-1240", [
    { groupId: "grp-rn-16", pour: 88 },
    { groupId: "grp-lfi-16", pour: 74 },
    { groupId: "grp-lr-16", pour: 19 },
    { groupId: "grp-soc-16", pour: 31 },
    { groupId: "grp-eco-16", pour: 22 },
    { groupId: "grp-gdr-16", pour: 22 },
    { groupId: "grp-liot-16", pour: 18 },
    { groupId: "grp-ni-16", pour: 4 },
  ]);

  await db.lawArgument.deleteMany({
    where: { lawId: "law-plfrss-retraites-2023" },
  });
  await db.lawArgument.create({
    data: {
      id: "arg-retraites-pour-texte",
      lawId: "law-plfrss-retraites-2023",
      camp: "POUR",
      title: "Adoption via engagement de responsabilité (49.3)",
      body: "Le Gouvernement a engagé sa responsabilité sur le texte CMP (16 mars 2023). Après le rejet des motions de censure le 20 mars, le PLFRSS 2023 est considéré comme adopté par l’Assemblée en application de l’article 49, alinéa 3 — procédure constitutionnelle documentée par l’Assemblée nationale (actualité et dossier législatif).",
      sortOrder: 0,
      sources: {
        create: [
          { sourceId: "src-an-actu-retraites" },
          { sourceId: "src-an-dossier-plfrss-2023" },
        ],
      },
    },
  });
  await db.lawArgument.create({
    data: {
      id: "arg-retraites-contre-censure",
      lawId: "law-plfrss-retraites-2023",
      camp: "CONTRE",
      title: "Motion de censure transpartisane (278 voix)",
      body: "La motion déposée par Bertrand Pancher et 90 collègues a recueilli 278 voix pour (scrutin n°1240) sans atteindre la majorité absolue de 287. Les groupes RN, LFI-NUPES, SOC, Écologiste, GDR, une partie de LR et LIOT ont notamment apporté leur soutien — répartition publiée sur la page officielle du scrutin.",
      sortOrder: 1,
      sources: {
        create: [{ sourceId: "src-an-scrutin-1240" }],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // Loi 3 — SREN (espace numérique) — scrutin 3668, 10 avril 2024
  // Tallies : 134 Pour / 75 Contre / 1 Abst.
  // ---------------------------------------------------------------------------
  await db.law.upsert({
    where: { id: "law-sren-2024" },
    create: {
      id: "law-sren-2024",
      slug: "loi-securiser-reguler-espace-numerique-2024",
      title:
        "Loi visant à sécuriser et à réguler l’espace numérique",
      officialRef: "n° 2024-449 du 21 mai 2024",
      lawType: "PROJET_DE_LOI",
      status: "PROMULGUE",
      officialUrl:
        "https://www.assemblee-nationale.fr/dyn/16/dossiers/DLR5L16N47884",
      chamber: "ASSEMBLEE_NATIONALE",
      introducedOn: d("2023-05-10"),
      adoptedOn: d("2024-04-10"),
      promulgatedOn: d("2024-05-21"),
      legislature: 16,
      themeSlug: "numerique",
      themeLabel: "Numérique & régulation",
      authorKind: "GOUVERNEMENT",
      authorLabel: "Gouvernement",
      anDossierUid: "DLR5L16N47884",
      summaryUrl:
        "https://www.vie-publique.fr/dossierlegislatif/JORFDOLE000047533100",
      summary:
        "Projet de loi (SREN) visant à renforcer l’ordre public numérique : protection des mineurs en ligne, lutte contre le cyberharcèlement et les arnaques, régulation du cloud, transposition/application du DSA et du DMA. Résumé neutre d’après le dossier Vie-publique (exposé des motifs du Conseil des ministres du 10 mai 2023).",
      sources: {
        create: [
          { sourceId: "src-an-dossier-sren" },
          { sourceId: "src-vp-sren" },
        ],
      },
    },
    update: {
      title:
        "Loi visant à sécuriser et à réguler l’espace numérique",
      officialRef: "n° 2024-449 du 21 mai 2024",
      status: "PROMULGUE",
      officialUrl:
        "https://www.assemblee-nationale.fr/dyn/16/dossiers/DLR5L16N47884",
      adoptedOn: d("2024-04-10"),
      promulgatedOn: d("2024-05-21"),
      themeSlug: "numerique",
      themeLabel: "Numérique & régulation",
      anDossierUid: "DLR5L16N47884",
      summaryUrl:
        "https://www.vie-publique.fr/dossierlegislatif/JORFDOLE000047533100",
      summary:
        "Projet de loi (SREN) visant à renforcer l’ordre public numérique : protection des mineurs en ligne, lutte contre le cyberharcèlement et les arnaques, régulation du cloud, transposition/application du DSA et du DMA. Résumé neutre d’après le dossier Vie-publique (exposé des motifs du Conseil des ministres du 10 mai 2023).",
    },
  });
  await db.lawSource.deleteMany({ where: { lawId: "law-sren-2024" } });
  await db.lawSource.createMany({
    data: [
      { lawId: "law-sren-2024", sourceId: "src-an-dossier-sren" },
      { lawId: "law-sren-2024", sourceId: "src-vp-sren" },
      { lawId: "law-sren-2024", sourceId: "src-an-scrutin-3668" },
    ],
  });

  await db.voteRecord.upsert({
    where: { id: "vote-sren-3668" },
    create: {
      id: "vote-sren-3668",
      lawId: "law-sren-2024",
      scrutinRef: "3668",
      anScrutinUid: "VTANR5L16V3668",
      title:
        "Ensemble du projet de loi visant à sécuriser et réguler l’espace numérique (texte CMP)",
      voteType: "SOLENNEL",
      chamber: "ASSEMBLEE_NATIONALE",
      votedOn: d("2024-04-10"),
      officialUrl: "https://www.assemblee-nationale.fr/dyn/16/scrutins/3668",
      pour: 134,
      contre: 75,
      abstention: 1,
      nonVotant: 2,
      adopted: true,
      legislature: 16,
      sources: { create: [{ sourceId: "src-an-scrutin-3668" }] },
    },
    update: {
      lawId: "law-sren-2024",
      scrutinRef: "3668",
      anScrutinUid: "VTANR5L16V3668",
      votedOn: d("2024-04-10"),
      officialUrl: "https://www.assemblee-nationale.fr/dyn/16/scrutins/3668",
      pour: 134,
      contre: 75,
      abstention: 1,
      nonVotant: 2,
      adopted: true,
      legislature: 16,
    },
  });
  await db.voteRecordSource.deleteMany({
    where: { voteRecordId: "vote-sren-3668" },
  });
  await db.voteRecordSource.createMany({
    data: [
      { voteRecordId: "vote-sren-3668", sourceId: "src-an-scrutin-3668" },
    ],
  });

  // Répartition publiée AN (présents au scrutin — pas inventée)
  await replaceGroupAggregates(db, "vote-sren-3668", [
    { groupId: "grp-re-16", pour: 72, nonVotant: 1 },
    { groupId: "grp-rn-16", contre: 41 },
    { groupId: "grp-lfi-16", contre: 20 },
    { groupId: "grp-lr-16", pour: 12, abstention: 1 },
    { groupId: "grp-dem-16", pour: 33, nonVotant: 1 },
    { groupId: "grp-hor-16", pour: 15 },
    { groupId: "grp-soc-16", contre: 7 },
    { groupId: "grp-gdr-16", contre: 1 },
    { groupId: "grp-liot-16", pour: 2 },
    { groupId: "grp-eco-16", contre: 5 },
    { groupId: "grp-ni-16", contre: 1 },
  ]);

  await db.lawArgument.deleteMany({ where: { lawId: "law-sren-2024" } });
  await db.lawArgument.create({
    data: {
      id: "arg-sren-pour",
      lawId: "law-sren-2024",
      camp: "POUR",
      title: "Sécuriser l’espace numérique et protéger les mineurs",
      body: "D’après l’exposé des motifs (Vie-publique), le texte porte notamment un filtre anti-arnaque, un renforcement des sanctions contre le cyberharcèlement, le contrôle d’âge pour les sites pornographiques, des mesures sur le cloud et l’adaptation du droit national au DSA/DMA. Adoption AN du texte CMP : 134 pour, 75 contre, 1 abstention (scrutin n°3668).",
      sortOrder: 0,
      sources: {
        create: [
          { sourceId: "src-vp-sren" },
          { sourceId: "src-an-scrutin-3668" },
        ],
      },
    },
  });
  await db.lawArgument.create({
    data: {
      id: "arg-sren-contre",
      lawId: "law-sren-2024",
      camp: "CONTRE",
      title: "Opposition au texte CMP",
      body: "Au scrutin n°3668, le Rassemblement national (41 contre), LFI-NUPES (20), une partie des Socialistes (7) et des Écologistes (5) se sont notamment opposés au texte de la CMP — chiffres de la page officielle AN. Les motivations détaillées figurent dans les comptes rendus de séance ; Veote n’invente pas de citations hors source.",
      sortOrder: 1,
      sources: {
        create: [{ sourceId: "src-an-scrutin-3668" }],
      },
    },
  });

  return {
    ok: true,
    module: "B",
    groups: groups.length,
    laws: 3,
    voteRecords: 3,
    inventedTallies: 0,
  };
}

async function main() {
  const result = await seedModuleB(prisma);
  console.log(JSON.stringify(result, null, 2));
}

const isDirect =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("seed-module-b.ts") ||
    process.argv[1].endsWith("seed-module-b.js"));

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
