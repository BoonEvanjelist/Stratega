import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce strict React rendering rules for concurrency & lifecycle safety
  reactStrictMode: true,

  // Remove the x-powered-by header for minor security obfuscation
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Webpack tuning
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse v2 uses pdfjs-dist which ships a canvas optional dependency.
      // Treat canvas as an external so it doesn't try to bundle it and crash.
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        { canvas: "commonjs canvas" },
      ];
    }

    // Mini-CSS extraction is handled natively by Next.js App Router,
    // but we can enforce CSS/JS chunk optimizations here.
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: "all",
      };
    }

    return config;
  },

  // Tell Turbopack it's fine that we have a custom Webpack config.
  // Next 16 uses Turbopack by default.
  turbopack: {},
};

export default nextConfig;
