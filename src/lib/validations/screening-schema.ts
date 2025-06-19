import { z } from 'zod';

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const screeningSchema = z.object({
  supplierName: z.string()
    .min(1, "Nome do fornecedor é obrigatório")
    .min(3, "Nome do fornecedor deve ter pelo menos 3 caracteres"),
  
  cnpj: z.string()
    .optional()
    .refine((val) => !val || CNPJ_REGEX.test(val), {
      message: "Formato de CNPJ inválido. Use o formato: 00.000.000/0000-00"
    }),
  
  internalResponsible: z.string()
    .min(1, "Responsável interno é obrigatório")
    .min(3, "Nome do responsável deve ter pelo menos 3 caracteres"),
  
  serviceDescription: z.string()
    .min(1, "Descrição do serviço é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição não pode exceder 1000 caracteres"),
  
  dataVolume: z.enum(["low", "medium", "high", "massive"], {
    errorMap: () => ({ message: "Selecione o volume de dados" })
  }),
  
  dataSensitivity: z.enum(["non-sensitive", "regular", "sensitive"], {
    errorMap: () => ({ message: "Selecione a sensibilidade dos dados" })
  }),
  
  contractType: z.enum(["punctual", "continuous"], {
    errorMap: () => ({ message: "Selecione o tipo de contrato" })
  }),
  
  isTechnology: z.boolean().default(false),
  
  documentFile: z.any().optional(),
});

export type ScreeningFormData = z.infer<typeof screeningSchema>;

export const questionFields = [
  'supplierName',
  'cnpj',
  'internalResponsible', 
  'serviceDescription',
  'dataVolume',
  'dataSensitivity',
  'contractType',
  'isTechnology',
  'classification', // Etapa de revisão da classificação
  'documentFile'
] as const;

export type QuestionField = typeof questionFields[number];