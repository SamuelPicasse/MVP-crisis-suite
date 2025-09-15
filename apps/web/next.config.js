/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@crisis-suite/ui', '@crisis-suite/db', '@crisis-suite/config'],
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;