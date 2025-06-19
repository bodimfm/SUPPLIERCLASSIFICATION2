'use client';

import React, { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { HelpCircle, AlertCircle, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ScreeningFormData, QuestionField } from '@/lib/validations/screening-schema';

interface QuestionStepProps {
  fieldName: QuestionField;
  form: UseFormReturn<ScreeningFormData>;
  onAutoAdvance?: (value: any) => void;
  sensitiveFlagged?: boolean;
}

const fieldHelp = {
  supplierName: 'Nome completo ou razão social do fornecedor',
  cnpj: 'Formato: 00.000.000/0000-00',
  internalResponsible: 'Pessoa da empresa responsável pela triagem',
  serviceDescription: 'Descreva detalhadamente o serviço que será prestado',
  dataVolume: 'Quantidade aproximada de dados pessoais que serão tratados',
  dataSensitivity: 'Classificação dos dados conforme a LGPD',
  contractType: 'Duração e natureza do contrato',
  isTechnology: 'Marque se o fornecedor provê software, TI ou serviços em nuvem',
  documentFile: 'Anexe contratos, propostas ou questionários (PDF, Word, Excel ou ZIP - máx. 10MB)',
  classification: 'Análise de risco baseada nas informações fornecidas'
};

const dataVolumeOptions = [
  { value: 'low', label: 'Baixo (menos de 100 indivíduos)' },
  { value: 'medium', label: 'Médio (100 a 1.000 indivíduos)' },
  { value: 'high', label: 'Alto (mais de 1.000 indivíduos)' },
  { value: 'massive', label: 'Massivo (volumes extremamente altos)' }
];

const dataSensitivityOptions = [
  { value: 'non-sensitive', label: 'Não sensíveis - dados comuns, não confidenciais' },
  { value: 'regular', label: 'Regulares - dados pessoais não sensíveis (ex: nome, contato)' },
  { value: 'sensitive', label: 'Sensíveis - dados pessoais sensíveis (ex: saúde, biometria)' }
];

const contractTypeOptions = [
  { value: 'punctual', label: 'Pontual - contrato de curta duração ou fornecimento único' },
  { value: 'continuous', label: 'Continuado - contrato de longa duração ou prestação contínua' }
];

export function QuestionStep({ fieldName, form, onAutoAdvance, sensitiveFlagged }: QuestionStepProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const { register, formState: { errors }, watch, setValue } = form;
  const fieldValue = watch(fieldName);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current && !['documentFile', 'isTechnology'].includes(fieldName)) {
        inputRef.current.focus();
      }
    }, 400);
    
    return () => clearTimeout(timer);
  }, [fieldName]);

  const renderField = () => {
    switch (fieldName) {
      case 'supplierName':
      case 'cnpj':
      case 'internalResponsible':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName} className="text-base font-medium">
              {fieldName !== 'cnpj' && <span className="text-red-500">*</span>}
              {' '}Campo de texto
            </Label>
            <div className="relative">
              <Input
                id={fieldName}
                {...register(fieldName as any)}
                ref={(e) => {
                  register(fieldName as any).ref(e);
                  inputRef.current = e;
                }}
                placeholder={fieldHelp[fieldName]}
                className={cn(
                  "w-full text-lg py-6",
                  errors[fieldName] && "border-red-500 focus:ring-red-500"
                )}
                aria-invalid={!!errors[fieldName]}
                aria-describedby={`${fieldName}-help ${fieldName}-error`}
              />
              <HelpCircle 
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-help"
                aria-label="Ajuda"
              />
            </div>
            <p id={`${fieldName}-help`} className="text-sm text-gray-600">
              {fieldHelp[fieldName]}
            </p>
            {errors[fieldName] && (
              <p id={`${fieldName}-error`} className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );

      case 'serviceDescription':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName} className="text-base font-medium">
              <span className="text-red-500">*</span> Descrição detalhada
            </Label>
            <Textarea
              id={fieldName}
              {...register(fieldName)}
              ref={(e) => {
                register(fieldName).ref(e);
                inputRef.current = e;
              }}
              placeholder={fieldHelp[fieldName]}
              rows={6}
              className={cn(
                "w-full text-lg resize-none",
                errors[fieldName] && "border-red-500 focus:ring-red-500"
              )}
              aria-invalid={!!errors[fieldName]}
              aria-describedby={`${fieldName}-help ${fieldName}-error`}
            />
            <div className="flex justify-between items-center">
              <p id={`${fieldName}-help`} className="text-sm text-gray-600">
                {fieldHelp[fieldName]}
              </p>
              <span className="text-sm text-gray-500">
                {fieldValue?.length || 0}/1000 caracteres
              </span>
            </div>
            {errors[fieldName] && (
              <p id={`${fieldName}-error`} className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );

      case 'dataVolume':
        return (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              <span className="text-red-500">*</span> Selecione o volume de dados
            </Label>
            <div className="grid gap-3">
              {dataVolumeOptions.map((option) => (
                <motion.label
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                    fieldValue === option.value
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input
                    type="radio"
                    {...register(fieldName)}
                    value={option.value}
                    className="sr-only"
                    onChange={(e) => {
                      register(fieldName).onChange(e);
                      if (onAutoAdvance) {
                        onAutoAdvance(e.target.value);
                      }
                    }}
                  />
                  <span className="text-lg">{option.label}</span>
                  {fieldValue === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </motion.div>
                  )}
                </motion.label>
              ))}
            </div>
            {errors[fieldName] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );

      case 'dataSensitivity':
        return (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              <span className="text-red-500">*</span> Classificação dos dados
            </Label>
            <div className="grid gap-3">
              {dataSensitivityOptions.map((option) => (
                <motion.label
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                    fieldValue === option.value
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input
                    type="radio"
                    {...register(fieldName)}
                    value={option.value}
                    className="sr-only"
                    onChange={(e) => {
                      register(fieldName).onChange(e);
                      if (onAutoAdvance) {
                        onAutoAdvance(e.target.value);
                      }
                    }}
                  />
                  <span className="text-lg">{option.label}</span>
                  {fieldValue === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </motion.div>
                  )}
                </motion.label>
              ))}
            </div>
            
            {sensitiveFlagged && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="h-5 w-5 text-yellow-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">Atenção: Dados Sensíveis</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    O fornecedor terá acesso a dados sensíveis. Uma avaliação mais rigorosa será necessária.
                  </p>
                </div>
              </motion.div>
            )}
            
            {errors[fieldName] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );

      case 'contractType':
        return (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              <span className="text-red-500">*</span> Tipo de contrato
            </Label>
            <div className="grid gap-3">
              {contractTypeOptions.map((option) => (
                <motion.label
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                    fieldValue === option.value
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input
                    type="radio"
                    {...register(fieldName)}
                    value={option.value}
                    className="sr-only"
                    onChange={(e) => {
                      register(fieldName).onChange(e);
                      if (onAutoAdvance) {
                        onAutoAdvance(e.target.value);
                      }
                    }}
                  />
                  <span className="text-lg">{option.label}</span>
                  {fieldValue === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </motion.div>
                  )}
                </motion.label>
              ))}
            </div>
            {errors[fieldName] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );

      case 'isTechnology':
        return (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Tipo de fornecedor
            </Label>
            <motion.label
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center p-6 rounded-lg border-2 cursor-pointer transition-all",
                fieldValue 
                  ? "bg-blue-50 border-blue-500 shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <Checkbox
                {...register(fieldName)}
                checked={fieldValue}
                onCheckedChange={(checked) => {
                  setValue(fieldName, checked as boolean);
                  if (onAutoAdvance) {
                    onAutoAdvance(checked);
                  }
                }}
                className="mr-3"
              />
              <div>
                <p className="text-lg font-medium">Fornecedor de TI/SaaS</p>
                <p className="text-sm text-gray-600 mt-1">
                  {fieldHelp[fieldName]}
                </p>
              </div>
            </motion.label>
          </div>
        );

      case 'documentFile':
        return (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Documentação complementar (opcional)
            </Label>
            <div className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              fieldValue ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            )}>
              <input
                type="file"
                {...register(fieldName)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                className="sr-only"
                id="file-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      form.setError(fieldName, {
                        message: 'Arquivo muito grande. Tamanho máximo: 10MB'
                      });
                      return;
                    }
                    setValue(fieldName, file);
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg mb-2">
                  {fieldValue ? fieldValue.name : 'Clique para selecionar ou arraste um arquivo'}
                </p>
                <p className="text-sm text-gray-600">
                  {fieldHelp[fieldName]}
                </p>
              </label>
              
              {fieldValue && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-sm text-blue-700">
                    {(fieldValue.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setValue(fieldName, undefined)}
                  >
                    <X className="h-4 w-4" />
                    Remover
                  </Button>
                </div>
              )}
            </div>
            {errors[fieldName] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors[fieldName]?.message}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="min-h-[300px]">{renderField()}</div>;
}