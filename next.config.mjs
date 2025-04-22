/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  transpilePackages: [],
};

export default nextConfig;