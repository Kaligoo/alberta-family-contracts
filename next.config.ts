import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true
  },
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium', 'mammoth']
};

export default nextConfig;
