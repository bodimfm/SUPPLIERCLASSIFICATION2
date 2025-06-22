// This file centralizes Supabase configuration for the entire application

// Environment variables for Supabase
export const supabaseConfig = {
  url: 'https://uhfjzbexhqfpbuzjendo.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZmp6YmV4aHFmcGJ1emplbmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MDQ0MjksImV4cCI6MjA2MDA4MDQyOX0.E8yCq_esqMGjZrwOe1PXrojztF7oBG_Tyq1qSTfdRpU',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  // Table to use for supplier responses
  supplierResponseTable: 'resposta_triagem_fornecedores',
}

// Check environment variables but don't throw errors that would crash the app
if (!supabaseConfig.url) {
  console.warn("Aviso: URL do Supabase não está definida. Configure a variável de ambiente NEXT_PUBLIC_SUPABASE_URL.")
}

if (!supabaseConfig.anonKey) {
  console.warn("Aviso: Chave anônima do Supabase não está definida. Configure a variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY.")
}

// Service key is optional for client-side operations but required for admin operations
if (!supabaseConfig.serviceKey) {
  console.warn("Aviso: Chave de serviço do Supabase não está definida. Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY.")
}

// Indica se estamos no ambiente de servidor
export const isServer = typeof window === 'undefined'

export default supabaseConfig
