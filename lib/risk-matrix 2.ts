type DataVolume = "low" | "medium" | "high" | "massive"
type DataSensitivity = "non-sensitive" | "regular" | "sensitive"

interface SupplierTypeResult {
  code: string
  description: string
}

const typeDescriptions: Record<string, string> = {
  A: "Fornecedor Crítico (Alto Risco)",
  B: "Fornecedor Significativo (Risco Moderado-Alto)",
  C: "Fornecedor Moderado (Risco Médio)",
  D: "Fornecedor Básico (Baixo Risco)",
}

export function calculateSupplierType(
  dataVolume: DataVolume,
  dataSensitivity: DataSensitivity,
  isTechnology: boolean,
): SupplierTypeResult {
  // Matriz de classificação conforme documento
  const riskMatrix: Record<DataVolume, Record<DataSensitivity, string>> = {
    low: {
      "non-sensitive": "D",
      regular: "D",
      sensitive: "C",
    },
    medium: {
      "non-sensitive": "D",
      regular: "C",
      sensitive: "B",
    },
    high: {
      "non-sensitive": "C",
      regular: "C",
      sensitive: "B",
    },
    massive: {
      "non-sensitive": "C",
      regular: "B",
      sensitive: "A",
    },
  }

  // Determina o tipo base do fornecedor
  let supplierType = riskMatrix[dataVolume][dataSensitivity]

  // Eleva o nível de risco para fornecedores de tecnologia, se não for já o mais alto
  if (isTechnology && supplierType !== "A") {
    // Mapa de elevação de risco para fornecedores de tecnologia
    const techElevation: Record<string, string> = {
      B: "A",
      C: "B",
      D: "C",
    }
    supplierType = techElevation[supplierType]
  }

  return {
    code: supplierType,
    description: typeDescriptions[supplierType],
  }
}
