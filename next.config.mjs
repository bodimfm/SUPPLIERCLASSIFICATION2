/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    // Removido unoptimized: true para permitir a otimização padrão do Next.js
  },
  poweredByHeader: false,
  reactStrictMode: true, // Corrigido para usar strict mode e identificar problemas corretamente
  
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
          // Adicionar configuração específica para recharts
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/](recharts|d3-*)[\\/]/,
            priority: 30,
            chunks: 'all',
          },
        },
      };
    }
    
    // Adiciona resolução para o módulo supabase e outros
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
  // Configuração experimental atualizada
  experimental: {
    serverActions: true, // Simplificando para booleano já que essa é a configuração padrão recomendada
  },
  // Decidindo entre transpilePackages ou serverExternalPackages para o recharts
  transpilePackages: ['recharts']
}

export default nextConfig
