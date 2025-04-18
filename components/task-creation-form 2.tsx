"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, Mail, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { type TaskFormData, getMonitoringTasksService } from "@/lib/monitoring-tasks-service"

interface TaskCreationFormProps {
  supplierName: string
  supplierType: string
  onTaskCreated: () => void
  onCancel: () => void
}

export default function TaskCreationForm({
  supplierName,
  supplierType,
  onTaskCreated,
  onCancel,
}: TaskCreationFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    taskName: "",
    description: "",
    dueDate: "",
    assignedTo: "",
    priority: "medium",
    notifyEmail: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof TaskFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validação básica
    if (!formData.taskName || !formData.dueDate || !formData.assignedTo) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsSubmitting(true)

    try {
      const tasksService = getMonitoringTasksService()
      await tasksService.createTask(supplierName, supplierType, formData)
      onTaskCreated()
    } catch (err) {
      console.error("Erro ao criar tarefa:", err)
      setError("Ocorreu um erro ao criar a tarefa. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Nova Tarefa de Monitoramento</h3>
            <p className="text-sm text-gray-500">
              Crie uma nova tarefa para monitoramento do fornecedor {supplierName}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="taskName">Nome da Tarefa *</Label>
              <Input
                id="taskName"
                value={formData.taskName}
                onChange={(e) => handleChange("taskName", e.target.value)}
                placeholder="Ex: Verificação semestral de conformidade"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descreva os detalhes da tarefa..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <div className="relative">
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="assignedTo">Responsável *</Label>
                <Input
                  id="assignedTo"
                  type="email"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange("assignedTo", e.target.value)}
                  placeholder="email@escritorio.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Prioridade</Label>
              <RadioGroup
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value as "low" | "medium" | "high")}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-green-600">
                    Baixa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-amber-600">
                    Média
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-red-600">
                    Alta
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notifyEmail"
                checked={formData.notifyEmail}
                onCheckedChange={(checked) => handleChange("notifyEmail", checked)}
              />
              <div className="grid gap-1.5">
                <Label htmlFor="notifyEmail" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar notificações por e-mail
                </Label>
                <p className="text-sm text-gray-500">O responsável receberá lembretes por e-mail sobre esta tarefa</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
