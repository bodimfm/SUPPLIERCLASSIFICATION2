import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/forgot-password']

// Rotas de API que devem ser isentas da verificação de autenticação
const apiRoutes = ['/api/']

// Middleware para autenticação e renovação de tokens
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware Debug] Verificando requisição para: ${pathname}`);
  
  // Ignorar requisições para assets estáticos
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }
  
  // Ignorar rotas de API
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Criar resposta inicial
  let response = NextResponse.next()
  
  // Criar cliente Supabase para o middleware
  // Este cliente é específico para renovação de tokens e verificação de sessão
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // Atualiza o cookie na resposta
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          // Remove o cookie da resposta
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    // Verificar e renovar tokens - isto acontece automaticamente ao chamar getSession()
    // A renovação é fundamental para segurança e está embutida na biblioteca @supabase/ssr
    const { data: { session } } = await supabase.auth.getSession()
    
    // Verificar se é uma rota pública
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    
    // Log para debug
    console.log(`[Middleware Debug] Path: ${pathname}, Autenticado: ${!!session}, Rota pública: ${isPublicRoute}`);
    
    // Prevenção de loop de redirecionamento
    const referer = request.headers.get('referer') || '';
    const isFromLogin = referer.includes('/login');
    const isFromDashboard = referer.includes('/dashboard');
    
    // Se o usuário está logado e tenta acessar o login, redirecione para o dashboard
    if (session && isPublicRoute) {
      // Verificar se não estamos em um redirecionamento circular
      if (isFromDashboard) {
        console.log(`[Middleware] Possível loop detectado, permitindo acesso a ${pathname}`);
        return response;
      }
      
      console.log(`[Middleware] Redirecionando usuário autenticado de ${pathname} para /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Se o usuário não está logado e tenta acessar uma rota protegida
    if (!session && !isPublicRoute && pathname !== '/') {
      // Verificar se não estamos em um redirecionamento circular
      if (isFromLogin) {
        console.log(`[Middleware] Possível loop detectado, permitindo acesso a ${pathname}`);
        return response;
      }
      
      console.log(`[Middleware] Redirecionando usuário não autenticado de ${pathname} para /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se o usuário não está logado e tenta acessar a raiz
    if (!session && pathname === '/') {
      console.log(`[Middleware] Redirecionando visitante da raiz para /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Retornar a resposta com os cookies atualizados
    return response;
  } catch (error) {
    console.error('[Middleware] Erro ao verificar autenticação:', error);
    // Em caso de erro, permitir a requisição para evitar loops
    return response;
  }
}

// Especificar as rotas onde o middleware deve ser executado
export const config = {
  matcher: [
    // Aplicar a todas as rotas exceto assets públicos e API routes
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}