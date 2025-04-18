"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, User, Shield, Briefcase } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

// Componente de hidratação para evitar problemas de SSR
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return <>{children}</>
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const redirectAttempted = useRef(false)
  
  // Use o hook no nível superior do componente
  const { signIn, user, session } = useAuth()
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    // Para prevenir loops de redirecionamento
    if (redirecting || redirectAttempted.current) return;
    
    if (user) {
      console.log("[Login] Usuário já autenticado, redirecionando para o dashboard")
      setRedirecting(true)
      redirectAttempted.current = true
      
      // Usar navegação convencional em vez de window.location para evitar loops
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    }
  }, [user, redirecting, router])
  
  // Função para lidar com o login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Impedir envio duplicado
    if (loading || redirecting) return;
    
    setLoading(true)
    setError(null)
    
    console.log("[Login] Iniciando tentativa de login")

    try {
      // Autenticar usando nosso hook personalizado
      const { error, success } = await signIn(email, password)

      if (error) {
        console.error("[Login] Erro no login:", error)
        throw error
      }
      
      if (success) {
        console.log("[Login] Login bem-sucedido, redirecionando para dashboard")
        setRedirecting(true)
        
        // Usar navegação do Next.js
        router.push('/dashboard')
      } else {
        throw new Error("Falha ao fazer login por motivo desconhecido")
      }
    } catch (error: any) {
      console.error("[Login] Erro detalhado durante login:", error)
      setError(error.message || "Falha ao fazer login. Por favor, tente novamente.")
      setLoading(false)
      setRedirecting(false)
    }
  }
  
  const loginForm = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 mb-4 relative">
            <Image 
              src="/images/logo-rafael-maciel.png" 
              alt="Logo" 
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sistema de Classificação de Fornecedores</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || redirecting}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || redirecting}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || redirecting}
            >
              {redirecting ? "Redirecionando..." : loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-gray-500">
            Para acesso ao sistema, entre em contato com o administrador.
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Tipos de Acesso</h4>
            <div className="flex justify-center gap-6 text-xs text-gray-600">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mb-1">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <span>Cliente</span>
                <span className="text-gray-400">Visualização</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mb-1">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <span>DPO</span>
                <span className="text-gray-400">Edição completa</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 mb-1">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <span>Admin</span>
                <span className="text-gray-400">Acesso total</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );

  // Se estiver redirecionando, mostre uma indicação de carregamento
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Redirecionando para o Dashboard...</h2>
          <p className="text-gray-500 mt-2">Aguarde um momento...</p>
        </div>
      </div>
    );
  }

  // Usando ClientOnly para evitar problemas de hidratação
  return <ClientOnly>{loginForm}</ClientOnly>;
}