import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce strict React rendering rules for concurrency & lifecycle safety
  reactStrictMode: true,

  // Remove the x-powered-by header for minor security obfuscation
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Suppress TypeScript type errors during Vercel production build.
  // (typescript.ignoreBuildErrors is valid in Next.js 16)
  // Run `npm run typecheck` locally to catch TS errors.
  typescript: {
    ignoreBuildErrors: true,
  },

  // External packages that must run in Node.js (not bundled for edge)
  serverExternalPackages: ["mongoose", "pdf-parse"],

  // Tell Turbopack it's fine that we have a custom Webpack config.
  // Next 16 uses Turbopack by default.
  turbopack: {},
};

export default nextConfig;


