/**
 * Veote — point d’entrée Phusion Passenger (o2switch / cPanel Setup Node.js App)
 *
 * Application startup file : server.js (Application root)
 *
 * Pattern classique Next + http :
 * - Sous Passenger (`PhusionPassenger` ou `PASSENGER_APP_ENV`) → listen("passenger")
 * - Sinon (local `npm start`) → listen(PORT)
 *
 * Pas de bundle standalone : next start / server.js + `.next` complet.
 *
 * @see DEPLOY_O2SWITCH.md
 */

"use strict";

const http = require("http");
const { parse } = require("url");
const next = require("next");

const rootDir = __dirname;
const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "127.0.0.1";

const isPassenger =
  typeof PhusionPassenger !== "undefined" ||
  Boolean(process.env.PASSENGER_APP_ENV);

if (typeof PhusionPassenger !== "undefined") {
  // eslint-disable-next-line no-undef
  PhusionPassenger.configure({ autoInstall: false });
}

// Sous Passenger : toujours production. Sinon respect NODE_ENV.
const dev = isPassenger ? false : process.env.NODE_ENV !== "production";
const app = next({
  dev,
  dir: rootDir,
  hostname,
  port,
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
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
  })
  .catch((err) => {
    console.error("[veote] échec démarrage", err);
    process.exit(1);
  });
