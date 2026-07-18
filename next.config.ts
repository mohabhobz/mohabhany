import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* Pin the workspace root. Without this, a stray lockfile elsewhere on the
     machine can make Turbopack pick the wrong directory as root. */
  turbopack: { root: here },

  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  experimental: {
    optimizePackageImports: ["motion"],
    /* Local uploads go through a Server Action, which caps request bodies at
       1MB by default. Raised for building locally.
       NOTE: this only applies to the local file store. In production, uploads
       go straight from the browser to Supabase Storage and never touch this
       limit — which is why the storage router exists. */
    serverActions: { bodySizeLimit: "100mb" },
  },
};

export default nextConfig;
