import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Increase body size limit for large file uploads (default is 10MB via body-streams clone limit)
  experimental: {
    proxyClientMaxBodySize: '1gb',
  },
};

export default nextConfig;
