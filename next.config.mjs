/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
  serverExternalPackages: [],
  transpilePackages: [],
};

export default nextConfig;