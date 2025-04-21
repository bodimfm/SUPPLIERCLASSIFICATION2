import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import ClientLayout from "@/components/client-layout" // Importação correta do default export
import { DatabaseInitializer } from "@/components/database-initializer"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Sistema de Gestão de Riscos de Privacidade",
  description: "Avaliação e Monitoramento de Fornecedores",
  generator: "v0.dev",
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
      <body className={`${montserrat.className} min-h-screen flex flex-col bg-off-white`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Sidebar />
          <ClientLayout>
            <DatabaseInitializer />
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
