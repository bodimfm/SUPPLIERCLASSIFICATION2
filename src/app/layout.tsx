import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import { DatabaseInitializer } from "../components/database-initializer"

// Configuração da fonte com fallback explícito
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
})

export const metadata: Metadata = {
  title: "Sistema de Gestão de Riscos de Privacidade",
  description: "Avaliação e Monitoramento de Fornecedores",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${montserrat.className} min-h-screen flex flex-col bg-off-white`}>
        <ClientLayout>
          <DatabaseInitializer />
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
