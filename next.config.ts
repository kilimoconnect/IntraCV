import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "canvas"],
  // Disable Turbopack for production builds — it panics on Next.js 16.1.6
  turbopack: false,
};

export default nextConfig;
