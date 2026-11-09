/**
 * Veote — seed Module A (candidats, partis, généalogie, HATVP)
 *         + Module B (lois & scrutins AN) via seed-module-b.ts
 *         + Module C (sondages & matrices) via seed-module-c.ts
 *
 * Règles (preferences.md) :
 * - Données réelles et sourcées uniquement.
 * - Aucun montant patrimonial HATVP inventé.
 * - Module C : pas d’intentions 2027 présentées comme réelles ;
 *   structures d’exemple préfixées
 *   « [Sondage de test - Structure Commission des sondages] ».
 * - HatvpAsset / HatvpInterest optionnels : absents si non importés.
 * - Candidat sans déclaration Veote → UI pointe vers https://www.hatvp.fr/
 * - Module B : tallies AN officiels uniquement ; jamais inventés.
 *
 * Usage (dans un projet Next + Prisma) :
 *   cp docs/schema.prisma prisma/schema.prisma
 *   cp docs/prisma/seed.ts prisma/seed.ts
 *   cp docs/prisma/seed-module-b.ts prisma/seed-module-b.ts
 *   cp docs/prisma/seed-module-c.ts prisma/seed-module-c.ts
 *   npx prisma db seed
 */

import { seedModuleB } from "./seed-module-b";
import { seedModuleC } from "./seed-module-c";

import { PrismaClient, type SourceKind } from "@prisma/client";

const prisma = new PrismaClient();

const HATVP_PORTAL = "https://www.hatvp.fr/";

function d(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

async function source(input: {
  id: string;
  url: string;
  label: string;
  kind: SourceKind;
  organism?: string;
  publishedAt?: Date;
  notes?: string;
}) {
  return prisma.source.upsert({
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
}

async function main() {
  // ---------------------------------------------------------------------------
  // Sources officielles / institutionnelles
  // ---------------------------------------------------------------------------
  await Promise.all([
    source({
      id: "src-hatvp-portal",
      url: HATVP_PORTAL,
      label: "Portail HATVP",
      kind: "HATVP",
      organism: "Haute Autorité pour la transparence de la vie publique",
      notes: "Fallback UI lorsque aucune déclaration nominative n’est importée.",
    }),
    source({
      id: "src-hatvp-lepen",
      url: "https://www.hatvp.fr/fiche-nominative/?declarant=le-pen-marine",
      label: "HATVP — fiche Marine Le Pen",
      kind: "HATVP",
      organism: "HATVP",
      notes:
        "Déclaration d’intérêts / activités publiée. Patrimoine consultable en préfecture — aucun montant patrimonial inventé dans le seed.",
    }),
    source({
      id: "src-hatvp-consulter",
      url: "https://www.hatvp.fr/consulter-les-declarations/",
      label: "HATVP — consulter les déclarations",
      kind: "HATVP",
      organism: "HATVP",
    }),
    source({
      id: "src-an-lepen",
      url: "https://www.assemblee-nationale.fr/dyn/deputes/PA720614",
      label: "Assemblée nationale — Marine Le Pen",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
    }),
    source({
      id: "src-an-sycomore-lepen",
      url: "https://www2.assemblee-nationale.fr/sycomore/fiche?num_dept=19249",
      label: "Sycomore — Marine Le Pen",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
    }),
    source({
      id: "src-an-melenchon",
      url: "https://www.assemblee-nationale.fr/dyn/deputes/PA2150",
      label: "Assemblée nationale — Jean-Luc Mélenchon",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
    }),
    source({
      id: "src-an-sycomore-melenchon",
      url: "https://www2.assemblee-nationale.fr/sycomore/fiche?num_dept=19278",
      label: "Sycomore — Jean-Luc Mélenchon",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
    }),
    source({
      id: "src-an-panot",
      url: "https://www.assemblee-nationale.fr/dyn/deputes/PA720892",
      label: "Assemblée nationale — Mathilde Panot",
      kind: "ASSEMBLEE_NATIONALE",
      organism: "Assemblée nationale",
    }),
    source({
      id: "src-elysee-macron",
      url: "https://www.elysee.fr/emmanuel-macron",
      label: "Élysée — Emmanuel Macron",
      kind: "AUTRE",
      organism: "Présidence de la République",
    }),
    source({
      id: "src-vp-rpr-dissolution",
      url: "https://www.vie-publique.fr/discours/133935-declaration-de-mme-michele-alliot-marie-presidente-du-rpr-et-ministre-d",
      label: "Vie-publique — dissolution RPR (21 sept. 2002)",
      kind: "AUTRE",
      organism: "Vie-publique / DILA",
      publishedAt: d("2002-09-21"),
    }),
    source({
      id: "src-archives-rpr",
      url: "https://francearchives.gouv.fr/fr/authorityrecord/FRAN_NP_052768",
      label: "FranceArchives — RPR (1976–2002)",
      kind: "AUTRE",
      organism: "FranceArchives",
    }),
    source({
      id: "src-media-fn-rn",
      url: "https://www.franceinfo.fr/politique/front-national/le-front-national-devient-le-rassemblement-national-apres-un-vote-des-militants-du-parti_2781377.html",
      label: "franceinfo — FN devient RN (1er juin 2018)",
      kind: "MEDIA",
      organism: "franceinfo",
      publishedAt: d("2018-06-01"),
    }),
    source({
      id: "src-media-renaissance",
      url: "https://www.franceinfo.fr/politique/la-republique-en-marche/avec-le-lancement-du-parti-renaissance-le-mouvement-macroniste-va-t-il-se-remettre-en-ordre-de-marche_5360680.html",
      label: "franceinfo — congrès Renaissance (17 sept. 2022)",
      kind: "MEDIA",
      organism: "franceinfo",
      publishedAt: d("2022-09-17"),
    }),
    source({
      id: "src-bnf-lfi",
      url: "https://catalogue.bnf.fr/ark:/12148/cb17147624g",
      label: "BnF — La France insoumise (naissance 2016-02-10)",
      kind: "AUTRE",
      organism: "Bibliothèque nationale de France",
    }),
    source({
      id: "src-parti-rn",
      url: "https://rassemblementnational.fr/",
      label: "Site officiel — Rassemblement national",
      kind: "PARTI_OFFICIEL",
      organism: "Rassemblement national",
    }),
    source({
      id: "src-parti-renaissance",
      url: "https://parti-renaissance.fr/",
      label: "Site officiel — Renaissance",
      kind: "PARTI_OFFICIEL",
      organism: "Renaissance",
    }),
    source({
      id: "src-parti-lfi",
      url: "https://lafranceinsoumise.fr/",
      label: "Site officiel — La France insoumise",
      kind: "PARTI_OFFICIEL",
      organism: "La France insoumise",
    }),
    source({
      id: "src-parti-ps",
      url: "https://www.parti-socialiste.fr/",
      label: "Site officiel — Parti socialiste",
      kind: "PARTI_OFFICIEL",
      organism: "Parti socialiste",
    }),
    source({
      id: "src-parti-lr",
      url: "https://www.republicains.fr/",
      label: "Site officiel — Les Républicains",
      kind: "PARTI_OFFICIEL",
      organism: "Les Républicains",
    }),
    source({
      id: "src-media-ump-lr",
      url: "https://www.publicsenat.fr/actualites/politique/de-l-ump-a-lr-une-histoire-mouvementee-un-parti-divise-141653",
      label: "Public Sénat — UMP rebaptisée LR (29 mai 2015)",
      kind: "MEDIA",
      organism: "Public Sénat",
    }),
  ]);

  // ---------------------------------------------------------------------------
  // Partis (généalogie N-aire)
  // ---------------------------------------------------------------------------
  const parties = [
    {
      id: "party-rpr",
      slug: "rassemblement-pour-la-republique",
      name: "Rassemblement pour la République",
      acronym: "RPR",
      foundedOn: d("1976-12-05"),
      dissolvedOn: d("2002-09-21"),
      isActive: false,
      summary:
        "Parti gaulliste fondé par Jacques Chirac (5 décembre 1976). Dissous et intégré à l’UMP lors des assises de Villepinte (21 septembre 2002).",
      websiteUrl: null as string | null,
      sourceIds: ["src-archives-rpr", "src-vp-rpr-dissolution"],
    },
    {
      id: "party-dl",
      slug: "democratie-liberale",
      name: "Démocratie libérale",
      acronym: "DL",
      foundedOn: d("1997-06-24"),
      dissolvedOn: d("2002-09-21"),
      isActive: false,
      summary:
        "Formation libérale (Alain Madelin). Congrès extraordinaire du 21 septembre 2002 : fusion au sein de l’UMP.",
      websiteUrl: null,
      sourceIds: ["src-vp-rpr-dissolution"],
    },
    {
      id: "party-ump",
      slug: "union-pour-un-mouvement-populaire",
      name: "Union pour un mouvement populaire",
      acronym: "UMP",
      foundedOn: d("2002-11-17"),
      dissolvedOn: d("2015-05-29"),
      isActive: false,
      summary:
        "Parti de la droite et du centre-droit issu de l’Union pour la majorité présidentielle (2002). Congrès fondateur du Bourget (17 novembre 2002). Rebaptisé Les Républicains le 29 mai 2015.",
      websiteUrl: null,
      sourceIds: ["src-media-ump-lr", "src-vp-rpr-dissolution"],
    },
    {
      id: "party-lr",
      slug: "les-republicains",
      name: "Les Républicains",
      acronym: "LR",
      foundedOn: d("2015-05-29"),
      dissolvedOn: null,
      isActive: true,
      summary:
        "Parti issu du renommage de l’UMP le 29 mai 2015. Héritier de la généalogie RPR → UMP → LR.",
      websiteUrl: "https://www.republicains.fr/",
      sourceIds: ["src-parti-lr", "src-media-ump-lr"],
    },
    {
      id: "party-fn",
      slug: "front-national",
      name: "Front national",
      acronym: "FN",
      foundedOn: d("1972-10-05"),
      dissolvedOn: d("2018-06-01"),
      isActive: false,
      summary:
        "Parti fondé en 1972. Changement de nom approuvé par les militants le 1er juin 2018 : devient le Rassemblement national.",
      websiteUrl: null,
      sourceIds: ["src-media-fn-rn"],
    },
    {
      id: "party-rn",
      slug: "rassemblement-national",
      name: "Rassemblement national",
      acronym: "RN",
      foundedOn: d("2018-06-01"),
      dissolvedOn: null,
      isActive: true,
      summary:
        "Nouveau nom du Front national depuis le 1er juin 2018 (vote militant à 80,81 %).",
      websiteUrl: "https://rassemblementnational.fr/",
      sourceIds: ["src-parti-rn", "src-media-fn-rn"],
    },
    {
      id: "party-em",
      slug: "en-marche",
      name: "En marche",
      acronym: "EM",
      foundedOn: d("2016-04-06"),
      dissolvedOn: d("2017-05-08"),
      isActive: false,
      summary:
        "Mouvement lancé à Amiens le 6 avril 2016 par Emmanuel Macron (source Élysée).",
      websiteUrl: null,
      sourceIds: ["src-elysee-macron"],
    },
    {
      id: "party-lrem",
      slug: "la-republique-en-marche",
      name: "La République en marche",
      acronym: "LREM",
      foundedOn: d("2017-05-08"),
      dissolvedOn: d("2022-09-17"),
      isActive: false,
      summary:
        "Nouvelle dénomination d’En marche après la présidentielle de 2017. Devient Renaissance lors du congrès du 17 septembre 2022.",
      websiteUrl: null,
      sourceIds: ["src-elysee-macron", "src-media-renaissance"],
    },
    {
      id: "party-renaissance",
      slug: "renaissance",
      name: "Renaissance",
      acronym: "RE",
      foundedOn: d("2022-09-17"),
      dissolvedOn: null,
      isActive: true,
      summary:
        "Parti issu du congrès du 17 septembre 2022 (Carrousel du Louvre) ; succession d’En marche / La République en marche.",
      websiteUrl: "https://parti-renaissance.fr/",
      sourceIds: ["src-parti-renaissance", "src-media-renaissance"],
    },
    {
      id: "party-ps",
      slug: "parti-socialiste",
      name: "Parti socialiste",
      acronym: "PS",
      foundedOn: d("1969-07-01"),
      dissolvedOn: null,
      isActive: true,
      summary:
        "Parti socialiste contemporain (refondation post-SFIO, fin des années 1960 / congrès d’Épinay 1971). Date de fondation indicative — voir sources partisanes.",
      websiteUrl: "https://www.parti-socialiste.fr/",
      sourceIds: ["src-parti-ps"],
    },
    {
      id: "party-lfi",
      slug: "la-france-insoumise",
      name: "La France insoumise",
      acronym: "LFI",
      foundedOn: d("2016-02-10"),
      dissolvedOn: null,
      isActive: true,
      summary:
        "Mouvement créé par Jean-Luc Mélenchon le 10 février 2016 (notice BnF).",
      websiteUrl: "https://lafranceinsoumise.fr/",
      sourceIds: ["src-parti-lfi", "src-bnf-lfi"],
    },
  ];

  for (const p of parties) {
    await prisma.politicalParty.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        acronym: p.acronym,
        foundedOn: p.foundedOn,
        dissolvedOn: p.dissolvedOn,
        isActive: p.isActive,
        summary: p.summary,
        websiteUrl: p.websiteUrl,
        sources: {
          create: p.sourceIds.map((sourceId) => ({ sourceId })),
        },
      },
      update: {
        slug: p.slug,
        name: p.name,
        acronym: p.acronym,
        foundedOn: p.foundedOn,
        dissolvedOn: p.dissolvedOn,
        isActive: p.isActive,
        summary: p.summary,
        websiteUrl: p.websiteUrl,
      },
    });
    // Re-sync sources (idempotent)
    await prisma.politicalPartySource.deleteMany({ where: { partyId: p.id } });
    await prisma.politicalPartySource.createMany({
      data: p.sourceIds.map((sourceId) => ({ partyId: p.id, sourceId })),
      skipDuplicates: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Événements de généalogie (N-aires)
  // ---------------------------------------------------------------------------
  async function historyEvent(input: {
    id: string;
    eventType:
      | "CREATION"
      | "RENOMMAGE"
      | "FUSION"
      | "SCISSION"
      | "ABSORPTION"
      | "ALLIANCE"
      | "DISSOLUTION"
      | "AFFILIATION";
    subjectPartyId: string;
    effectiveOn: Date;
    label: string;
    description?: string;
    sourceIds: string[];
    participants: {
      partyId: string;
      role: "SUBJECT" | "PREDECESSOR" | "SUCCESSOR" | "PARTNER";
      sortOrder: number;
    }[];
  }) {
    await prisma.politicalPartyHistory.upsert({
      where: { id: input.id },
      create: {
        id: input.id,
        eventType: input.eventType,
        subjectPartyId: input.subjectPartyId,
        effectiveOn: input.effectiveOn,
        label: input.label,
        description: input.description,
        participants: {
          create: input.participants.map((p) => ({
            partyId: p.partyId,
            role: p.role,
            sortOrder: p.sortOrder,
          })),
        },
        sources: {
          create: input.sourceIds.map((sourceId) => ({ sourceId })),
        },
      },
      update: {
        eventType: input.eventType,
        subjectPartyId: input.subjectPartyId,
        effectiveOn: input.effectiveOn,
        label: input.label,
        description: input.description,
      },
    });
    await prisma.politicalPartyHistoryParticipant.deleteMany({
      where: { historyId: input.id },
    });
    await prisma.politicalPartyHistoryParticipant.createMany({
      data: input.participants.map((p) => ({
        historyId: input.id,
        partyId: p.partyId,
        role: p.role,
        sortOrder: p.sortOrder,
      })),
    });
    await prisma.politicalPartyHistorySource.deleteMany({
      where: { historyId: input.id },
    });
    await prisma.politicalPartyHistorySource.createMany({
      data: input.sourceIds.map((sourceId) => ({
        historyId: input.id,
        sourceId,
      })),
    });
  }

  await historyEvent({
    id: "hist-ump-fusion-2002",
    eventType: "FUSION",
    subjectPartyId: "party-ump",
    effectiveOn: d("2002-09-21"),
    label: "Fusion RPR / DL → UMP",
    description:
      "Assises extraordinaires du RPR à Villepinte et congrès DL : dissolution et intégration dans l’Union pour la majorité présidentielle / UMP (congrès fondateur 17 novembre 2002).",
    sourceIds: ["src-vp-rpr-dissolution", "src-archives-rpr"],
    participants: [
      { partyId: "party-ump", role: "SUBJECT", sortOrder: 0 },
      { partyId: "party-rpr", role: "PREDECESSOR", sortOrder: 1 },
      { partyId: "party-dl", role: "PREDECESSOR", sortOrder: 2 },
    ],
  });

  await historyEvent({
    id: "hist-lr-renommage-2015",
    eventType: "RENOMMAGE",
    subjectPartyId: "party-lr",
    effectiveOn: d("2015-05-29"),
    label: "UMP → Les Républicains",
    description:
      "L’UMP est rebaptisée Les Républicains le 29 mai 2015.",
    sourceIds: ["src-media-ump-lr", "src-parti-lr"],
    participants: [
      { partyId: "party-lr", role: "SUBJECT", sortOrder: 0 },
      { partyId: "party-ump", role: "PREDECESSOR", sortOrder: 1 },
    ],
  });

  await historyEvent({
    id: "hist-rn-renommage-2018",
    eventType: "RENOMMAGE",
    subjectPartyId: "party-rn",
    effectiveOn: d("2018-06-01"),
    label: "Front national → Rassemblement national",
    description:
      "Consultation des adhérents : 80,81 % favorables ; proclamation le 1er juin 2018 à Bron / Lyon.",
    sourceIds: ["src-media-fn-rn", "src-parti-rn"],
    participants: [
      { partyId: "party-rn", role: "SUBJECT", sortOrder: 0 },
      { partyId: "party-fn", role: "PREDECESSOR", sortOrder: 1 },
    ],
  });

  await historyEvent({
    id: "hist-lrem-renommage-2017",
    eventType: "RENOMMAGE",
    subjectPartyId: "party-lrem",
    effectiveOn: d("2017-05-08"),
    label: "En marche → La République en marche",
    description:
      "Nouvelle dénomination présentée après la victoire présidentielle de mai 2017.",
    sourceIds: ["src-elysee-macron"],
    participants: [
      { partyId: "party-lrem", role: "SUBJECT", sortOrder: 0 },
      { partyId: "party-em", role: "PREDECESSOR", sortOrder: 1 },
    ],
  });

  await historyEvent({
    id: "hist-renaissance-2022",
    eventType: "RENOMMAGE",
    subjectPartyId: "party-renaissance",
    effectiveOn: d("2022-09-17"),
    label: "LREM → Renaissance",
    description:
      "Congrès au Carrousel du Louvre (17 septembre 2022) : adoption des nouveaux statuts et du nom Renaissance.",
    sourceIds: ["src-media-renaissance", "src-parti-renaissance"],
    participants: [
      { partyId: "party-renaissance", role: "SUBJECT", sortOrder: 0 },
      { partyId: "party-lrem", role: "PREDECESSOR", sortOrder: 1 },
    ],
  });

  await historyEvent({
    id: "hist-lfi-creation-2016",
    eventType: "CREATION",
    subjectPartyId: "party-lfi",
    effectiveOn: d("2016-02-10"),
    label: "Création de La France insoumise",
    description: "Fondation publique le 10 février 2016 (notice BnF).",
    sourceIds: ["src-bnf-lfi", "src-parti-lfi"],
    participants: [
      { partyId: "party-lfi", role: "SUBJECT", sortOrder: 0 },
    ],
  });

  await historyEvent({
    id: "hist-em-creation-2016",
    eventType: "CREATION",
    subjectPartyId: "party-em",
    effectiveOn: d("2016-04-06"),
    label: "Création d’En marche",
    description: "Lancement à Amiens le 6 avril 2016 (biographie Élysée).",
    sourceIds: ["src-elysee-macron"],
    participants: [
      { partyId: "party-em", role: "SUBJECT", sortOrder: 0 },
    ],
  });

  // ---------------------------------------------------------------------------
  // Candidats / figures présidentielles (Module A)
  // ---------------------------------------------------------------------------
  type Cand = {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    displayName: string;
    birthDate?: Date;
    birthPlace?: string;
    bio: string;
    websiteUrl?: string;
    isDeclared2027: boolean;
    sourceIds: string[];
  };

  const candidates: Cand[] = [
    {
      id: "cand-lepen",
      slug: "marine-le-pen",
      firstName: "Marine",
      lastName: "Le Pen",
      displayName: "Marine Le Pen",
      birthDate: d("1968-08-05"),
      birthPlace: "Neuilly-sur-Seine (Hauts-de-Seine)",
      bio: "Avocate. Députée du Pas-de-Calais (11e circonscription). Mandats AN : XVe (2017–2022), XVIe (2022–2024), XVIIe (depuis le 1er juillet 2024) — sources Assemblée nationale / Sycomore. Présidente du groupe RN à l’Assemblée (périodes sourcées AN).",
      websiteUrl: undefined,
      // Pressentie historique RN — pas de dépôt officiel 2027 inventé
      isDeclared2027: false,
      sourceIds: ["src-an-lepen", "src-an-sycomore-lepen", "src-hatvp-lepen"],
    },
    {
      id: "cand-melenchon",
      slug: "jean-luc-mélenchon",
      firstName: "Jean-Luc",
      lastName: "Mélenchon",
      displayName: "Jean-Luc Mélenchon",
      birthDate: d("1951-08-19"),
      birthPlace: "Tanger (Maroc)",
      bio: "Fondateur de La France insoumise (10 février 2016, BnF). Député des Bouches-du-Rhône (4e) — XVe législature (21 juin 2017 – 21 juin 2022). Ancien sénateur (mandats Sycomore). Aucune ligne HATVP détaillée importée dans ce seed → fallback portail HATVP côté UI.",
      isDeclared2027: false,
      sourceIds: [
        "src-an-melenchon",
        "src-an-sycomore-melenchon",
        "src-bnf-lfi",
        "src-hatvp-portal",
      ],
    },
    {
      id: "cand-macron",
      slug: "emmanuel-macron",
      firstName: "Emmanuel",
      lastName: "Macron",
      displayName: "Emmanuel Macron",
      birthDate: d("1977-12-21"),
      birthPlace: "Amiens (Somme)",
      bio: "Président de la République (élu 7 mai 2017, réélu 24 avril 2022) — biographie officielle Élysée. Fondateur d’En marche (6 avril 2016). Non éligible à un troisième mandat consécutif : isDeclared2027 = false.",
      websiteUrl: "https://www.elysee.fr/emmanuel-macron",
      isDeclared2027: false,
      sourceIds: ["src-elysee-macron", "src-parti-renaissance"],
    },
    {
      id: "cand-panot",
      slug: "mathilde-panot",
      firstName: "Mathilde",
      lastName: "Panot",
      displayName: "Mathilde Panot",
      birthDate: d("1989-01-15"),
      birthPlace: "Tours (Indre-et-Loire)",
      bio: "Députée du Val-de-Marne (10e circonscription). Présidente du groupe La France insoumise – Nouveau Front populaire à l’Assemblée nationale (mandat en cours, source AN).",
      isDeclared2027: false,
      sourceIds: ["src-an-panot", "src-parti-lfi", "src-hatvp-consulter"],
    },
  ];

  for (const c of candidates) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        slug: c.slug,
        firstName: c.firstName,
        lastName: c.lastName,
        displayName: c.displayName,
        birthDate: c.birthDate,
        birthPlace: c.birthPlace,
        bio: c.bio,
        websiteUrl: c.websiteUrl,
        isDeclared2027: c.isDeclared2027,
        sources: {
          create: c.sourceIds.map((sourceId) => ({ sourceId })),
        },
      },
      update: {
        slug: c.slug,
        firstName: c.firstName,
        lastName: c.lastName,
        displayName: c.displayName,
        birthDate: c.birthDate,
        birthPlace: c.birthPlace,
        bio: c.bio,
        websiteUrl: c.websiteUrl,
        isDeclared2027: c.isDeclared2027,
      },
    });
    await prisma.candidateSource.deleteMany({ where: { candidateId: c.id } });
    await prisma.candidateSource.createMany({
      data: c.sourceIds.map((sourceId) => ({
        candidateId: c.id,
        sourceId,
      })),
    });
  }

  // ---------------------------------------------------------------------------
  // Affiliations
  // ---------------------------------------------------------------------------
  async function affiliation(input: {
    id: string;
    candidateId: string;
    partyId: string;
    startedOn: Date;
    endedOn?: Date;
    role?: string;
    isPrimary?: boolean;
    sourceIds: string[];
  }) {
    await prisma.candidatePartyAffiliation.upsert({
      where: { id: input.id },
      create: {
        id: input.id,
        candidateId: input.candidateId,
        partyId: input.partyId,
        startedOn: input.startedOn,
        endedOn: input.endedOn,
        role: input.role,
        isPrimary: input.isPrimary ?? true,
        sources: {
          create: input.sourceIds.map((sourceId) => ({ sourceId })),
        },
      },
      update: {
        candidateId: input.candidateId,
        partyId: input.partyId,
        startedOn: input.startedOn,
        endedOn: input.endedOn,
        role: input.role,
        isPrimary: input.isPrimary ?? true,
      },
    });
    await prisma.candidatePartyAffiliationSource.deleteMany({
      where: { affiliationId: input.id },
    });
    await prisma.candidatePartyAffiliationSource.createMany({
      data: input.sourceIds.map((sourceId) => ({
        affiliationId: input.id,
        sourceId,
      })),
    });
  }

  await affiliation({
    id: "aff-lepen-fn",
    candidateId: "cand-lepen",
    partyId: "party-fn",
    // Présidence FN à partir de janv. 2011 (période dirigeante sourcée via continuité RN/AN) —
    // date d’adhésion initiale non figée ici pour éviter une invention.
    startedOn: d("2011-01-16"),
    endedOn: d("2018-06-01"),
    role: "présidente (période retenue pour le seed)",
    sourceIds: ["src-media-fn-rn", "src-an-lepen"],
  });
  await affiliation({
    id: "aff-lepen-rn",
    candidateId: "cand-lepen",
    partyId: "party-rn",
    startedOn: d("2018-06-01"),
    role: "cadre / présidente de groupe AN",
    sourceIds: ["src-an-lepen", "src-parti-rn"],
  });
  await affiliation({
    id: "aff-melenchon-lfi",
    candidateId: "cand-melenchon",
    partyId: "party-lfi",
    startedOn: d("2016-02-10"),
    role: "fondateur",
    sourceIds: ["src-bnf-lfi", "src-parti-lfi"],
  });
  await affiliation({
    id: "aff-macron-em",
    candidateId: "cand-macron",
    partyId: "party-em",
    startedOn: d("2016-04-06"),
    endedOn: d("2017-05-08"),
    role: "fondateur / président",
    sourceIds: ["src-elysee-macron"],
  });
  await affiliation({
    id: "aff-macron-lrem",
    candidateId: "cand-macron",
    partyId: "party-lrem",
    startedOn: d("2017-05-08"),
    endedOn: d("2022-09-17"),
    role: "fondateur (présidence quittée après l’élection)",
    isPrimary: false,
    sourceIds: ["src-elysee-macron"],
  });
  await affiliation({
    id: "aff-macron-re",
    candidateId: "cand-macron",
    partyId: "party-renaissance",
    startedOn: d("2022-09-17"),
    role: "président d’honneur (selon sources partisanes)",
    sourceIds: ["src-parti-renaissance", "src-elysee-macron"],
  });
  await affiliation({
    id: "aff-panot-lfi",
    candidateId: "cand-panot",
    partyId: "party-lfi",
    startedOn: d("2017-06-18"),
    role: "députée / présidente de groupe",
    sourceIds: ["src-an-panot", "src-parti-lfi"],
  });

  // ---------------------------------------------------------------------------
  // Mandats AN (Module A parcours — pas Module B votes)
  // ---------------------------------------------------------------------------
  async function mandate(input: {
    id: string;
    candidateId: string;
    displayName: string;
    legislature: number;
    circonscription: string;
    startedOn: Date;
    endedOn?: Date;
    sourceIds: string[];
  }) {
    await prisma.deputyMandate.upsert({
      where: { id: input.id },
      create: {
        id: input.id,
        candidateId: input.candidateId,
        displayName: input.displayName,
        chamber: "ASSEMBLEE_NATIONALE",
        legislature: input.legislature,
        circonscription: input.circonscription,
        startedOn: input.startedOn,
        endedOn: input.endedOn,
        sources: {
          create: input.sourceIds.map((sourceId) => ({ sourceId })),
        },
      },
      update: {
        candidateId: input.candidateId,
        displayName: input.displayName,
        legislature: input.legislature,
        circonscription: input.circonscription,
        startedOn: input.startedOn,
        endedOn: input.endedOn,
      },
    });
    await prisma.deputyMandateSource.deleteMany({
      where: { mandateId: input.id },
    });
    await prisma.deputyMandateSource.createMany({
      data: input.sourceIds.map((sourceId) => ({
        mandateId: input.id,
        sourceId,
      })),
    });
  }

  await mandate({
    id: "man-lepen-15",
    candidateId: "cand-lepen",
    displayName: "Marine Le Pen",
    legislature: 15,
    circonscription: "Pas-de-Calais (11e)",
    startedOn: d("2017-06-21"),
    endedOn: d("2022-06-21"),
    sourceIds: ["src-an-sycomore-lepen", "src-an-lepen"],
  });
  await mandate({
    id: "man-lepen-16",
    candidateId: "cand-lepen",
    displayName: "Marine Le Pen",
    legislature: 16,
    circonscription: "Pas-de-Calais (11e)",
    startedOn: d("2022-06-22"),
    endedOn: d("2024-06-09"),
    sourceIds: ["src-an-sycomore-lepen", "src-an-lepen"],
  });
  await mandate({
    id: "man-lepen-17",
    candidateId: "cand-lepen",
    displayName: "Marine Le Pen",
    legislature: 17,
    circonscription: "Pas-de-Calais (11e)",
    startedOn: d("2024-07-01"),
    sourceIds: ["src-an-lepen", "src-an-sycomore-lepen"],
  });
  await mandate({
    id: "man-melenchon-15",
    candidateId: "cand-melenchon",
    displayName: "Jean-Luc Mélenchon",
    legislature: 15,
    circonscription: "Bouches-du-Rhône (4e)",
    startedOn: d("2017-06-21"),
    endedOn: d("2022-06-21"),
    sourceIds: ["src-an-melenchon", "src-an-sycomore-melenchon"],
  });
  await mandate({
    id: "man-panot-17",
    candidateId: "cand-panot",
    displayName: "Mathilde Panot",
    legislature: 17,
    circonscription: "Val-de-Marne (10e)",
    startedOn: d("2024-07-01"),
    sourceIds: ["src-an-panot"],
  });

  // ---------------------------------------------------------------------------
  // HATVP — déclarations sans montants patrimoniaux inventés
  // Marine Le Pen : fiche nominative + intérêts qualitatifs (pas d’assets €)
  // Mathilde Panot : déclaration « coquille » pointant vers consulter HATVP
  // Mélenchon / Macron : aucune HatvpDeclaration → fallback portail UI
  // ---------------------------------------------------------------------------
  await prisma.hatvpInterest.deleteMany({
    where: { declaration: { candidateId: { in: ["cand-lepen", "cand-panot"] } } },
  });
  await prisma.hatvpAsset.deleteMany({
    where: { declaration: { candidateId: { in: ["cand-lepen", "cand-panot"] } } },
  });
  await prisma.hatvpDeclarationSource.deleteMany({
    where: {
      declaration: { candidateId: { in: ["cand-lepen", "cand-panot"] } },
    },
  });
  await prisma.hatvpDeclaration.deleteMany({
    where: { candidateId: { in: ["cand-lepen", "cand-panot"] } },
  });

  const declLepen = await prisma.hatvpDeclaration.create({
    data: {
      id: "hatvp-lepen-interets",
      candidateId: "cand-lepen",
      kind: "INTERETS",
      hatvpRef: "le-pen-marine",
      hatvpUrl: "https://www.hatvp.fr/fiche-nominative/?declarant=le-pen-marine",
      mandateLabel: "Députée · Pas-de-Calais (11e)",
      summary:
        "Fiche nominative HATVP (intérêts / activités). Aucun montant patrimonial n’est stocké ici : la déclaration de patrimoine est consultable en préfecture selon la HATVP.",
      interests: {
        create: [
          {
            category: "activité professionnelle",
            label: "Élevage de chats",
            organization: "Marine Le Pen",
            startedOn: d("2021-02-01"),
            notes:
              "Activité déclarée sur la fiche HATVP — montants de rémunération non recopiés dans ce seed Module A.",
          },
          {
            category: "mandat électif",
            label: "Député",
            organization: "Assemblée nationale",
            startedOn: d("2022-06-01"),
            endedOn: d("2024-06-01"),
            notes: "Mandat déclaré sur la fiche HATVP (période indiquée sur la fiche).",
          },
        ],
      },
      sources: {
        create: [{ sourceId: "src-hatvp-lepen" }],
      },
    },
  });

  await prisma.hatvpDeclaration.create({
    data: {
      id: "hatvp-panot-portal",
      candidateId: "cand-panot",
      kind: "LES_DEUX",
      hatvpRef: "panot-mathilde-consulter",
      hatvpUrl: "https://www.hatvp.fr/consulter-les-declarations/",
      mandateLabel: "Députée · Val-de-Marne (10e)",
      summary:
        "Aucune ligne HatvpAsset / HatvpInterest importée. Consulter la déclaration sur le moteur HATVP.",
      // assets / interests volontairement omis (optionnels)
      sources: {
        create: [
          { sourceId: "src-hatvp-consulter" },
          { sourceId: "src-an-panot" },
        ],
      },
    },
  });

  void declLepen;

  // Module B — lois & scrutins AN (seed-module-b.ts)
  const moduleB = await seedModuleB(prisma);

  // Module C — sondages Commission + matrices 2017/2022 (seed-module-c.ts)
  const moduleC = await seedModuleC(prisma);

  console.log(
    JSON.stringify(
      {
        ok: true,
        moduleA: {
          parties: parties.length,
          candidates: candidates.length,
          hatvpDeclarations: 2,
          hatvpAssetsInvented: 0,
          hatvpPortalFallback: HATVP_PORTAL,
        },
        moduleB,
        moduleC,
        pollsPresentedAsReal2027: 0,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
