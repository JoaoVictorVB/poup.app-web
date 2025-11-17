import fs from 'fs'
import path from 'path'

interface LogEntry {
  timestamp: string
  eventType: string
  userName?: string
  userId?: string
  description: string
  details?: Record<string, unknown>
}

export class Logger {
  private logFilePath: string

  constructor(logFileName: string = 'application.log') {
    const logsDir = path.join(process.cwd(), 'logs')

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    this.logFilePath = path.join(logsDir, logFileName)
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, eventType, userName, userId, description, details } = entry

    let logMessage = `[${timestamp}] [${eventType}]`

    if (userName) {
      logMessage += ` [User: ${userName}]`
    }

    if (userId) {
      logMessage += ` [ID: ${userId}]`
    }

    logMessage += ` - ${description}`

    if (details && Object.keys(details).length > 0) {
      logMessage += ` | Details: ${JSON.stringify(details)}`
    }

    return logMessage + '\n'
  }

  private writeLog(entry: LogEntry): void {
    const logMessage = this.formatLogEntry(entry)

    try {
      fs.appendFileSync(this.logFilePath, logMessage, 'utf8')
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error)
    }
  }

  logUserRegistration(userName: string, userId: string, email: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'USER_REGISTRATION',
      userName,
      userId,
      description: 'Novo usuário cadastrado',
      details: { email },
    })
  }

  logUserUpdate(userName: string, userId: string, changes: string[]): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'USER_UPDATE',
      userName,
      userId,
      description: 'Dados do usuário alterados',
      details: { changes },
    })
  }

  logPasswordChange(userName: string, userId: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'PASSWORD_CHANGE',
      userName,
      userId,
      description: 'Senha do usuário alterada',
    })
  }

  logUserDeletion(userName: string, userId: string, email: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'USER_DELETION',
      userName,
      userId,
      description: 'Usuário excluído',
      details: { email },
    })
  }

  logAuthenticationFailure(email: string, reason: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_FAILURE',
      description: `Falha de autenticação para ${email}`,
      details: { reason },
    })
  }

  logAccountLocked(userName: string, userId: string, lockedUntil: Date): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'ACCOUNT_LOCKED',
      userName,
      userId,
      description: '5 tentativas consecutivas de autenticação falharam - conta bloqueada',
      details: { lockedUntil: lockedUntil.toISOString() },
    })
  }

  logAuthenticationSuccess(userName: string, userId: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SUCCESS',
      userName,
      userId,
      description: 'Autenticação bem-sucedida',
    })
  }

  logSubscriptionCreated(userName: string, userId: string, subscriptionName: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'SUBSCRIPTION_CREATED',
      userName,
      userId,
      description: `Nova assinatura criada: ${subscriptionName}`,
    })
  }

  logSubscriptionUpdated(
    userName: string,
    userId: string,
    subscriptionName: string,
    changes: string[]
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'SUBSCRIPTION_UPDATED',
      userName,
      userId,
      description: `Assinatura atualizada: ${subscriptionName}`,
      details: { changes },
    })
  }

  logSubscriptionDeleted(userName: string, userId: string, subscriptionName: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'SUBSCRIPTION_DELETED',
      userName,
      userId,
      description: `Assinatura excluída: ${subscriptionName}`,
    })
  }

  logCalendarEventCreated(title: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'CALENDAR_EVENT_CREATED',
      description: `Novo evento de calendário criado: ${title}`,
    })
  }

  logCalendarEventUpdated(title: string, changes: string[]): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'CALENDAR_EVENT_UPDATED',
      description: `Evento de calendário atualizado: ${title}`,
      details: { changes },
    })
  }

  logCalendarEventDeleted(title: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      eventType: 'CALENDAR_EVENT_DELETED',
      description: `Evento de calendário excluído: ${title}`,
    })
  }
}

export const logger = new Logger()
