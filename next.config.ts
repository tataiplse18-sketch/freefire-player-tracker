import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles output mode automatically */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ffitems.devhubx.org",
      },
      {
        protocol: "https",
        hostname: "developers.freefirecommunity.com",
      },
    ],
  },
};

export default nextConfig;