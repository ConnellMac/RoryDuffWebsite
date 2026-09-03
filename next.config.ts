import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CI runs strict `tsc --noEmit` separately; avoid duplicate build-worker checking.
  typescript: { ignoreBuildErrors: true },
  experimental: { cpus: 1, workerThreads: true },
};

export default nextConfig;
