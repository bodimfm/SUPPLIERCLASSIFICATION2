"use client"

import { useState, useEffect } from "react"
import { Gamepad2, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LGPDGamePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for iframe
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <Link href="/">
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={18} className="mr-1" />
            Voltar para a página inicial
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-b from-blue-50 to-white border-b">
          <div className="flex items-center mb-2">
            <Gamepad2 size={24} className="text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold">Game LGPD Fornecedores</h1>
          </div>
          <p className="text-gray-600">
            Aprenda sobre a Lei Geral de Proteção de Dados e como avaliar fornecedores de forma interativa.
          </p>
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Carregando o jogo...</p>
              </div>
            </div>
          )}

          <div className="w-full aspect-[16/9]">
            <iframe
              src="https://v0-games-bur7zr.vercel.app/"
              className="w-full h-full border-0"
              title="LGPD Game"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Desenvolvido para treinamento e capacitação em LGPD</p>
            <a
              href="https://v0-games-bur7zr.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              Abrir em nova janela
              <ExternalLink size={14} className="ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
