import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Increase body size limit for large file uploads (default is 10MB via body-streams clone limit)
  experimental: {
    // Use numeric bytes (1GB) — Next.js doesn't parse string sizes for this key like it does for serverActions
    proxyClientMaxBodySize: 1073741824,
  },
};

export default nextConfig;
