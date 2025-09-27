import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'apiboxfiles.erweima.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dl.espressif.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
