/**
 * Veote — point d’entrée Phusion Passenger (o2switch / cPanel Setup Node.js App)
 *
 * Application startup file : server.js (à la racine du projet = Application root)
 *
 * Comportement :
 * 1. Sous Phusion Passenger : toujours Next classique
 *    `next({ dev: false })` + `getRequestHandler()` + `listen("passenger")`.
 *    Ne jamais `require()` le `.next/standalone/server.js` généré (il fait
 *    `listen(PORT)` TCP), sinon seules certaines routes (souvent `/`)
 *    répondent et le reste tombe en 404 Apache / « page manquante ».
 * 2. Hors Passenger (`npm start` local) : si le bundle standalone existe
 *    (après `next build` + copie static/public), délègue à
 *    `.next/standalone/server.js`.
 * 3. Sinon : handler Next classique sur PORT.
 *
 * Passenger injecte `PORT` — ne jamais hardcoder un port, ni lancer
 * manuellement `node server.js` en parallèle de Passenger.
 *
 * @see DEPLOY_O2SWITCH.md
 * @see .htaccess (document root domaine — ne pas 404 avant Passenger)
 */

"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { parse } = require("url");

const rootDir = __dirname;
const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "127.0.0.1";
const isPassenger = typeof PhusionPassenger !== "undefined";

if (isPassenger) {
  // eslint-disable-next-line no-undef
  PhusionPassenger.configure({ autoInstall: false });
}

const standaloneServer = path.join(
  rootDir,
  ".next",
  "standalone",
  "server.js",
);

function bootStandalone() {
  const standaloneDir = path.dirname(standaloneServer);
  // Le server.js généré par Next attend d’être exécuté depuis son dossier
  // (chemins relatifs vers `.next` / `node_modules` du bundle standalone).
  // Uniquement hors Passenger — voir commentaire en tête de fichier.
  process.chdir(standaloneDir);
  require(standaloneServer);
  console.info(
    `[veote] Next standalone (${standaloneDir}) PORT=${process.env.PORT ?? port}`,
  );
}

function bootClassic({ forceProd = false } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const next = require("next");
  // Sous Passenger : toujours production (dev: false) — demandé pour o2switch.
  const dev = forceProd ? false : process.env.NODE_ENV !== "production";
  const app = next({
    dev,
    dir: rootDir,
    hostname,
    port,
  });
  const handle = app.getRequestHandler();

  return app.prepare().then(() => {
    // Sous Passenger : socket nommé "passenger" (pas un port TCP).
    const listenTarget = isPassenger ? "passenger" : port;

    http
      .createServer((req, res) => {
        const parsedUrl = parse(req.url || "/", true);
        handle(req, res, parsedUrl).catch((err) => {
          console.error("[veote] request error", req.url, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end("internal server error");
          }
        });
      })
      .listen(listenTarget, () => {
        console.info(
          `[veote] Next classic (${dev ? "dev" : "prod"}) listen=${listenTarget} dir=${rootDir}`,
        );
      });
  });
}

async function main() {
  if (isPassenger) {
    // Chemin production o2switch : next({ dev: false }) + listen("passenger").
    // Le bundle standalone reste utile pour npm start / Docker, pas ici.
    if (!fs.existsSync(path.join(rootDir, ".next", "BUILD_ID"))) {
      console.error(
        "[veote] `.next/BUILD_ID` introuvable — lancez `npm run build` avant le restart Passenger.",
      );
      process.exit(1);
    }
    await bootClassic({ forceProd: true });
    return;
  }

  if (fs.existsSync(standaloneServer)) {
    bootStandalone();
    return;
  }

  console.warn(
    "[veote] `.next/standalone/server.js` introuvable — fallback serveur next classique. Lancez `npm run build` (output: standalone) pour le chemin recommandé hors Passenger.",
  );
  await bootClassic();
}

main().catch((err) => {
  console.error("[veote] échec démarrage", err);
  process.exit(1);
});
