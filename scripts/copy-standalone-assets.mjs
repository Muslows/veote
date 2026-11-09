/**
 * Après `next build` (output: "standalone"), copie `public/` et `.next/static`
 * dans `.next/standalone/` pour que le server.js généré serve les assets.
 *
 * Usage (via package.json) : next build && node scripts/copy-standalone-assets.mjs
 * Copier vers : scripts/copy-standalone-assets.mjs
 */

import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.warn(
    "[veote] `.next/standalone` absent — skip copie assets (vérifier output: \"standalone\").",
  );
  process.exit(0);
}

const publicSrc = path.join(root, "public");
const staticSrc = path.join(root, ".next", "static");

if (existsSync(publicSrc)) {
  cpSync(publicSrc, path.join(standalone, "public"), { recursive: true });
  console.info("[veote] copié public/ → .next/standalone/public/");
}

if (existsSync(staticSrc)) {
  const dest = path.join(standalone, ".next", "static");
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(staticSrc, dest, { recursive: true });
  console.info("[veote] copié .next/static → .next/standalone/.next/static/");
}
