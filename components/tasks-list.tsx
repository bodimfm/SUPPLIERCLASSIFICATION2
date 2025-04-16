"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Mail,
  ArrowUpCircle,
  MoreHorizontal,
  RefreshCw,
  Plus,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type MonitoringTask, getMonitoringTasksService } from "@/lib/monitoring-tasks-service"
import TaskCreationForm from "./task-creation-form"

interface TasksListProps {
  supplierName?: string
  supplierId?: string
  onCreateTask?: () => void
  standalone?: boolean
}

export function TasksList({ supplierName, supplierId, onCreateTask, standalone = false }: TasksListProps) {
  const [tasks, setTasks] = useState<MonitoringTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const loadTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const tasksService = getMonitoringTasksService()
      
      let supplierTasks: MonitoringTask[] = []
      
      if (supplierId) {
        // Carregar tarefas pelo ID do fornecedor
        supplierTasks = await tasksService.getTasksBySupplierID(supplierId)
      } else if (supplierName) {
        // Carregar tarefas pelo nome do fornecedor
        supplierTasks = await tasksService.getTasksForSupplier(supplierName)
      } else if (standalone) {
        // Carregar todas as tarefas se for componente independente
        supplierTasks = await tasksService.getTasks()
      }
      
      setTasks(supplierTasks)
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err)
      setError("Não foi possível carregar as tarefas. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [supplierName, supplierId, standalone])

  const handleUpdateStatus = async (taskId: string, status: "pending" | "in-progress" | "completed" | "overdue") => {
    try {
      const tasksService = getMonitoringTasksService()
      await tasksService.updateTaskStatus(taskId, status)
      await loadTasks() // Recarregar a lista após atualização
    } catch (err) {
      console.error("Erro ao atualizar status da tarefa:", err)
    }
  }
  
  const handleCreateTaskClick = () => {
    if (onCreateTask) {
      onCreateTask()
    } else {
      setShowCreateForm(true)
    }
  }
  
  const handleTaskCreated = async () => {
    setShowCreateForm(false)
    await loadTasks() // Recarregar as tarefas após a criação
  }
  
  const handleCancelCreate = () => {
    setShowCreateForm(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-gray-100">
            Pendente
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Em Andamento
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Concluída
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Atrasada
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Baixa</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Média</Badge>
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Alta</Badge>
      default:
        return <Badge>Desconhecida</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const isOverdue = (date: Date) => {
    return new Date(date) < new Date()
  }

  // Se estiver mostrando o formulário de criação de tarefa
  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Nova Tarefa de Monitoramento</h3>
          <Button variant="outline" size="sm" onClick={handleCancelCreate}>
            Cancelar
          </Button>
        </div>
        
        <TaskCreationForm 
          supplierName={supplierName || "Fornecedor"}
          supplierType={"A"} // Valor padrão, idealmente seria dinâmico
          onTaskCreated={handleTaskCreated}
          onCancel={handleCancelCreate}
        />
      </div>
    )
  }

  // Lista de tarefas
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Tarefas de Monitoramento</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadTasks} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" onClick={handleCreateTaskClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="mt-2 text-gray-500">Carregando tarefas do Supabase...</p>
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhuma tarefa de monitoramento encontrada.</p>
            <Button className="mt-4" onClick={handleCreateTaskClick}>
              Criar Primeira Tarefa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`
              ${task.status === "overdue" ? "border-red-200" : ""}
              ${task.status === "completed" ? "bg-gray-50" : ""}
            `}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{task.taskName}</h4>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>

                    <p className="text-sm text-gray-600">{task.description}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span
                          className={
                            isOverdue(task.dueDate) && task.status !== "completed" ? "text-red-600 font-medium" : ""
                          }
                        >
                          Vencimento: {formatDate(task.dueDate)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{task.assignedTo}</span>
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Criada em: {formatDate(task.createdAt)}</span>
                      </div>

                      {task.notifyEmail && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>Notificações ativas</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {task.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleUpdateStatus(task.id, "completed")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {task.status !== "pending" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(task.id, "pending")}>
                            Marcar como Pendente
                          </DropdownMenuItem>
                        )}
                        {task.status !== "in-progress" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(task.id, "in-progress")}>
                            <ArrowUpCircle className="h-4 w-4 mr-2" />
                            Marcar Em Andamento
                          </DropdownMenuItem>
                        )}
                        {task.status !== "overdue" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(task.id, "overdue")}>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Marcar como Atrasada
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
