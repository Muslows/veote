import type { NextConfig } from "next";

/**
 * Veote — Next.js config (racine projet)
 * - output: "standalone" pour déploiement o2switch Passenger
 * - En-têtes de sécurité (CSP, HSTS, X-Frame-Options, …)
 * - experimental.cpus: 1 recommandé si `next build` tourne sur l’hébergement mutualisé
 * - Pas de cookies de tracking / analytics tiers
 *
 * Copier vers : next.config.ts (racine)
 * Miroir fondation : docs/ui-foundation/next.config.ts
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

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Limite les workers de build sur o2switch (mémoire mutualisée).
  // Sans effet notable en CI / machine locale puissante ; sûr partout.
  experimental: {
    cpus: 1,
  },
  // Anciennes routes modules A/B/C → chemins français publics.
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
