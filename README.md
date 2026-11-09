# Veote

Plateforme **civic-tech neutre** pour la présidentielle française 2027.

Stack : **Next.js App Router** · TypeScript · Tailwind · Prisma · **PostgreSQL**  
Déploiement cible : **o2switch** (Phusion Passenger, `server.js` classique + `.next`).

| Module | Route | Contenu |
|--------|-------|---------|
| **A** — Candidats & partis | `/candidats` | Fiches, généalogie, HATVP |
| **B** — Lois & votes | `/lois` | Assemblée nationale (v1) |
| **C** — Sondages & simulateur | `/sondages` | Commission des sondages + reports |

Méthodologie & mentions : [`/methodologie`](./app/methodologie/page.tsx).  
Guide déploiement : [`DEPLOY_O2SWITCH.md`](./DEPLOY_O2SWITCH.md).

**Versioning :** toute modification de code doit bumper `APP_VERSION` dans [`lib/version.ts`](./lib/version.ts) avant commit (badge footer/header).

## CI / déploiement

Push sur `main` → [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) build sur GitHub Actions puis déploie sur o2switch (rsync + SSH).

Secrets requis : `O2SWITCH_HOST`, `O2SWITCH_USER`, `O2SWITCH_SSH_KEY`, `O2SWITCH_APP_DIR`, `O2SWITCH_NODE_VENV`.  
Détails : [`DEPLOY_O2SWITCH.md`](./DEPLOY_O2SWITCH.md) § CI / GitHub Actions. Pas de `DATABASE_URL` dans GitHub — la DB est lue sur le serveur.

## Prérequis

- Node.js ≥ 20
- PostgreSQL (local ou o2switch)

## Démarrage local

```bash
cp .env.example .env
# renseigner DATABASE_URL (jamais committer .env)

npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

## Scripts utiles

| Script | Rôle |
|--------|------|
| `npm run build` | `next build` (classique, pas de standalone) |
| `npm start` | Entrée Passenger (`server.js`) |
| `npm run db:seed` | Seed sourcé Modules A + B + C |
| `npm run sync:an` | Sync Open Data Assemblée nationale |

## Sécurité & RGPD

- Pas de cookies de tracking, pas de compte utilisateur, pas de PII collectée.
- Secrets uniquement via `.env` / variables cPanel — **jamais** dans le dépôt.
- Données affichées reliées à une `Source` (`SourceBadge`).

## Licence des données

Sources publiques (HATVP, Open Data AN, Vie-publique, Commission des sondages, etc.) — licences respectives (souvent Licence Ouverte / Etalab).
