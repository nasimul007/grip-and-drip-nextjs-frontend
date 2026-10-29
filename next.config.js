// next/image only resizes pictures from our own API, so the optimizer cannot be
// used to fetch and cache images from arbitrary sites.
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", ""),
        hostname: apiUrl.hostname,
        ...(apiUrl.port ? { port: apiUrl.port } : {}),
        pathname: "/media/**",
      },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async redirects() {
    return [
      { source: "/shop-with-sidebar", destination: "/shop", permanent: true },
      { source: "/shop-without-sidebar", destination: "/shop", permanent: true },
      { source: "/shop-details", destination: "/shop", permanent: true },
      { source: "/blogs/:path*", destination: "/", permanent: true },
      { source: "/error", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/media/:path*`,
      },
      {
        source: '/daraz-location',
        destination: 'https://member.daraz.com.bd/locationtree/api/getSubAddressList',
      },
    ];
  },
};

module.exports = nextConfig;
