import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  env: {
    NEXT_PUBLIC_LARK_APP_ID: process.env.NEXT_PUBLIC_LARK_APP_ID,
    NEXT_PUBLIC_LARK_REDIRECT_URI: process.env.NEXT_PUBLIC_LARK_REDIRECT_URI,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.larkstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.larksuite.com',
      },
      {
        protocol: 'https',
        hostname: 'files.raycast.com',
      },
    ],
  },
};

export default nextConfig;
