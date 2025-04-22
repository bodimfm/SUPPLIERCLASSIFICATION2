import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,

  // transpila recharts mas **não** ignora erros de build
  transpilePackages: ["recharts"],

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  webpack: (config) => {
    // Enable the "@/..." alias to resolve from the /src directory
    config.resolve.alias['@'] = path.resolve(__dirname, 'src'); // aponta "@" para /src
    return config;
  },
};

export default nextConfig;
