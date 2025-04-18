import { z } from "zod"

// Esquema para validação do formulário de fornecedor com Zod
export const supplierFormSchema = z.object({
  // Dados básicos do fornecedor
  supplierName: z.string().min(2, "Nome do fornecedor é obrigatório"),
  taxId: z.string().min(1, "CNPJ é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  contactPerson: z.string().optional().or(z.literal("")),
  serviceDescription: z.string().min(5, "Descrição do serviço é obrigatória"),
  internalResponsible: z.string().optional().or(z.literal("")),

  // Campos de classificação de risco
  dataVolume: z.enum(["low", "medium", "high", "massive"]),
  dataSensitivity: z.enum(["non-sensitive", "regular", "sensitive"]),
  contractType: z.enum(["punctual", "continuous"]),
  isTechnology: z.boolean(),
  supplierType: z.string().optional(),
  supplierTypeDescription: z.string().optional(),
  sensitiveFlagged: z.boolean(),

  // Campos de documentos
  uploadedDocuments: z.array(z.string()).default([]),
  notProvidedDocuments: z.array(z.string()).default([]),
  submittedToOffice: z.boolean().default(false),
  
  // Metadados de documentos
  uploadedDocumentsMetadata: z.array(
    z.object({
      name: z.string(),
      documentId: z.string().optional(),
      url: z.string(),
      path: z.string().optional(),
      uploadDate: z.string()
    })
  ).optional(),

  // Novos campos para avaliação de risco
  dataType: z.enum(["none", "common", "sensitive"]),
  volume: z.enum(["low", "medium", "high"]),
  criticality: z.enum(["critical", "non-critical"]),
  policy: z.enum(["yes", "no", "unknown"]),
  certification: z.enum(["yes", "no", "unknown"]),
  subcontracting: z.enum(["none", "identified", "unknown"]),
  incidents: z.enum(["none", "resolved", "unresolved"]),

  // Campos para armazenar o resultado da avaliação
  riskScore: z.number(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  riskDescription: z.string(),

  // Campo para armazenar a avaliação do DPO
  dpoReview: z.object({
    reviewed: z.boolean(),
    adjustedRiskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
    comments: z.string().optional(),
    reviewDate: z.date().optional(),
    reviewedBy: z.string().optional()
  }),
  
  // ID do fornecedor no banco de dados
  supplierId: z.string().optional(),
  
  // Status do fornecedor
  status: z.string().optional(),

  // Campos para monitoramento e avaliação temporal
  registrationDate: z.string().optional(),
  lastAssessmentDate: z.string().optional(),
  nextAssessmentDate: z.string().optional(),
  documentsCount: z.number().optional()
})

// Tipo derivado do esquema Zod
export type SupplierFormValues = z.infer<typeof supplierFormSchema>

// Tipos de fornecedor
export const supplierTypes = ["A", "B", "C", "D"] as const
export type SupplierType = typeof supplierTypes[number]