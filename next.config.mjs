/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper CSS handling
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
