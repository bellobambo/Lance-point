/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This will **ignore ESLint entirely** during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
