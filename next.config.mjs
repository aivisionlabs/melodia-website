/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure image domains for external images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn2.suno.ai",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lalals.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Turbopack configuration
  turbopack: {
    resolveAlias: {
      // Handle fs fallback for browser compatibility - use empty string for Turbopack
      fs: "",
    },
  },
  // Keep webpack config as fallback for non-Turbopack builds
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
