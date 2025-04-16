"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"

// Tipos para perfil de usuário
export type UserRole = 'client' | 'dpo_member' | 'admin'

interface UserProfile {
  id: string
  role: UserRole
  full_name?: string
  company?: string
}

// Tipagem para o contexto de autenticação
interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isDpoMember: boolean
  isAdmin: boolean
  isClient: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null, success: boolean }>
  signOut: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

// Criação do contexto com valor padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isDpoMember: false,
  isAdmin: false,
  isClient: false,
  signIn: async () => ({ error: new Error("Contexto não inicializado"), success: false }),
  signOut: async () => {},
  checkAuth: async () => false,
})

// Componente de hidratação para evitar problemas de SSR
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return <>{children}</>
}

// Provedor de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDpoMember, setIsDpoMember] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Função para buscar o perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseBrowser()
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return null
      }

      if (data) {
        setProfile(data as UserProfile)
        setIsDpoMember(data.role === 'dpo_member')
        setIsAdmin(data.role === 'admin')
        setIsClient(data.role === 'client')
        return data
      }

      return null
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }, [])

  // Verificar autenticação ao carregar - apenas no cliente
  useEffect(() => {
    setMounted(true)
    
    const getSession = async () => {
      setIsLoading(true)
      try {
        console.log("Verificando sessão existente...")
        const supabase = getSupabaseBrowser()
        
        // Para maior segurança, também verificamos o usuário, não apenas a sessão
        const { data: userData } = await supabase.auth.getUser()
        const { data: sessionData } = await supabase.auth.getSession()
        
        console.log("Sessão existente:", sessionData.session ? "Sim" : "Não")
        console.log("Usuário válido:", userData.user ? "Sim" : "Não")
        
        // Se temos tanto uma sessão quanto um usuário válido, estamos autenticados
        setSession(sessionData.session)
        setUser(userData.user)
        
        if (userData.user) {
          console.log("Usuário autenticado:", userData.user.email)
          await fetchUserProfile(userData.user.id)
        }
      } catch (error) {
        console.error("Erro ao buscar sessão:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      getSession()
    }

    // Configurar listener para mudanças de autenticação - apenas no cliente
    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null
    
    if (mounted) {
      const supabase = getSupabaseBrowser()
      
      // Este listener é importante para reagir a mudanças de autenticação
      // como login, logout, expiração de sessão, etc.
      authListener = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log("Evento de autenticação:", event)
        
        // Importante: sempre que ocorrer um evento de autenticação,
        // verificamos explicitamente o usuário além da sessão
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const { data } = await supabase.auth.getUser()
          setUser(data.user)
          setSession(newSession)
          
          if (data.user) {
            console.log("Usuário atualizado:", data.user.email)
            await fetchUserProfile(data.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setProfile(null)
          setIsDpoMember(false)
          setIsAdmin(false)
          setIsClient(false)
        }
        
        setIsLoading(false)
      })
    }

    return () => {
      if (authListener) {
        authListener.data.subscription.unsubscribe()
      }
    }
  }, [mounted, fetchUserProfile])

  // Função para login
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando login com:", email)
      setIsLoading(true)
      
      const supabase = getSupabaseBrowser()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erro de autenticação:", error.message)
        setIsLoading(false)
        throw error
      }

      console.log("Login bem-sucedido para:", email)
      console.log("Dados retornados:", data.user ? "Usuário presente" : "Sem usuário")
      
      // Atualizar estado imediatamente após login bem-sucedido
      setUser(data.user)
      setSession(data.session)
      
      if (data.user) {
        await fetchUserProfile(data.user.id)
      }
      
      setIsLoading(false)
      return { error: null, success: true }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setIsLoading(false)
      return { error, success: false }
    }
  }

  // Função para logout
  const signOut = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowser()
      await supabase.auth.signOut()
      
      // Limpar o estado após logout
      setUser(null)
      setSession(null)
      setProfile(null)
      setIsDpoMember(false)
      setIsAdmin(false)
      setIsClient(false)
      
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }, [router])

  // Função para verificar autenticação - usando getUser para maior segurança
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = getSupabaseBrowser()
      
      // Usar getUser em vez de getSession para maior segurança
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      return false
    }
  }, [])

  const value = {
    user, 
    session, 
    profile,
    isLoading, 
    isDpoMember,
    isAdmin,
    isClient,
    signIn, 
    signOut, 
    checkAuth
  };

  // Se não foi montado no cliente ainda, retorna um placeholder vazio
  if (!mounted) {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

// Componente para proteger rotas
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthProtected(props: P) {
    return (
      <ClientOnly>
        <AuthProtectedInner Component={Component} props={props} />
      </ClientOnly>
    );
  }
}

// Componente interno para proteção de rotas - só renderiza no cliente
function AuthProtectedInner<P extends object>({ 
  Component, 
  props 
}: { 
  Component: React.ComponentType<P>, 
  props: P 
}) {
  const { user, isLoading, checkAuth } = useAuth()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // Função para verificar autenticação usando getUser
    const verifyAuth = async () => {
      setIsVerifying(true)
      const isAuthenticated = await checkAuth()
      
      if (!isAuthenticated) {
        console.log("Usuário não autenticado (verificado com getUser), redirecionando para login")
        router.push("/login")
      }
      
      setIsVerifying(false)
    }
    
    // Primeiro verificamos via estado local (rápido)
    if (!isLoading && !user) {
      console.log("Usuário não autenticado (estado local), redirecionando para login")
      router.push("/login")
    } 
    // Se o estado local diz que está autenticado, verificamos com getUser (seguro)
    else if (!isLoading && user) {
      verifyAuth()
    }
  }, [user, isLoading, router, checkAuth])

  // Mostrar tela de carregamento ou nada enquanto verifica autenticação
  if (isLoading || !user || isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-gray-700">Verificando autenticação...</p>
      </div>
    );
  }

  // Renderizar o componente protegido
  return <Component {...props} />;
}