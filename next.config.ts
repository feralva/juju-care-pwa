import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa");

const nextConfig: NextConfig = {
  reactStrictMode: true, // React strict mode at the top level
};

export default withPWA({
  dest: "public", // Location to output the service worker
  register: true,   // Register the service worker automatically
  skipWaiting: true, // Skip waiting phase for the service worker
})(nextConfig); // Wrap the base config with withPWA