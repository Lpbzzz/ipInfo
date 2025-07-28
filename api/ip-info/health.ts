import { createLogger } from '../lib/logger'
import type { RequestLike } from '../lib/logger'

/**
 * Vercel API 请求对象类型
 */
interface VercelRequest extends RequestLike {
  method?: string
}

/**
 * Vercel API 响应对象类型
 */
interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: Record<string, unknown>) => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now()
  const logger = createLogger()

  // 记录请求开始
  await logger.logRequest(req, { endpoint: '/api/ip-info/health' })

  if (req.method === 'GET') {
    const responseTime = Date.now() - startTime
    await logger.info('Health check successful', { responseTime })
    await logger.logResponse(200, responseTime, { success: true })

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ip-info-api',
      version: '1.0.0',
    })
  }

  await logger.warn('Method not allowed', { method: req.method })
  const responseTime = Date.now() - startTime
  await logger.logResponse(405, responseTime, { success: false })

  return res.status(405).json({ error: 'Method not allowed' })
}
