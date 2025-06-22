/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [],
  transpilePackages: [],
};

export default nextConfig;