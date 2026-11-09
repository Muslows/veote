import type { NextConfig } from "next";

/**
 * Veote — Next.js config (racine projet)
 * - Build classique (pas de output standalone) — Passenger via server.js + `.next`
 * - En-têtes de sécurité (CSP, HSTS, X-Frame-Options, …)
 * - experimental.cpus: 1 recommandé si `next build` tourne sur l’hébergement mutualisé
 * - Pas de cookies de tracking / analytics tiers
 */

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
];

const buildTime = new Date().toISOString();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Horodatage de compilation injecté dans `lib/version.ts` (badge footer/header).
  env: {
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  // Limite les workers de build sur o2switch (mémoire mutualisée).
  // Sans effet notable en CI / machine locale puissante ; sûr partout.
  experimental: {
    cpus: 1,
  },
  // Anciennes routes modules A/B/C → chemins français publics.
  // Les hrefs UI doivent déjà pointer vers /candidats|/lois|/sondages — pas /a|/b|/c.
  async redirects() {
    return [
      { source: "/a", destination: "/candidats", permanent: true },
      { source: "/a/:path*", destination: "/candidats/:path*", permanent: true },
      { source: "/b", destination: "/lois", permanent: true },
      { source: "/b/:path*", destination: "/lois/:path*", permanent: true },
      { source: "/c", destination: "/sondages", permanent: true },
      { source: "/c/:path*", destination: "/sondages/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
