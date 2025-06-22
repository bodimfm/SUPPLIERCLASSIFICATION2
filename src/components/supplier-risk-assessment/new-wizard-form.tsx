'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { screeningSchema, ScreeningFormData, questionFields } from '@/lib/validations/screening-schema';
import { createSupplier, createAssessment, saveScreeningResponse } from '@/lib/supabase';
import { calculateSupplierType } from '@/lib/risk-assessment';
import { QuestionStep } from './question-step';
import { WizardProgressIndicator } from './wizard-progress-indicator';
import { LiveClassification } from './live-classification';
import { SubmissionStatus } from './submission-status';

interface NewWizardFormProps {
  companyId: string;
}

const questionTitles = {
  supplierName: 'Nome do Fornecedor',
  cnpj: 'CNPJ do Fornecedor',
  internalResponsible: 'Responsável Interno pela Triagem',
  serviceDescription: 'Descrição do Serviço/Fornecimento',
  dataVolume: 'Volume de Dados Envolvidos',
  dataSensitivity: 'Sensibilidade dos Dados',
  contractType: 'Tipo de Contrato',
  isTechnology: 'Fornecedor de TI/SaaS',
  classification: 'Análise de Classificação de Risco',
  documentFile: 'Upload de Documentos Relevantes'
};

export function NewWizardForm({ companyId }: NewWizardFormProps) {
  const [mounted, setMounted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ScreeningFormData>({
    resolver: zodResolver(screeningSchema),
    mode: 'onChange',
    defaultValues: {
      supplierName: '',
      cnpj: '',
      internalResponsible: '',
      serviceDescription: '',
      isTechnology: false,
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const { watch, getValues, trigger } = form;
  const watchedValues = watch();

  const canShowClassification = watchedValues.supplierName && 
    watchedValues.serviceDescription && 
    watchedValues.dataVolume && 
    watchedValues.dataSensitivity &&
    watchedValues.internalResponsible &&
    watchedValues.contractType;

  const currentFieldName = questionFields[currentQuestion];
  const currentTitle = questionTitles[currentFieldName];

  const sensitiveFlagged = watchedValues.dataSensitivity === 'sensitive';

  const handleNext = async () => {
    // Se for a etapa de classificação, pode prosseguir sem validação
    if (currentFieldName === 'classification') {
      if (currentQuestion < questionFields.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
      return;
    }
    
    const isValid = await trigger(currentFieldName);
    
    if (isValid) {
      if (currentQuestion < questionFields.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleAutoAdvance = async (value: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (currentQuestion < questionFields.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorDetails(null);

      const isValid = await trigger();
      
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Erro na validação",
          description: "Por favor, verifique todos os campos obrigatórios."
        });
        return;
      }

      const formData = getValues();
      
      const { code, type } = calculateSupplierType(
        formData.dataVolume,
        formData.dataSensitivity
      );

      const riskLevel = {
        'A': 'critical',
        'B': 'high', 
        'C': 'medium',
        'D': 'low'
      }[code] || 'low';

      const supplierData = {
        company_id: companyId,
        name: formData.supplierName,
        cnpj: formData.cnpj || null,
        supplier_type: code,
        risk_level: riskLevel,
        status: 'pending',
        contract_type: formData.contractType,
        is_technology: formData.isTechnology,
        data_volume: formData.dataVolume,
        data_sensitivity: formData.dataSensitivity === 'non-sensitive' ? 'none' : 
                         formData.dataSensitivity === 'regular' ? 'common' : 'sensitive',
        service_description: formData.serviceDescription,
        internal_responsible: formData.internalResponsible
      };

      const supplier = await createSupplier(supplierData);
      
      if (!supplier?.id) {
        throw new Error('Falha ao criar fornecedor');
      }

      const assessmentData = {
        supplier_id: supplier.id,
        status: 'draft',
        risk_level: riskLevel,
        data_volume: formData.dataVolume,
        data_type: formData.dataSensitivity === 'non-sensitive' ? 'none' : 
                   formData.dataSensitivity === 'regular' ? 'common' : 'sensitive',
        classification_code: code,
        classification_description: type
      };

      const assessment = await createAssessment(assessmentData);

      if (formData.documentFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.documentFile);
        uploadFormData.append('supplierId', supplier.id);
        uploadFormData.append('assessmentId', assessment.id);

        try {
          const uploadResponse = await fetch('/api/documents', {
            method: 'POST',
            body: uploadFormData
          });

          if (!uploadResponse.ok) {
            throw new Error('Falha no upload do documento');
          }
        } catch (uploadError) {
          console.error('Erro no upload:', uploadError);
          toast({
            variant: "destructive",
            title: "Aviso",
            description: "O fornecedor foi criado, mas houve uma falha ao enviar o documento."
          });
        }
      }

      await saveScreeningResponse({
        nome_fornecedor: formData.supplierName,
        cnpj: formData.cnpj || null,
        respostas: formData as any,
        data_submissao: new Date().toISOString(),
        status_processamento: 'pendente',
        fornecedor_id: supplier.id as any,
      });

      setSubmissionData({
        supplier,
        assessment,
        classificationCode: code,
        classificationType: type
      });
      
      setSubmissionComplete(true);
      
      toast({
        title: "Triagem concluída!",
        description: "A avaliação foi enviada com sucesso."
      });

    } catch (error) {
      console.error('Erro ao submeter:', error);
      setErrorDetails(error instanceof Error ? error.message : 'Erro desconhecido');
      
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao submeter a avaliação. Por favor, tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = currentQuestion === questionFields.length - 1;
  const currentFieldValue = watchedValues[currentFieldName as keyof ScreeningFormData];
  const isCurrentFieldValid = currentFieldName === 'cnpj' || 
    currentFieldName === 'documentFile' || 
    currentFieldName === 'isTechnology' ||
    currentFieldName === 'classification' // classificação sempre pode prosseguir
    ? true // campos opcionais sempre válidos
    : !!currentFieldValue;

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (submissionComplete && submissionData) {
    return (
      <SubmissionStatus 
        supplier={submissionData.supplier}
        assessment={submissionData.assessment}
        classificationCode={submissionData.classificationCode}
        classificationType={submissionData.classificationType}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <WizardProgressIndicator 
        currentStep={currentQuestion + 1}
        totalSteps={questionFields.length}
      />

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestion}
          {...pageTransition}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900">{currentTitle}</h2>

          {currentFieldName === 'classification' ? (
            <div className="space-y-6">
              <p className="text-gray-600">
                Com base nas informações fornecidas, aqui está a análise de risco do fornecedor:
              </p>
              <LiveClassification
                supplierName={watchedValues.supplierName}
                dataVolume={watchedValues.dataVolume}
                dataSensitivity={watchedValues.dataSensitivity}
                serviceDescription={watchedValues.serviceDescription}
                isTechnology={watchedValues.isTechnology}
              />
            </div>
          ) : (
            <QuestionStep
              fieldName={currentFieldName}
              form={form}
              onAutoAdvance={handleAutoAdvance}
              sensitiveFlagged={sensitiveFlagged}
            />
          )}

          {errorDetails && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold">Erro ao submeter</p>
              <p className="text-red-600 text-sm mt-1">{errorDetails}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {!isLastQuestion ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentFieldValid || isSubmitting}
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Submeter para Análise'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}