import type { NextConfig } from "next";
import os from "os";

// Dynamically discover local network IPs to avoid manual updates when switching Wi-Fi
const getLocalOrigins = () => {
  const interfaces = os.networkInterfaces();
  const origins = ['localhost', '127.0.0.1', '0.0.0.0'];
  
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    if (addresses) {
      for (const addr of addresses) {
        if (addr.family === 'IPv4' && !addr.internal) {
          origins.push(addr.address);
          // Also allow with port since Next.js sometimes checks for exact string matches
          origins.push(`${addr.address}:3000`);
        }
      }
    }
  }
  return origins;
};

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
  // Automatically allows current local IP for HMR and Dev Server access from other devices
  allowedDevOrigins: getLocalOrigins(),
};

export default nextConfig;
