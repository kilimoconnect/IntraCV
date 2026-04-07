import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "canvas"],
  // ESLint is run separately in CI; skip during next build to avoid
  // version-mismatch issues with eslint-config-next flat-config exports.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
