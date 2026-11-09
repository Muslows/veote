# Veote — Déploiement o2switch (cPanel + Phusion Passenger)

Guide pas à pas pour mettre en production Veote sur un hébergement **o2switch** : PostgreSQL, Setup Node.js App, Prisma, seed, cron Open Data AN.

Prérequis : modules A/B/C assemblés dans un projet Next.js App Router (voir [`assembly.md`](./assembly.md)).  
FAQ o2switch : [Setup Node.js App](https://faq.o2switch.fr/cpanel/logiciels/hebergement-nodejs-multi-version/).

---

## 0. Arborescence recommandée sur l’hébergement

| Chemin | Rôle |
|--------|------|
| `~/veote/` | **Application root** (sources Node — **pas** le document root du domaine) |
| `~/votredomaine.tld/` | Document root du domaine — cPanel y place un `.htaccess` Passenger |
| `~/veote/logs/` | Logs app + cron (`sync-an.log`) |
| `~/veote/.cache/sync-an/` | Cache téléchargements Open Data AN |

Ne placez **pas** les sources dans le document root du domaine (risque d’exposition si l’app est stoppée).

---

## 1. Créer la base PostgreSQL

1. cPanel → **PostgreSQL Databases** (ou « Bases de données PostgreSQL »).
2. Créer une base, un utilisateur, et attribuer tous les privilèges.
3. Noter host (souvent `127.0.0.1` ou un hostname fourni), port `5432`, nom de base, user, mot de passe.
4. Construire l’URL :

```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
```

Caractères spéciaux du mot de passe : URL-encoder (`@` → `%40`, etc.).

---

## 2. Déposer le code

1. Créer `~/veote/` (File Manager ou SSH).
2. Transférer le projet (git clone, rsync, ou ZIP) **hors** document root.
3. Vérifier la présence à la racine de :
   - `server.js` (entrée Passenger — depuis [`assembly/server.js`](./assembly/server.js))
   - `package.json`, `next.config.ts` (`output: "standalone"`)
   - `prisma/schema.prisma`, `prisma/seed*.ts`
   - `scripts/sync-an.ts`, `scripts/copy-standalone-assets.mjs`
   - `app/`, `components/`, `lib/`, `public/`

Copie-ready assemblage : [`docs/assembly/`](./assembly/).

---

## 3. Setup Node.js App (Passenger)

1. cPanel → **Setup Node.js App** → **Create Application**.
2. Réglages :

| Champ | Valeur |
|-------|--------|
| Node.js version | **20** ou **22** (engines ≥ 20) |
| Application mode | **Production** |
| Application root | `veote` (chemin relatif depuis home) |
| Application URL | votre domaine (sous-dossier vide si racine) |
| Application startup file | **`server.js`** |
| Passenger log file | `logs/passenger.log` (sous `veote/`) |

3. **Add Variable** — au minimum :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL PostgreSQL (étape 1) |
| `NODE_ENV` | `production` |

Optionnel : `AN_OPEN_DATA_BASE`, `AN_SYNC_CACHE_DIR`, `NEXT_PUBLIC_SITE_URL` (voir [`.env.example`](./assembly/.env.example)).

4. **Create** — ne pas lancer l’app tout de suite (build d’abord).
5. Copier la commande `source …/activate` affichée (environnement Node virtuel).

---

## 4. Install, Prisma, build (SSH)

Préférer un **vrai client SSH** (le Terminal cPanel est plus restrictif mémoire).

```bash
# Entrer dans l’environnement Node créé par cPanel
source ~/nodevenv/veote/20/bin/activate   # adapter version / chemin affiché

cd ~/veote

# Dépendances
npm install

# Schéma → client Prisma
npx prisma generate

# Appliquer le schéma
# - avec migrations versionnées :
npm run db:migrate
# - ou push direct (proto / premier jet) :
npm run db:push

# Seed (données réelles sourcées A/B/C + sondage de test labellisé)
npm run db:seed

# Build production (standalone + copie public/static)
npm run build
```

Si `next build` est tué (OOM) : builder en local, uploader `.next/` (dont `standalone/`) + `node_modules` de prod, puis `npx prisma generate` sur le serveur.

---

## 5. Démarrer l’application

1. Setup Node.js App → **Restart** / **Start App**.
2. Ouvrir le domaine — vérifier `/`, `/candidats`, `/lois`, `/sondages`, `/methodologie`.
3. Logs : `~/veote/logs/passenger.log` et éventuels logs Next.

Passenger gère le process : **ne pas** lancer `node server.js` manuellement en parallèle.

Sous **Passenger**, `server.js` utilise toujours le handler Next classique avec
`listen("passenger")` (le `server.js` généré dans `.next/standalone/` écoute un
port TCP et casse le routage o2switch — symptômes typiques : seul `/` répond,
`/candidats` `/lois` `/sondages` `/methodologie` en 404).

Hors Passenger (`npm start` local), `server.js` délègue au bundle standalone s’il
existe.

**Document root du domaine** : laisser le `.htaccess` Passenger généré par cPanel
(proxy de *toutes* les URLs vers Node), ou aligner sur le modèle [`.htaccess`](./.htaccess)
du dépôt (chemins `USER` / `nodevenv` à adapter). Ne **pas** ajouter de
`ErrorDocument` / rewrite qui 404 avant Passenger, et ne pas servir uniquement
`public/` via Apache — les routes App Router ne sont pas des fichiers statiques.

---

## 6. Cron — sync Open Data AN

Après seed + au moins un premier sync dry-run réussi.

1. cPanel → **Cron Jobs**.
2. Fréquence suggérée : **quotidien 4h** (faible charge AN).
3. Commande (adapter USER, version nodevenv, législature) :

```bash
0 4 * * * mkdir -p /home/USER/veote/logs /home/USER/veote/.cache/sync-an && source /home/USER/nodevenv/veote/20/bin/activate && cd /home/USER/veote && npm run sync:an -- --legislature=17 >> /home/USER/veote/logs/sync-an.log 2>&1
```

`scripts/sync-an.ts` charge automatiquement `.env` via `import "dotenv/config"` (dépendance `dotenv` dans `package.json`). Pas besoin de `-r dotenv/config` dans le cron.

Test manuel :

```bash
source ~/nodevenv/veote/20/bin/activate
cd ~/veote
npm run sync:an -- --legislature=17 --dry-run
npm run sync:an -- --legislature=17
```

Prérequis système : binaire `unzip` (présent sur o2switch Linux) ; `DATABASE_URL` ; licence données Etalab 2.0.

---

## 7. Checklist post-déploiement

- [ ] HTTPS actif (o2switch / Let’s Encrypt)
- [ ] `/methodologie` accessible depuis le footer
- [ ] SourceBadge visibles Modules A/B/C
- [ ] Pas de cookies de tracking (DevTools)
- [ ] `DATABASE_URL` uniquement en variables d’env (pas dans le repo)
- [ ] Cron `sync-an` écrit dans `logs/sync-an.log`
- [ ] Mentions éditeur / contact complétées sur `/methodologie` avant annonce publique

---

## 8. Mises à jour

**Automatique (recommandé)** : push sur `main` → workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) (build CI + rsync + `prisma db push` + restart Passenger). Voir § CI ci-dessous.

**Manuel** :

```bash
source ~/nodevenv/veote/20/bin/activate
cd ~/veote
git pull   # ou re-upload
npm install
npx prisma migrate deploy   # si nouvelles migrations
npm run build
# Setup Node.js App → Restart
```

---

## CI / GitHub Actions

Workflow : `.github/workflows/deploy.yml` — déclenché sur **push à `main`** (et `workflow_dispatch`).

1. Runner `ubuntu-latest` : Node **20**, `npm ci`, `npx prisma generate`, `npm run build`
2. **rsync** over SSH des artefacts prod : `.next`, `public`, `prisma`, `scripts`, `server.js`, `package.json`, `package-lock.json`, `next.config.*`
3. Sur le serveur : `source` du nodevenv → `npm ci --omit=dev` → `npx prisma db push` → `touch tmp/restart.txt` (Passenger)

Exclusions permanentes : `.env`, `node_modules`, `.git` (le `.env` / variables cPanel restent sur le serveur).

### Secrets GitHub requis

| Secret | Rôle |
|--------|------|
| `O2SWITCH_HOST` | Hostname SSH |
| `O2SWITCH_USER` | Utilisateur SSH |
| `O2SWITCH_SSH_KEY` | Clé privée SSH (PEM) |
| `O2SWITCH_APP_DIR` | Racine app absolue (ex. `/home/USER/veote`) |
| `O2SWITCH_NODE_VENV` | Script `activate` Node cPanel (ex. `/home/USER/nodevenv/veote/20/bin/activate`) |

**Ne pas** ajouter `DATABASE_URL` aux secrets GitHub : `prisma generate` en CI n’en a pas besoin ; `db push` lit l’URL sur le serveur (`.env` ou variables Setup Node.js App).

---

## Scripts npm utiles

| Script | Action |
|--------|--------|
| `npm run build` | `next build` + copie assets standalone |
| `npm start` | `node server.js` (local ; en prod = Passenger) |
| `npm run db:push` | Pousse le schéma Prisma |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed A+B+C |
| `npm run sync:an` | Sync Open Data AN |

Fichiers assemblage : [`docs/assembly/`](./assembly/) · index : [`assembly.md`](./assembly.md).
