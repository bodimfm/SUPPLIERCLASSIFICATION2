interface Document {
  id: string
  name: string
  description: string
  required: boolean
}

export function getRequiredDocuments(supplierType: string, isTechnology: boolean): Document[] {
  // Documentos base para todos os fornecedores
  const baseDocuments: Document[] = [
    {
      id: "privacy_policy",
      name: "Política de Privacidade",
      description: "Documento que descreve como a empresa coleta, usa e protege dados pessoais",
      required: true,
    },
    {
      id: "dpo_appointment",
      name: "Nomeação de Encarregado (DPO)",
      description: "Documento que designa o responsável pela proteção de dados na empresa",
      required: true,
    },
    {
      id: "data_mapping",
      name: "Mapeamento de Dados",
      description: "Inventário dos dados pessoais processados pela empresa",
      required: false,
    },
  ]

  // Documentos específicos por tipo de fornecedor
  const typeSpecificDocuments: Record<string, Document[]> = {
    A: [
      {
        id: "dpia",
        name: "Relatório de Impacto à Proteção de Dados (RIPD/DPIA)",
        description: "Análise dos riscos do tratamento para os direitos e liberdades dos titulares",
        required: true,
      },
      {
        id: "security_measures",
        name: "Documentação de Medidas de Segurança",
        description: "Detalhamento das medidas técnicas e organizacionais de segurança",
        required: true,
      },
      {
        id: "breach_notification",
        name: "Procedimento de Notificação de Incidentes",
        description: "Processo para notificação de violações de dados pessoais",
        required: true,
      },
      {
        id: "compliance_program",
        name: "Programa de Conformidade com LGPD",
        description: "Documentação do programa de governança em privacidade",
        required: true,
      },
    ],
    B: [
      {
        id: "security_measures",
        name: "Documentação de Medidas de Segurança",
        description: "Detalhamento das medidas técnicas e organizacionais de segurança",
        required: true,
      },
      {
        id: "breach_notification",
        name: "Procedimento de Notificação de Incidentes",
        description: "Processo para notificação de violações de dados pessoais",
        required: true,
      },
      {
        id: "compliance_program",
        name: "Programa de Conformidade com LGPD",
        description: "Documentação do programa de governança em privacidade",
        required: false,
      },
    ],
    C: [
      {
        id: "security_measures",
        name: "Documentação de Medidas de Segurança",
        description: "Detalhamento das medidas técnicas e organizacionais de segurança",
        required: true,
      },
      {
        id: "breach_notification",
        name: "Procedimento de Notificação de Incidentes",
        description: "Processo para notificação de violações de dados pessoais",
        required: false,
      },
    ],
    D: [
      {
        id: "security_declaration",
        name: "Declaração de Segurança",
        description: "Declaração simplificada sobre medidas de segurança adotadas",
        required: false,
      },
    ],
  }

  // Documentos específicos para fornecedores de tecnologia
  const technologyDocuments: Document[] = [
    {
      id: "tech_security",
      name: "Documentação de Segurança Técnica",
      description: "Detalhamento das medidas técnicas de segurança implementadas",
      required: true,
    },
    {
      id: "access_control",
      name: "Política de Controle de Acesso",
      description: "Documentação dos mecanismos de controle de acesso aos dados",
      required: true,
    },
    {
      id: "encryption",
      name: "Política de Criptografia",
      description: "Documentação das medidas de criptografia implementadas",
      required: isTechnology && (supplierType === "A" || supplierType === "B"),
    },
    {
      id: "backup",
      name: "Política de Backup e Recuperação",
      description: "Documentação dos procedimentos de backup e recuperação de dados",
      required: isTechnology && supplierType === "A",
    },
  ]

  // Combina os documentos apropriados
  let requiredDocuments = [...baseDocuments]

  if (typeSpecificDocuments[supplierType]) {
    requiredDocuments = [...requiredDocuments, ...typeSpecificDocuments[supplierType]]
  }

  if (isTechnology) {
    requiredDocuments = [...requiredDocuments, ...technologyDocuments]
  }

  return requiredDocuments
}
