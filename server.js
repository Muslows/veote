/**
 * Veote — point d’entrée Phusion Passenger (o2switch / cPanel Setup Node.js App)
 *
 * Application startup file : server.js (à la racine du projet = Application root)
 *
 * Comportement :
 * 1. Si `.next/standalone/server.js` existe (après `next build` + copie static/public),
 *    démarre le serveur standalone généré par Next (léger, idéal prod).
 * 2. Sinon, démarre un serveur HTTP classique via le package `next`
 *    (nécessite node_modules complets + `.next` buildé).
 *
 * Passenger injecte `PORT` — ne jamais hardcoder un port, ni lancer
 * manuellement `node server.js` en parallèle de Passenger.
 *
 * @see docs/DEPLOY_O2SWITCH.md
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
  process.chdir(standaloneDir);
  // PORT déjà fourni par Passenger / l’environnement cPanel.
  require(standaloneServer);
  console.info(
    `[veote] Passenger → Next standalone (${standaloneDir}) PORT=${process.env.PORT ?? port}`,
  );
}

function bootClassic() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const next = require("next");
  const dev = process.env.NODE_ENV !== "production";
  const app = next({
    dev,
    dir: rootDir,
    hostname,
    port,
  });
  const handle = app.getRequestHandler();

  return app.prepare().then(() => {
    const listenTarget = isPassenger ? "passenger" : port;

    http
      .createServer((req, res) => {
        const parsedUrl = parse(req.url || "/", true);
        handle(req, res, parsedUrl).catch((err) => {
          console.error("[veote] request error", req.url, err);
          res.statusCode = 500;
          res.end("internal server error");
        });
      })
      .listen(listenTarget, () => {
        console.info(
          `[veote] Passenger → Next classic (${dev ? "dev" : "prod"}) listen=${listenTarget}`,
        );
      });
  });
}

async function main() {
  if (fs.existsSync(standaloneServer)) {
    bootStandalone();
    return;
  }

  console.warn(
    "[veote] `.next/standalone/server.js` introuvable — fallback serveur next classique. Lancez `npm run build` (output: standalone) pour le chemin recommandé.",
  );
  await bootClassic();
}

main().catch((err) => {
  console.error("[veote] échec démarrage", err);
  process.exit(1);
});
