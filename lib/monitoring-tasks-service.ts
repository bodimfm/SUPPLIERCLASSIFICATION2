// lib/monitoring-tasks-service.ts

import { getEmailService } from "./email-service"
import { supabase } from "./supabase-client"
import { v4 as uuidv4 } from "uuid"

export interface MonitoringTask {
  id: string
  supplierName: string
  supplierType: string
  taskName: string
  description: string
  dueDate: Date
  assignedTo: string
  status: string
  priority: string
  createdAt: Date
  notifyEmail: boolean
  emailsSent: string[]
  supplier_id?: string
}

export interface TaskFormData {
  taskName: string
  description: string
  dueDate: string
  assignedTo: string
  priority: "low" | "medium" | "high"
  notifyEmail: boolean
  supplier_id?: string
}

class MonitoringTasksService {
  private tasks: MonitoringTask[] = []
  private initialized: boolean = false

  constructor() {
    // Esta inicialização é adiada para quando o primeiro método for chamado
    // Isso evita problemas com SSR no Next.js
  }

  private async initialize() {
    if (!this.initialized) {
      await this.loadTasksFromSupabase()
      this.initialized = true
    }
  }

  async getTasks(): Promise<MonitoringTask[]> {
    await this.initialize()
    return this.tasks
  }

  async getTasksForSupplier(supplierName: string): Promise<MonitoringTask[]> {
    await this.initialize()
    return this.tasks.filter((task) => task.supplierName === supplierName)
  }

  async getTasksBySupplierID(supplierId: string): Promise<MonitoringTask[]> {
    await this.initialize()
    
    try {
      const { data, error } = await supabase
        .from('monitoring_tasks')
        .select('*')
        .eq('supplier_id', supplierId)
      
      if (error) throw error
      
      // Converter dados do formato do Supabase para o formato da aplicação
      return data.map(task => ({
        id: task.id,
        supplierName: task.supplier_name || '',
        supplierType: task.supplier_type || '',
        taskName: task.task_name,
        description: task.description || '',
        dueDate: new Date(task.due_date),
        assignedTo: task.assigned_to,
        status: task.status,
        priority: task.priority,
        createdAt: new Date(task.created_at),
        notifyEmail: task.notify_email || false,
        emailsSent: task.email_notifications ? JSON.parse(task.email_notifications) : [],
        supplier_id: task.supplier_id
      }));
    } catch (error) {
      console.error("Erro ao carregar tarefas do Supabase:", error)
      return []
    }
  }

  async createTask(supplierName: string, supplierType: string, taskFormData: TaskFormData): Promise<void> {
    await this.initialize()
    
    try {
      // Buscar o ID do fornecedor se não for fornecido
      let supplier_id = taskFormData.supplier_id
      
      if (!supplier_id) {
        const { data: suppliers } = await supabase
          .from('suppliers')
          .select('id')
          .eq('name', supplierName)
          .limit(1)
        
        if (suppliers && suppliers.length > 0) {
          supplier_id = suppliers[0].id
        }
      }
      
      // Criar a tarefa no Supabase
      const taskId = uuidv4()
      const { error } = await supabase
        .from('monitoring_tasks')
        .insert({
          id: taskId,
          supplier_id: supplier_id || null,
          task_name: taskFormData.taskName,
          description: taskFormData.description,
          due_date: new Date(taskFormData.dueDate).toISOString(),
          assigned_to: taskFormData.assignedTo,
          status: 'pending',
          priority: taskFormData.priority,
          notify_email: taskFormData.notifyEmail,
          email_notifications: JSON.stringify([]),
          created_at: new Date().toISOString(),
          supplier_name: supplierName,
          supplier_type: supplierType
        })
      
      if (error) throw error
      
      // Adicionar à lista local
      const task: MonitoringTask = {
        id: taskId,
        supplierName: supplierName,
        supplierType: supplierType,
        taskName: taskFormData.taskName,
        description: taskFormData.description,
        dueDate: new Date(taskFormData.dueDate),
        assignedTo: taskFormData.assignedTo,
        status: "pending",
        priority: taskFormData.priority,
        createdAt: new Date(),
        notifyEmail: taskFormData.notifyEmail,
        emailsSent: [],
        supplier_id: supplier_id || undefined
      }
      
      this.tasks.push(task)
      
      console.log("Tarefa criada com sucesso:", task)
    } catch (error) {
      console.error("Erro ao criar tarefa:", error)
      throw error
    }
  }

  async updateTask(updatedTask: MonitoringTask): Promise<void> {
    await this.initialize()
    
    try {
      // Atualizar no Supabase
      const { error } = await supabase
        .from('monitoring_tasks')
        .update({
          task_name: updatedTask.taskName,
          description: updatedTask.description,
          due_date: updatedTask.dueDate.toISOString(),
          assigned_to: updatedTask.assignedTo,
          status: updatedTask.status,
          priority: updatedTask.priority,
          notify_email: updatedTask.notifyEmail,
          email_notifications: JSON.stringify(updatedTask.emailsSent),
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id)
      
      if (error) throw error
      
      // Atualizar localmente
      this.tasks = this.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      
      console.log("Tarefa atualizada com sucesso:", updatedTask)
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      throw error
    }
  }

  async updateTaskStatus(taskId: string, status: "pending" | "in-progress" | "completed" | "overdue"): Promise<void> {
    await this.initialize()
    
    try {
      // Atualizar o status no Supabase
      const { error } = await supabase
        .from('monitoring_tasks')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
      
      if (error) throw error
      
      // Atualizar localmente
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId)
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = { ...this.tasks[taskIndex], status: status }
      }
      
      console.log("Status da tarefa atualizado para:", status)
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error)
      throw error
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.initialize()
    
    try {
      // Remover do Supabase
      const { error } = await supabase
        .from('monitoring_tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
      
      // Remover localmente
      this.tasks = this.tasks.filter((task) => task.id !== taskId)
      
      console.log("Tarefa removida com sucesso")
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
      throw error
    }
  }

  async checkDueDatesAndSendNotifications(): Promise<void> {
    await this.initialize()
    
    const today = new Date()
    for (const task of this.tasks) {
      if (task.dueDate <= today && task.notifyEmail) {
        await this.sendTaskNotification(task)
      }
    }
  }

  private async sendTaskNotification(task: MonitoringTask): Promise<void> {
    try {
      const emailService = getEmailService()

      // Enviar notificação por e-mail
      const success = await emailService.sendTaskNotification(
        task.assignedTo,
        task.taskName,
        task.dueDate,
        task.supplierName,
      )

      if (success) {
        // Registrar o envio do e-mail
        const today = new Date().toLocaleDateString()
        if (!task.emailsSent.includes(today)) {
          task.emailsSent.push(today)

          // Registrar o envio no Supabase
          await supabase.rpc('log_email_notification', {
            task_id: task.id,
            sent_date: new Date().toISOString(),
            recipient: task.assignedTo
          })
          
          // Atualizar a tarefa
          await this.updateTask(task)
        }

        console.log("E-mail de notificação enviado para:", task.assignedTo, "sobre a tarefa:", task.taskName)
      }
    } catch (error) {
      console.error("Erro ao enviar notificação por e-mail:", error)
    }
  }

  private async loadTasksFromSupabase(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('monitoring_tasks')
        .select('*')
        .order('due_date', { ascending: true })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        // Converter dados do formato do Supabase para o formato da aplicação
        this.tasks = data.map(task => ({
          id: task.id,
          supplierName: task.supplier_name || '',
          supplierType: task.supplier_type || '',
          taskName: task.task_name,
          description: task.description || '',
          dueDate: new Date(task.due_date),
          assignedTo: task.assigned_to,
          status: task.status,
          priority: task.priority,
          createdAt: new Date(task.created_at),
          notifyEmail: task.notify_email || false,
          emailsSent: task.email_notifications ? JSON.parse(task.email_notifications) : [],
          supplier_id: task.supplier_id
        }));
      } else {
        // Usar dados de exemplo apenas se não houver dados no banco
        this.tasks = [
          {
            id: "task-demo-1",
            supplierName: "Fornecedor Exemplo",
            supplierType: "B",
            taskName: "Verificação semestral de conformidade",
            description: "Realizar auditoria de conformidade com LGPD",
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias no futuro
            assignedTo: "ana.silva@escritorio.com",
            status: "pending",
            priority: "medium",
            createdAt: new Date(),
            notifyEmail: true,
            emailsSent: [],
          },
          {
            id: "task-demo-2",
            supplierName: "Fornecedor Exemplo",
            supplierType: "B",
            taskName: "Atualização de documentação",
            description: "Solicitar atualização da política de privacidade",
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias no futuro
            assignedTo: "carlos.oliveira@escritorio.com",
            status: "in-progress",
            priority: "high",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias no passado
            notifyEmail: true,
            emailsSent: ["10/03/2023"],
          },
        ]
      }
      
      console.log(`${this.tasks.length} tarefas carregadas do Supabase`)
    } catch (error) {
      console.error("Erro ao carregar tarefas do Supabase:", error)
      
      // Usar dados de exemplo em caso de erro
      this.tasks = [
        {
          id: "task-demo-1",
          supplierName: "Fornecedor Exemplo (Dados de demonstração)",
          supplierType: "B",
          taskName: "Verificação semestral de conformidade",
          description: "Realizar auditoria de conformidade com LGPD",
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          assignedTo: "ana.silva@escritorio.com",
          status: "pending",
          priority: "medium",
          createdAt: new Date(),
          notifyEmail: true,
          emailsSent: [],
        }
      ]
    }
  }
}

let monitoringTasksServiceInstance: MonitoringTasksService | null = null

export function getMonitoringTasksService(): MonitoringTasksService {
  if (!monitoringTasksServiceInstance) {
    monitoringTasksServiceInstance = new MonitoringTasksService()
  }
  return monitoringTasksServiceInstance
}
