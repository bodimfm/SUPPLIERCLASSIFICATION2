# Ajustes de Layout para Finalização do Projeto

Este documento contém as alterações recomendadas para finalizar a aprovação do layout e seguir para outras implementações.

## 1. Padronização de Cores com CSS Variables

As variáveis CSS já estão definidas em `globals.css`, mas não estão sendo usadas consistentemente.

### Em globals.css (já atualizado):

```css
.btn-brand {
  @apply bg-[var(--brand-color)] text-white hover:bg-[var(--brand-color-light)] transition-colors duration-200;
}

.text-brand {
  @apply text-[var(--brand-color)];
}

.border-brand {
  @apply border-[var(--brand-color)];
}

.bg-brand {
  @apply bg-[var(--brand-color)];
}

.hover\:bg-brand-hover:hover {
  @apply hover:bg-[var(--brand-color-light)];
}

.bg-brand-hover {
  @apply bg-[var(--brand-color-light)];
}
```

## 2. Atualizações do Header (components/header.tsx)

```jsx
"use client"

import Image from "next/image"
import { Building2 } from "lucide-react"
import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface HeaderProps {
  onEnterOfficeEnvironment?: () => void
  isOfficeEnvironment?: boolean
}

export default function Header({ onEnterOfficeEnvironment, isOfficeEnvironment = false }: HeaderProps) {
  const isMobile = useIsMobile()
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 py-4 px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
        <div className="flex items-center flex-1 flex-col sm:flex-row">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center mb-3 sm:mb-0"
          >
            <Image
              src="/images/logo-rafael-maciel.png"
              alt="Rafael Maciel Sociedade de Advogados"
              width={80}
              height={60}
              className="sm:mr-6"
            />
          </motion.div>

          <div className="text-center sm:text-left">
            <h1 className="text-xl font-semibold text-brand">Sistema de Gestão de Riscos de Privacidade</h1>
            <p className="text-sm text-gray-600">Avaliação e Monitoramento de Fornecedores</p>
          </div>
        </div>

        {!isOfficeEnvironment && onEnterOfficeEnvironment && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnterOfficeEnvironment}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand rounded-md border border-brand hover:bg-brand-hover transition-colors duration-200"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Ambiente do Escritório
          </motion.button>
        )}
      </div>
    </motion.header>
  )
}
```

## 3. Atualizações do Office Layout (components/office-layout.tsx)

```jsx
"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ClipboardList, BarChart3, FileText, Users, Settings, ChevronRight, ChevronLeft, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface OfficeLayoutProps {
  children: ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
  onExit: () => void
}

export default function OfficeLayout({ children, activeSection, onSectionChange, onExit }: OfficeLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useIsMobile()

  const menuItems = [
    { id: "assessment", label: "Avaliação", icon: FileText },
    { id: "monitoring", label: "Monitoramento", icon: ClipboardList },
    { id: "adherence", label: "Análise de Aderência", icon: BarChart3 },
    { id: "suppliers", label: "Fornecedores", icon: Users },
    { id: "settings", label: "Configurações", icon: Settings },
  ]

  return (
    <div className="flex min-h-[500px] h-[calc(100vh-120px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Menu lateral com fundo azul da logomarca */}
      <div
        className={`bg-brand h-full transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
        style={{ transition: "width 0.3s ease" }}
      >
        <div className="p-4 flex justify-between items-center border-b border-brand-hover">
          {!collapsed && <h3 className="font-medium text-white">Ambiente do Escritório</h3>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-white hover:bg-brand-hover hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="p-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start mb-1 ${collapsed ? "px-2" : "px-4"} 
                ${
                  activeSection === item.id
                    ? "bg-white text-brand"
                    : "text-white hover:bg-brand-hover hover:text-white"
                }
                transition-all duration-200
              `}
              onClick={() => onSectionChange(item.id)}
            >
              <item.icon className="h-5 w-5 mr-2" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}

          <div className="mt-auto pt-4 border-t border-brand-hover mt-4">
            <Button
              variant="ghost"
              className={`w-full justify-start mb-1 ${collapsed ? "px-2" : "px-4"} 
                text-white hover:bg-brand-hover hover:text-white transition-all duration-200
              `}
              onClick={onExit}
            >
              <Home className="h-5 w-5 mr-2" />
              {!collapsed && <span>Voltar ao Sistema</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com animação */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-6"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

## 4. Atualizações do Footer (components/footer.tsx)

```jsx
"use client"

import { motion } from "framer-motion"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-white border-t border-gray-200 py-4 px-6 mt-auto"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-brand mb-2 md:mb-0">
            &copy; {currentYear} Rafael Maciel Sociedade de Advogados. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-600">
            Desenvolvido por: RM Serviços Jurídicos e Compliance em Tecnologia e Inovação.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
```

## 5. Atualização do app/layout.tsx

```jsx
import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Sistema de Gestão de Riscos de Privacidade",
  description: "Avaliação e Monitoramento de Fornecedores",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${montserrat.className} min-h-screen flex flex-col bg-gray-50`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## 6. Remover componentes duplicados

Remova os seguintes componentes duplicados:

1. `/components/ui/use-mobile.tsx` - manter apenas a versão em `/hooks/use-mobile.tsx`
2. `/components/office-menu.tsx` - remover completamente, já que sua funcionalidade está incluída em office-layout.tsx

## Benefícios destas alterações:

1. **Melhor responsividade**: Os layouts funcionarão bem em dispositivos móveis
2. **Padronização de cores**: Uso consistente das variáveis CSS em vez de valores hardcoded
3. **Simplificação do código**: Eliminação de componentes redundantes
4. **Melhor usabilidade móvel**: Menu lateral mais largo quando colapsado para facilitar alvo de toque
5. **Compatibilidade multidispositivo**: Configuração adequada de viewport para dispositivos móveis