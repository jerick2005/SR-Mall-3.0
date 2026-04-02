import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  serverExternalPackages: ['@prisma/client', '@srmall/database'],
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  allowedDevOrigins: ['127.0.0.1', '192.168.0.109'],
};

export default nextConfig;
