import type React from "react"
import "./globals.css"
import { Inter, Montserrat, Raleway } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SoundProvider } from "@/components/sound-provider"
// Importar o componente de fallback
import SoundFallback from "@/components/sound-fallback"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

// Configurando as fontes adicionais
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
})

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["400", "500", "600"],
})

export const metadata = {
  title: "LGPD - Avaliação de Fornecedores",
  description: "Jogo educativo sobre LGPD e avaliação de fornecedores",
    generator: 'v0.dev'
}

// Adicionar o componente dentro do SoundProvider
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${montserrat.variable} ${raleway.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SoundProvider>
            <SoundFallback />
            {children}
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'