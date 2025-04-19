/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  reactStrictMode: false, // Alterado para false para evitar problemas de hidratação
  // Removido swcMinify que não é mais reconhecido no Next.js 15.2.4
  
  // Configuração para resolver problemas de ChunkLoadError
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Melhora o gerenciamento de chunks para evitar erros de carregamento
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          // Coloca as dependências mais pesadas em chunks separados
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next|@radix-ui)[\\/]/,
            priority: 40,
            chunks: 'all',
          },
        },
      };
    }
    
    // Adiciona resolução para o módulo supabase
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...(config.resolve?.fallback || {}),
        fs: false,
        net: false,
        tls: false,
      }
    };
    
    return config;
  },
  // Adiciona configuração de ambiente para o Supabase
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

export default nextConfig
