/**
 * Serviço para envio de e-mails de notificação
 */
export class EmailService {
  private static instance: EmailService

  private constructor() {}

  /**
   * Obtém a instância singleton do serviço
   */
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * Envia um e-mail de notificação sobre uma tarefa
   * @param to Destinatário do e-mail
   * @param subject Assunto do e-mail
   * @param content Conteúdo do e-mail
   */
  public async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    try {
      // Em um ambiente real, aqui faríamos uma chamada para um serviço de e-mail
      // como SendGrid, Mailgun, ou Microsoft Graph para enviar via Outlook/Exchange

      // Simulação - Em produção, isso seria substituído pelo envio real de e-mail
      console.log(`Enviando e-mail para: ${to}`)
      console.log(`Assunto: ${subject}`)
      console.log(`Conteúdo: ${content}`)

      // Simular um atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 500))

      return true
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error)
      return false
    }
  }

  /**
   * Envia uma notificação sobre uma tarefa de monitoramento
   * @param email E-mail do destinatário
   * @param taskName Nome da tarefa
   * @param dueDate Data de vencimento
   * @param supplierName Nome do fornecedor
   */
  public async sendTaskNotification(
    email: string,
    taskName: string,
    dueDate: Date,
    supplierName: string,
  ): Promise<boolean> {
    const subject = `[Monitoramento LGPD] Tarefa: ${taskName}`

    const formattedDate = new Date(dueDate).toLocaleDateString("pt-BR")

    const content = `
      Olá,
      
      Você tem uma tarefa de monitoramento LGPD pendente:
      
      Tarefa: ${taskName}
      Fornecedor: ${supplierName}
      Data de vencimento: ${formattedDate}
      
      Por favor, acesse o sistema de gestão de riscos de privacidade para mais detalhes.
      
      Atenciosamente,
      Sistema de Gestão de Riscos de Privacidade
    `

    return this.sendEmail(email, subject, content)
  }

  /**
   * Envia um lembrete sobre uma tarefa próxima do vencimento
   * @param email E-mail do destinatário
   * @param taskName Nome da tarefa
   * @param dueDate Data de vencimento
   * @param supplierName Nome do fornecedor
   */
  public async sendTaskReminder(
    email: string,
    taskName: string,
    dueDate: Date,
    supplierName: string,
  ): Promise<boolean> {
    const subject = `[LEMBRETE] Tarefa de monitoramento LGPD próxima do vencimento`

    const formattedDate = new Date(dueDate).toLocaleDateString("pt-BR")
    const daysRemaining = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    const content = `
      Olá,
      
      Este é um lembrete sobre uma tarefa de monitoramento LGPD que está próxima do vencimento:
      
      Tarefa: ${taskName}
      Fornecedor: ${supplierName}
      Data de vencimento: ${formattedDate} (${daysRemaining} dias restantes)
      
      Por favor, acesse o sistema de gestão de riscos de privacidade para mais detalhes e atualizar o status da tarefa.
      
      Atenciosamente,
      Sistema de Gestão de Riscos de Privacidade
    `

    return this.sendEmail(email, subject, content)
  }
}

/**
 * Função de conveniência para obter o serviço de e-mail
 */
export function getEmailService(): EmailService {
  return EmailService.getInstance()
}
