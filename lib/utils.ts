import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utilitário para validar variáveis de ambiente obrigatórias
 * @param envVars Array de nomes de variáveis de ambiente obrigatórias
 * @throws Error se alguma variável estiver faltando
 */
export function validateEnvVars(envVars: string[]): void {
  const missingVars = envVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}. ` +
      'Verifique o arquivo .env ou as variáveis de ambiente do sistema.'
    )
  }
}

/**
 * Formata uma data para exibição em formato brasileiro
 * @param date Data a ser formatada
 * @returns String no formato DD/MM/YYYY
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formata um CNPJ (123456789000130 -> 12.345.678/9001-30)
 * @param cnpj CNPJ a ser formatado
 * @returns CNPJ formatado ou string vazia se inválido
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return ''
  
  // Remover caracteres não numéricos
  const numericCNPJ = cnpj.replace(/\D/g, '')
  
  // Verificar se tem 14 dígitos
  if (numericCNPJ.length !== 14) return cnpj
  
  // Aplicar máscara
  return numericCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}
