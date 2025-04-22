"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "./header"
import { ThemeProvider } from "./theme-provider"
import { Sidebar } from "./sidebar"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Detecta o estado do sidebar usando um MutationObserver
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          const sidebarElement = document.querySelector('[class*="md:flex flex-col h-screen fixed"]') as HTMLElement
          if (sidebarElement) {
            const width = sidebarElement.style.width
            setSidebarCollapsed(width === "64px")
          }
        }
      })
    })

    const sidebarElement = document.querySelector('[class*="md:flex flex-col h-screen fixed"]')
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true })
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Sidebar />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}
      >
        <Header />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </ThemeProvider>
  )
}

export default ClientLayout
