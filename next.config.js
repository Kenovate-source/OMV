/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // argon2 is a native (node-gyp) addon and @prisma/client ships a
    // query-engine binary; neither can be bundled by webpack. Next 14
    // may already externalize them by default — listing them explicitly
    // removes any dependence on that default for the Vercel build.
    serverComponentsExternalPackages: ["argon2", "@prisma/client"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
