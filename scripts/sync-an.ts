import "dotenv/config";

/**
 * Veote — sync Open Data Assemblée nationale → Prisma (Module B).
 *
 * Télécharge les archives JSON officielles (scrutins + dossiers législatifs)
 * depuis data.assemblee-nationale.fr, puis upsert les champs an*Uid /
 * lastSyncedAt. Conçu pour un cron o2switch (Node + tsx ou build JS).
 *
 * Usage local :
 *   npx tsx scripts/sync-an.ts --legislature=16 --dry-run
 *   npx tsx scripts/sync-an.ts --legislature=16
 *   npx tsx scripts/sync-an.ts --legislature=17 --limit=50
 *
 * Cron o2switch (exemple cPanel / crontab) — après `next build` + Prisma :
 *   0 4 * * * cd /home/USER/veote && npm run sync:an -- --legislature=17 \
 *     >> logs/sync-an.log 2>&1
 *
 * Charge automatiquement `.env` via `import "dotenv/config"` (pas besoin de `-r dotenv/config`).
 *
 * Prérequis env : DATABASE_URL
 * Optionnel : AN_OPEN_DATA_BASE (défaut ci-dessous), AN_SYNC_CACHE_DIR
 *
 * Licence données : Licence Ouverte / Etalab 2.0 (Assemblée nationale).
 */

import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { PrismaClient } from "@prisma/client";

const DEFAULT_BASE = "https://data.assemblee-nationale.fr/static/openData/repository";

type CliOptions = {
  legislature: number;
  dryRun: boolean;
  limit: number | null;
  baseUrl: string;
  cacheDir: string;
};

function parseArgs(argv: string[]): CliOptions {
  let legislature = 17;
  let dryRun = false;
  let limit: number | null = null;
  const baseUrl = process.env.AN_OPEN_DATA_BASE ?? DEFAULT_BASE;
  const cacheDir =
    process.env.AN_SYNC_CACHE_DIR ??
    path.join(tmpdir(), "veote-sync-an");

  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg.startsWith("--legislature=")) {
      legislature = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--limit=")) {
      limit = Number(arg.split("=")[1]);
    }
  }

  if (!Number.isFinite(legislature) || legislature < 1) {
    throw new Error(`Legislature invalide: ${legislature}`);
  }

  return { legislature, dryRun, limit, baseUrl, cacheDir };
}

function scrutinZipUrl(base: string, legislature: number): string {
  return `${base}/${legislature}/loi/scrutins/Scrutins.json.zip`;
}

function dossiersZipUrl(base: string, legislature: number): string {
  return `${base}/${legislature}/loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip`;
}

async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: { Accept: "application/zip,*/*" },
    redirect: "follow",
  });
  if (!res.ok || !res.body) {
    throw new Error(`Téléchargement échoué ${res.status} — ${url}`);
  }
  // @ts-expect-error Node fetch body → Readable
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

/**
 * Décompresse un .zip Open Data AN (souvent un seul JSON à la racine
 * ou sous un dossier). Implémentation minimale via `unzip` système si dispo,
 * sinon lit un JSON déjà extrait à côté du zip (mode CI / cache).
 */
async function extractJsonFromZip(
  zipPath: string,
  extractDir: string,
): Promise<unknown> {
  mkdirSync(extractDir, { recursive: true });

  // Préférer unzip système (disponible sur o2switch / Linux)
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execFileAsync = promisify(execFile);
  try {
    await execFileAsync("unzip", ["-o", zipPath, "-d", extractDir]);
  } catch {
    // Fallback : certains environnements n’ont pas unzip — tenter lecture directe
    // si un .json sibling existe (pré-extrait).
    const sibling = zipPath.replace(/\.zip$/i, "");
    if (existsSync(sibling)) {
      return JSON.parse(await readFile(sibling, "utf8"));
    }
    throw new Error(
      `Impossible d’extraire ${zipPath}. Installez unzip ou pré-extraire le JSON.`,
    );
  }

  const { readdir } = await import("node:fs/promises");
  async function findJson(dir: string): Promise<string | null> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isFile() && e.name.endsWith(".json")) return p;
      if (e.isDirectory()) {
        const nested = await findJson(p);
        if (nested) return nested;
      }
    }
    return null;
  }

  const jsonPath = await findJson(extractDir);
  if (!jsonPath) throw new Error(`Aucun JSON dans ${zipPath}`);
  return JSON.parse(await readFile(jsonPath, "utf8"));
}

/** Navigation souple dans le JSON Open Data (structures varient légèrement). */
function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    for (const key of ["scrutin", "dossier", "export", "data"]) {
      if (Array.isArray(o[key])) return o[key] as unknown[];
    }
    // Parfois { scrutin: [ ... ] } encapsulé sous une clé racine unique
    const vals = Object.values(o);
    if (vals.length === 1 && Array.isArray(vals[0])) return vals[0] as unknown[];
  }
  return [];
}

function pickUid(obj: Record<string, unknown>): string | null {
  const uid = obj.uid ?? obj["@uid"] ?? obj.id;
  return typeof uid === "string" ? uid : null;
}

function pickString(
  obj: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

type SyncStats = {
  legislature: number;
  dryRun: boolean;
  downloaded: { scrutins?: string; dossiers?: string };
  scrutinCandidates: number;
  dossierCandidates: number;
  voteRecordsUpdated: number;
  lawsUpdated: number;
  errors: string[];
};

async function syncLegislature(
  prisma: PrismaClient,
  opts: CliOptions,
): Promise<SyncStats> {
  const stats: SyncStats = {
    legislature: opts.legislature,
    dryRun: opts.dryRun,
    downloaded: {},
    scrutinCandidates: 0,
    dossierCandidates: 0,
    voteRecordsUpdated: 0,
    lawsUpdated: 0,
    errors: [],
  };

  mkdirSync(opts.cacheDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const workDir = path.join(
    opts.cacheDir,
    `L${opts.legislature}-${stamp}`,
  );
  mkdirSync(workDir, { recursive: true });

  const now = new Date();

  // --- Scrutins -------------------------------------------------------------
  try {
    const url = scrutinZipUrl(opts.baseUrl, opts.legislature);
    const zipPath = path.join(workDir, "Scrutins.json.zip");
    console.info(`[sync-an] GET ${url}`);
    await download(url, zipPath);
    stats.downloaded.scrutins = url;

    const raw = await extractJsonFromZip(
      zipPath,
      path.join(workDir, "scrutins"),
    );
    let items = asArray(raw);
    // Structure fréquente : { scrutin: [ { scrutin: { uid, ... } }, ... ] }
    items = items.map((it) => {
      if (it && typeof it === "object" && "scrutin" in (it as object)) {
        return (it as { scrutin: unknown }).scrutin;
      }
      return it;
    });
    if (opts.limit != null) items = items.slice(0, opts.limit);
    stats.scrutinCandidates = items.length;

    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const s = item as Record<string, unknown>;
      const uid = pickUid(s);
      if (!uid) continue;

      // Numéro de scrutin — champs variables selon export
      const numero =
        pickString(s, "numero", "n", "numeroScrutin") ??
        (typeof s.numero === "number" ? String(s.numero) : null);

      const existing = await prisma.voteRecord.findFirst({
        where: {
          OR: [
            { anScrutinUid: uid },
            ...(numero
              ? [{ scrutinRef: numero, chamber: "ASSEMBLEE_NATIONALE" as const }]
              : []),
          ],
        },
      });

      if (!existing) {
        // Import full upsert des nouveaux scrutins = phase 2 ;
        // v1 met à jour les enregistrements seedés / déjà liés.
        continue;
      }

      if (opts.dryRun) {
        stats.voteRecordsUpdated += 1;
        continue;
      }

      await prisma.voteRecord.update({
        where: { id: existing.id },
        data: {
          anScrutinUid: uid,
          lastSyncedAt: now,
          importedAt: existing.importedAt ?? now,
          chamber: "ASSEMBLEE_NATIONALE",
        },
      });
      stats.voteRecordsUpdated += 1;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    stats.errors.push(`scrutins: ${msg}`);
    console.error(`[sync-an] scrutins — ${msg}`);
  }

  // --- Dossiers législatifs -------------------------------------------------
  try {
    const url = dossiersZipUrl(opts.baseUrl, opts.legislature);
    const zipPath = path.join(workDir, "Dossiers_Legislatifs.json.zip");
    console.info(`[sync-an] GET ${url}`);
    await download(url, zipPath);
    stats.downloaded.dossiers = url;

    const raw = await extractJsonFromZip(
      zipPath,
      path.join(workDir, "dossiers"),
    );
    let items = asArray(raw);
    items = items.map((it) => {
      if (it && typeof it === "object" && "dossierParlementaire" in (it as object)) {
        return (it as { dossierParlementaire: unknown }).dossierParlementaire;
      }
      if (it && typeof it === "object" && "dossier" in (it as object)) {
        return (it as { dossier: unknown }).dossier;
      }
      return it;
    });
    if (opts.limit != null) items = items.slice(0, opts.limit);
    stats.dossierCandidates = items.length;

    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const d = item as Record<string, unknown>;
      const uid = pickUid(d);
      if (!uid) continue;

      const existing = await prisma.law.findFirst({
        where: {
          OR: [
            { anDossierUid: uid },
            // Match soft sur titre si déjà seedé sans uid
            ...(pickString(d, "titre", "title")
              ? [
                  {
                    title: {
                      contains: pickString(d, "titre", "title")!.slice(0, 48),
                      mode: "insensitive" as const,
                    },
                    chamber: "ASSEMBLEE_NATIONALE" as const,
                  },
                ]
              : []),
          ],
        },
      });

      if (!existing) continue;

      if (opts.dryRun) {
        stats.lawsUpdated += 1;
        continue;
      }

      await prisma.law.update({
        where: { id: existing.id },
        data: {
          anDossierUid: existing.anDossierUid ?? uid,
          lastSyncedAt: now,
          importedAt: existing.importedAt ?? now,
          chamber: "ASSEMBLEE_NATIONALE",
        },
      });
      stats.lawsUpdated += 1;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    stats.errors.push(`dossiers: ${msg}`);
    console.error(`[sync-an] dossiers — ${msg}`);
  }

  // Manifeste local pour audit cron
  await writeFile(
    path.join(workDir, "sync-manifest.json"),
    JSON.stringify(stats, null, 2),
    "utf8",
  );

  // Nettoyage zip lourds si succès sans erreur fatale (garder manifeste)
  try {
    await rm(path.join(workDir, "Scrutins.json.zip"), { force: true });
    await rm(path.join(workDir, "Dossiers_Legislatifs.json.zip"), {
      force: true,
    });
  } catch {
    /* ignore */
  }

  return stats;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();

  console.info(
    `[sync-an] legislature=${opts.legislature} dryRun=${opts.dryRun} limit=${opts.limit ?? "∞"}`,
  );

  try {
    const stats = await syncLegislature(prisma, opts);
    console.log(JSON.stringify(stats, null, 2));
    if (stats.errors.length) process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
