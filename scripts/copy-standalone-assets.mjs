/**
 * Après `next build` (output: "standalone"), copie `public/` et `.next/static`
 * dans `.next/standalone/` pour que le server.js généré serve les assets.
 *
 * Usage (via package.json) : next build && node scripts/copy-standalone-assets.mjs
 *
 * Échoue (exit 1) si le dossier standalone existe mais qu’un des assets
 * obligatoires est absent — évite un déploiement « half-built » où `/`
 * peut répondre et les chunks / routes cassent en 404.
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");
const standaloneServer = path.join(standalone, "server.js");

if (!existsSync(standalone) || !existsSync(standaloneServer)) {
  console.warn(
    "[veote] `.next/standalone/server.js` absent — skip copie assets (vérifier output: \"standalone\").",
  );
  process.exit(0);
}

const publicSrc = path.join(root, "public");
const staticSrc = path.join(root, ".next", "static");
const errors = [];

if (!existsSync(staticSrc)) {
  errors.push(
    `.next/static introuvable après build — les chunks JS/CSS manqueraient en prod.`,
  );
} else {
  const dest = path.join(standalone, ".next", "static");
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(staticSrc, dest, { recursive: true });
  console.info("[veote] copié .next/static → .next/standalone/.next/static/");
}

if (existsSync(publicSrc)) {
  cpSync(publicSrc, path.join(standalone, "public"), { recursive: true });
  console.info("[veote] copié public/ → .next/standalone/public/");
} else {
  console.warn("[veote] public/ absent — skip (ok si aucun asset public).");
}

// Garde-fou layout standalone attendu par Passenger / npm start.
const required = [
  path.join(standalone, "server.js"),
  path.join(standalone, ".next"),
];
for (const p of required) {
  if (!existsSync(p)) {
    errors.push(`manque ${path.relative(root, p)} dans le bundle standalone`);
  }
}

if (existsSync(path.join(standalone, ".next", "static"))) {
  const entries = readdirSync(path.join(standalone, ".next", "static"));
  if (entries.length === 0) {
    errors.push(".next/standalone/.next/static/ est vide");
  }
}

if (errors.length > 0) {
  console.error("[veote] copie standalone incomplète :");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.info("[veote] standalone assets OK");
