import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

export interface RemoteLogEntry {
  timestamp: string
  level: 'error' | 'warn'
  message: string
  service: string
  requestId?: string
  metadata?: Record<string, any>
  stack?: string
}

@Injectable()
export class RemoteLoggerService {
  private readonly logger = new Logger(RemoteLoggerService.name)
  private readonly httpClient: AxiosInstance
  private readonly logServiceUrl: string
  private readonly apiKey: string
  private readonly serviceName: string
  private readonly enabled: boolean

  constructor(private readonly configService: ConfigService) {
    this.logServiceUrl = this.configService.get<string>('LOG_SERVICE_URL')
    this.apiKey = this.configService.get<string>('LOG_SERVICE_API_KEY')
    this.serviceName = this.configService.get<string>('SERVICE_NAME', 'ip-info-backend')
    this.enabled = this.configService.get<boolean>('REMOTE_LOGGING_ENABLED', true)

    // 创建HTTP客户端
    this.httpClient = axios.create({
      baseURL: this.logServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    })

    // 请求拦截器
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`发送日志请求: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        this.logger.error('日志请求拦截器错误:', error.message)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`日志请求成功: ${response.status}`)
        return response
      },
      (error) => {
        this.logger.error('日志请求失败:', error.message)
        // 不要抛出错误，避免影响主业务逻辑
        return Promise.resolve({ data: { success: false, error: error.message } })
      }
    )
  }

  /**
   * 记录错误日志
   * @param message 错误消息
   * @param metadata 元数据
   * @param stack 错误堆栈
   * @param requestId 请求ID
   */
  async logError(
    message: string,
    metadata?: Record<string, any>,
    stack?: string,
    requestId?: string
  ): Promise<void> {
    await this.sendLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      service: this.serviceName,
      requestId,
      metadata,
      stack,
    })
  }

  /**
   * 记录警告日志
   * @param message 警告消息
   * @param metadata 元数据
   * @param requestId 请求ID
   */
  async logWarning(
    message: string,
    metadata?: Record<string, any>,
    requestId?: string
  ): Promise<void> {
    await this.sendLog({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      service: this.serviceName,
      requestId,
      metadata,
    })
  }

  /**
   * 发送日志到远程服务
   * @param logEntry 日志条目
   */
  private async sendLog(logEntry: RemoteLogEntry): Promise<void> {
    // 如果远程日志记录被禁用，则只在本地记录
    if (!this.enabled) {
      this.logger.debug('远程日志记录已禁用，跳过发送')
      return
    }

    // 检查必要的配置
    if (!this.logServiceUrl || !this.apiKey) {
      this.logger.warn('远程日志服务配置不完整，跳过发送')
      return
    }

    try {
      this.logger.debug(`准备发送日志: ${JSON.stringify(logEntry)}`)
      const response = await this.httpClient.post('/api/logs', logEntry)

      this.logger.debug(`远程日志响应: ${JSON.stringify(response.data)}`)

      if (response.data?.success !== false) {
        this.logger.debug(`远程日志记录成功: ${logEntry.level} - ${logEntry.message}`)
      } else {
        this.logger.warn(`远程日志记录失败: ${response.data?.error || '未知错误'}`)
      }
    } catch (error) {
      // 记录本地日志，但不影响主业务逻辑
      this.logger.error(`发送远程日志失败: ${error.message}`)
    }
  }

  /**
   * 批量发送日志
   * @param logEntries 日志条目数组
   */
  async sendBatchLogs(logEntries: RemoteLogEntry[]): Promise<void> {
    if (!this.enabled || logEntries.length === 0) {
      return
    }

    // 并发发送，但限制并发数量
    const batchSize = 5
    for (let i = 0; i < logEntries.length; i += batchSize) {
      const batch = logEntries.slice(i, i + batchSize)
      await Promise.allSettled(batch.map((entry) => this.sendLog(entry)))
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    if (!this.enabled || !this.logServiceUrl) {
      return false
    }

    try {
      const response = await this.httpClient.get('/health')
      return response.data?.status === 'healthy'
    } catch (error) {
      this.logger.error(`日志服务健康检查失败: ${error.message}`)
      return false
    }
  }
}
