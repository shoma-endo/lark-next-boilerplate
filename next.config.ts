import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { typedRoutes: true },
  env: {
    NEXT_PUBLIC_LARK_APP_ID: process.env.NEXT_PUBLIC_LARK_APP_ID,
    NEXT_PUBLIC_LARK_REDIRECT_URI: process.env.NEXT_PUBLIC_LARK_REDIRECT_URI,
  },
};

export default nextConfig;
