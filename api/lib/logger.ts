/**
 * 日志级别枚举
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  metadata?: Record<string, unknown>
  requestId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  responseTime?: number
  error?: {
    name: string
    message: string
    stack?: string
  }
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  apiKey?: string
  serviceName: string
  environment: string
}

/**
 * 增强型日志记录器
 */
export class Logger {
  private config: LoggerConfig
  private requestId: string

  constructor(config: LoggerConfig, requestId?: string) {
    this.config = config
    this.requestId = requestId || this.generateRequestId()
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 创建日志条目
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      requestId: this.requestId,
      ...metadata,
    }
  }

  /**
   * 发送日志到远程服务
   */
  private async sendToRemote(logEntry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) {
      return
    }

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : '',
          'X-Service-Name': this.config.serviceName,
        },
        body: JSON.stringify(logEntry),
      })

      if (!response.ok) {
        console.error('Failed to send log to remote service:', response.statusText)
      }
    } catch (error) {
      console.error('Error sending log to remote service:', error)
    }
  }

  /**
   * 记录日志
   */
  private async log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const logEntry = this.createLogEntry(level, message, metadata)

    // 控制台输出
    if (this.config.enableConsole) {
      const logMessage = `[${logEntry.timestamp}] [${level.toUpperCase()}] [${this.requestId}] ${message}`

      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, metadata)
          break
        case LogLevel.WARN:
          console.warn(logMessage, metadata)
          break
        case LogLevel.INFO:
          console.info(logMessage, metadata)
          break
        case LogLevel.DEBUG:
          console.debug(logMessage, metadata)
          break
      }
    }

    // 发送到远程日志服务
    if (this.config.enableRemote) {
      await this.sendToRemote(logEntry)
    }
  }

  /**
   * 错误日志
   */
  async error(message: string, error?: Error, metadata?: Record<string, unknown>): Promise<void> {
    const errorMetadata = {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    }

    await this.log(LogLevel.ERROR, message, errorMetadata)
  }

  /**
   * 警告日志
   */
  async warn(message: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.WARN, message, metadata)
  }

  /**
   * 信息日志
   */
  async info(message: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.INFO, message, metadata)
  }

  /**
   * 调试日志
   */
  async debug(message: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, metadata)
  }

  /**
   * 记录API请求
   */
  async logRequest(
    req: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.info('API Request', {
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
      ...metadata,
    })
  }

  /**
   * 记录API响应
   */
  async logResponse(
    statusCode: number,
    responseTime: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.info('API Response', {
      statusCode,
      responseTime,
      ...metadata,
    })
  }
}

/**
 * 创建日志记录器实例
 */
export function createLogger(requestId?: string): Logger {
  const config: LoggerConfig = {
    enableConsole: true,
    enableRemote: !!process.env.LOG_REMOTE_ENDPOINT,
    remoteEndpoint: process.env.LOG_REMOTE_ENDPOINT,
    apiKey: process.env.LOG_API_KEY,
    serviceName: 'ip-get-api',
    environment: process.env.NODE_ENV || 'development',
  }

  return new Logger(config, requestId)
}
