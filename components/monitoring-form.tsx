"use client"

import { useState } from "react"
import type { FormData } from "./supplier-risk-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, AlertCircle, ClipboardList } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import TasksList from "./tasks-list"
import TaskCreationForm from "./task-creation-form"

interface MonitoringFormProps {
  formData: FormData
  prevStep: () => void
}

export default function MonitoringForm({ formData, prevStep }: MonitoringFormProps) {
  const [activeTab, setActiveTab] = useState("monitoring")
  const [showTaskForm, setShowTaskForm] = useState(false)

  // Determina a frequência de monitoramento com base no tipo de fornecedor
  const getMonitoringFrequency = (supplierType: string) => {
    switch (supplierType) {
      case "A":
        return "Trimestral"
      case "B":
        return "Semestral"
      case "C":
        return "Anual"
      case "D":
        return "Bienal"
      default:
        return "A definir"
    }
  }

  const monitoringFrequency = getMonitoringFrequency(formData.supplierType)

  const handleCreateTask = () => {
    setShowTaskForm(true)
  }

  const handleTaskCreated = () => {
    setShowTaskForm(false)
  }

  const handleCancelTaskCreation = () => {
    setShowTaskForm(false)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Plano de Monitoramento</h2>
        <p className="text-gray-500">Definição do cronograma, procedimentos e tarefas de monitoramento contínuo.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Calendar className="h-10 w-10 text-purple-500" />
            <div>
              <h3 className="text-lg font-medium">Fornecedor: {formData.supplierName}</h3>
              <p className="text-sm text-gray-500">
                Tipo {formData.supplierType}: {formData.supplierTypeDescription}
              </p>
              <p className="text-sm font-medium mt-2">
                Frequência de Monitoramento Recomendada: <span className="text-purple-600">{monitoringFrequency}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="monitoring" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="monitoring">
            <Calendar className="h-4 w-4 mr-2" />
            Plano de Monitoramento
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ClipboardList className="h-4 w-4 mr-2" />
            Tarefas de Monitoramento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6 mt-6">
          <div className="space-y-4">
            <Label>Tipo de Monitoramento</Label>
            <RadioGroup defaultValue="standard" className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="standard" id="standard" className="mt-1" />
                <div>
                  <Label htmlFor="standard" className="font-medium">
                    Monitoramento Padrão
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Verificação periódica da conformidade com requisitos básicos
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="enhanced" id="enhanced" className="mt-1" />
                <div>
                  <Label htmlFor="enhanced" className="font-medium">
                    Monitoramento Avançado
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Verificação detalhada incluindo auditoria de segurança e conformidade
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="continuous" id="continuous" className="mt-1" />
                <div>
                  <Label htmlFor="continuous" className="font-medium">
                    Monitoramento Contínuo
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Verificação constante com alertas automáticos de não conformidade
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label htmlFor="monitoring_notes">Observações de Monitoramento</Label>
            <Textarea
              id="monitoring_notes"
              placeholder="Insira observações relevantes sobre o plano de monitoramento..."
              className="min-h-[120px]"
            />
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Recomendação</AlertTitle>
            <AlertDescription className="text-blue-700">
              Para fornecedores do tipo {formData.supplierType}, recomenda-se implementar verificações{" "}
              {monitoringFrequency.toLowerCase()}s e documentar todas as alterações significativas no processamento de
              dados.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Voltar
            </Button>
            <Button variant="default" onClick={() => setActiveTab("tasks")}>
              Gerenciar Tarefas de Monitoramento
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          {showTaskForm ? (
            <TaskCreationForm
              supplierName={formData.supplierName}
              supplierType={formData.supplierType}
              onTaskCreated={handleTaskCreated}
              onCancel={handleCancelTaskCreation}
            />
          ) : (
            <TasksList supplierName={formData.supplierName} onCreateTask={handleCreateTask} />
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setActiveTab("monitoring")}>
              Voltar para Plano de Monitoramento
            </Button>
            <Button variant="default">Finalizar Avaliação</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
