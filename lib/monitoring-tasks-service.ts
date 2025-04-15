// lib/monitoring-tasks-service.ts

import { getEmailService } from "./email-service"
import { getExcelSyncService } from "./excel-sync-service"

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
}

export interface TaskFormData {
  taskName: string
  description: string
  dueDate: string
  assignedTo: string
  priority: "low" | "medium" | "high"
  notifyEmail: boolean
}

class MonitoringTasksService {
  private tasks: MonitoringTask[] = []

  constructor() {
    this.loadTasksFromSharePoint()
  }

  async getTasks(): Promise<MonitoringTask[]> {
    return this.tasks
  }

  async getTasksForSupplier(supplierName: string): Promise<MonitoringTask[]> {
    return this.tasks.filter((task) => task.supplierName === supplierName)
  }

  async createTask(supplierName: string, supplierType: string, taskFormData: TaskFormData): Promise<void> {
    const task: MonitoringTask = {
      id: Math.random().toString(36).substring(2, 15),
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
    }
    this.tasks.push(task)
    await this.syncTaskToSharePoint(task)
  }

  async updateTask(updatedTask: MonitoringTask): Promise<void> {
    this.tasks = this.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    await this.syncTaskToSharePoint(updatedTask)
  }

  async updateTaskStatus(taskId: string, status: "pending" | "in-progress" | "completed" | "overdue"): Promise<void> {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId)
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], status: status }
      await this.syncTaskToSharePoint(this.tasks[taskIndex])
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks = this.tasks.filter((task) => task.id !== taskId)
    // Ideally, you'd also remove the task from SharePoint here
  }

  private async syncTaskToSharePoint(task: MonitoringTask): Promise<void> {
    try {
      // Usar o serviço de sincronização com Excel
      const excelService = getExcelSyncService()
      await excelService.syncTaskToExcel(task)

      console.log("Tarefa sincronizada com SharePoint:", task)
    } catch (error) {
      console.error("Erro ao sincronizar tarefa com SharePoint:", error)
      throw error
    }
  }

  async checkDueDatesAndSendNotifications(): Promise<void> {
    const today = new Date()
    for (const task of this.tasks) {
      if (task.dueDate <= today && task.notifyEmail) {
        await this.sendTaskNotification(task)
      }
    }
  }

  private async sendTaskNotification(task: MonitoringTask): Promise<void> {
    try {
      // Usar o serviço de e-mail
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

          // Atualizar o registro na planilha
          await this.syncTaskToSharePoint(task)
        }

        console.log("E-mail de notificação enviado para:", task.assignedTo, "sobre a tarefa:", task.taskName)
      }
    } catch (error) {
      console.error("Erro ao enviar notificação por e-mail:", error)
    }
  }

  private async loadTasksFromSharePoint(): Promise<void> {
    try {
      // Usar o serviço de sincronização com Excel para carregar tarefas
      const excelService = getExcelSyncService()
      const loadedTasks = await excelService.loadTasksFromExcel()

      // Se não houver tarefas carregadas, usar dados simulados para demonstração
      if (loadedTasks.length === 0) {
        // Dados simulados para demonstração
        this.tasks = [
          {
            id: "1",
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
            id: "2",
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
      } else {
        this.tasks = loadedTasks
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas do SharePoint:", error)
      throw error
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
