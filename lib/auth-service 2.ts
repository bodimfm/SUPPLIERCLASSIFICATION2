// Configuração de autenticação
const AUTH_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "",
  tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "",
  redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  scopes: ["Files.ReadWrite.All", "Sites.ReadWrite.All"],
}

// Cache para o token
let tokenCache: { token: string; expiry: number } | null = null

/**
 * Obtém um token de autenticação para o Microsoft Graph API
 * Em um ambiente de produção, isso seria implementado com MSAL.js ou similar
 */
export async function getToken(): Promise<string> {
  // Verificar se temos um token em cache válido
  if (tokenCache && tokenCache.expiry > Date.now()) {
    return tokenCache.token
  }

  // Em um ambiente real, aqui usaríamos MSAL.js para autenticação
  // Para fins de demonstração, vamos simular a obtenção de um token

  // Verificar se temos as configurações necessárias
  if (!AUTH_CONFIG.clientId || !AUTH_CONFIG.tenantId) {
    throw new Error("Configuração de autenticação incompleta. Verifique as variáveis de ambiente.")
  }

  try {
    // Simulação - Em produção, isso seria substituído pela autenticação real
    // usando MSAL.js ou similar

    // Simular um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Para fins de demonstração, retornamos um token simulado
    // Em produção, este código seria substituído pela autenticação real
    const simulatedToken = "simulated_token_" + Math.random().toString(36).substring(2)

    // Armazenar no cache (válido por 1 hora na simulação)
    tokenCache = {
      token: simulatedToken,
      expiry: Date.now() + 3600000, // 1 hora
    }

    return simulatedToken
  } catch (error) {
    console.error("Erro ao obter token de autenticação:", error)
    throw new Error("Falha na autenticação com o Microsoft Graph API")
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return !!tokenCache && tokenCache.expiry > Date.now()
}

/**
 * Limpa o cache de token (logout)
 */
export function clearTokenCache(): void {
  tokenCache = null
}
