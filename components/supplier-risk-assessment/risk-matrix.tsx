import type React from "react"

export const RiskMatrix: React.FC = () => {
  return (
    <div className="my-6 border rounded shadow">
      <h3 className="p-3 bg-gray-100 font-semibold">Matriz de Classificação de Risco</h3>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Volume de Dados</th>
                <th className="border p-2">Não-sensíveis</th>
                <th className="border p-2">Regulares</th>
                <th className="border p-2">Sensíveis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">Baixo</td>
                <td className="border p-2 bg-green-100 text-center">D (Básico)</td>
                <td className="border p-2 bg-green-100 text-center">D (Básico)</td>
                <td className="border p-2 bg-yellow-100 text-center">C (Moderado)</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Médio</td>
                <td className="border p-2 bg-green-100 text-center">D (Básico)</td>
                <td className="border p-2 bg-yellow-100 text-center">C (Moderado)</td>
                <td className="border p-2 bg-orange-100 text-center">B (Significativo)</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Alto</td>
                <td className="border p-2 bg-yellow-100 text-center">C (Moderado)</td>
                <td className="border p-2 bg-yellow-100 text-center">C (Moderado)</td>
                <td className="border p-2 bg-orange-100 text-center">B (Significativo)</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Massivo</td>
                <td className="border p-2 bg-yellow-100 text-center">C (Moderado)</td>
                <td className="border p-2 bg-orange-100 text-center">B (Significativo)</td>
                <td className="border p-2 bg-red-100 text-center">A (Crítico)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Volume Baixo:</strong> Dados de menos de 100 indivíduos
          </p>
          <p>
            <strong>Volume Médio:</strong> Dados de 100 a 1.000 indivíduos
          </p>
          <p>
            <strong>Volume Alto:</strong> Dados de 1.000 a 10.000 indivíduos
          </p>
          <p>
            <strong>Volume Massivo:</strong> Dados de mais de 10.000 indivíduos
          </p>
        </div>
      </div>
    </div>
  )
}
