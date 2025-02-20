import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Prevents ESLint errors from stopping the build
  },
  typescript: {
    ignoreBuildErrors: true, // Prevents TypeScript errors from stopping the build
  },
  reactStrictMode: true, // Keeps React in strict mode for better debugging
};

export default nextConfig;
