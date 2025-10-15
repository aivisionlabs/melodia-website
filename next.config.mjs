/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure redirects
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "melodia-songs.com",
          },
        ],
        destination: "https://www.melodia-songs.com/:path*",
        permanent: true,
      },
    ];
  },
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
