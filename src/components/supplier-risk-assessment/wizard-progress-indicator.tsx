'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface WizardProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgressIndicator({ currentStep, totalSteps }: WizardProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        
        {/* Step Counter */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Etapa {currentStep} de {totalSteps}
          </div>
          
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-medium text-blue-600"
          >
            {progress >= 100 ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Pronto para enviar
              </span>
            ) : (
              `${Math.round(progress)}% concluído`
            )}
          </motion.div>
        </div>
      </div>

      {/* Info Text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-gray-500 mt-2 text-center"
      >
        Triagem de Fornecedor - Preenchimento pelo Cliente
      </motion.p>
    </div>
  );
}