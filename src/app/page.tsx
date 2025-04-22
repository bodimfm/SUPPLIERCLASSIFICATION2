import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex items-center justify-center py-8">
        <Image 
          src="/images/logo-rafael-maciel.png" 
          alt="Logo" 
          width={160} 
          height={60} 
          className="h-12 w-auto"
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Sistema de Gestão de Riscos na Contratação de Fornecedores
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecione seu perfil para continuar
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          <Link
            href="/supplier-risk-assessment"
            className="flex flex-col items-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200"
          >
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Cliente</h2>
            <p className="text-gray-600 text-center">Acesse o formulário de avaliação de fornecedor</p>
          </Link>

          <Link
            href="/office/grc/dashboard"
            className="flex flex-col items-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200"
          >
            <div className="p-4 bg-indigo-50 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Escritório</h2>
            <p className="text-gray-600 text-center">Acesse o dashboard de GRC</p>
          </Link>
        </div>
      </div>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Sistema de Gestão de Riscos
      </footer>
    </div>
  )
}
