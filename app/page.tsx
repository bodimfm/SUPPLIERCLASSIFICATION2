import Link from "next/link"

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sistema de Gestão de Riscos na Contratação de Fornecedores</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/supplier-risk-assessment"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-2">Avaliação de Risco</h2>
          <p className="text-gray-600">Iniciar uma nova avaliação de risco de fornecedor</p>
        </Link>

        <Link
          href="/suppliers"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-2">Lista de Fornecedores</h2>
          <p className="text-gray-600">Visualizar e gerenciar todos os fornecedores</p>
        </Link>

        <Link
          href="/lgpd-game"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-2">Game LGPD</h2>
          <p className="text-gray-600">Jogo interativo para treinamento sobre LGPD</p>
        </Link>
      </div>
    </div>
  )
}
