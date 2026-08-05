/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
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
