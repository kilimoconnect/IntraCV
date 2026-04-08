import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "canvas"],
  // ESLint is run separately in CI; skip during next build to avoid
  // version-mismatch issues with eslint-config-next flat-config exports.
  eslint: { ignoreDuringBuilds: true },
  // TypeScript is checked separately via `tsc --noEmit`; skip during next build
  // so missing optional native packages (puppeteer-core, chromium) don't block deploys.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
