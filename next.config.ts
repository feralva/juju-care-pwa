import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa");

const nextConfig: NextConfig = withPWA({
  reactStrictMode: true, // Enabling React strict mode for development
  pwa: {
    dest: "public", // Location to output the service worker
    register: true,  // Register the service worker automatically
    skipWaiting: true, // Skip waiting phase for the service worker
  },
});
export default nextConfig;
