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
  allowedDevOrigins: ['127.0.0.1', '192.168.0.109', '192.168.0.101', '192.168.0.118', 'localhost'],
};

export default nextConfig;
