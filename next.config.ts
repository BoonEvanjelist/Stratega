import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce strict React rendering rules for concurrency & lifecycle safety
  reactStrictMode: true,

  // Remove the x-powered-by header for minor security obfuscation
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // External packages that must run in Node.js (not bundled for edge)
  serverExternalPackages: ["mongoose", "pdf-parse"],

  // Tell Turbopack it's fine that we have a custom Webpack config.
  // Next 16 uses Turbopack by default.
  turbopack: {},
};

export default nextConfig;


