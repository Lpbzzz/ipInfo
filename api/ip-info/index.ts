import { convertLocationDataToIpInfo } from '../lib/ip-info-converter'
import { getLocationByIp, getUserIpFromRequest } from '../lib/ip-utils'
import { createLogger } from '../lib/logger'
import type { RequestLike } from '../lib/logger'

/**
 * Vercel API 请求对象类型
 */
interface VercelRequest extends RequestLike {
  method?: string
  headers: {
    'x-forwarded-for'?: string | string[]
    'x-real-ip'?: string | string[]
    'cf-connecting-ip'?: string | string[]
    'x-vercel-forwarded-for'?: string | string[]
    [key: string]: string | string[] | undefined
  }
  socket?: {
    remoteAddress?: string
  }
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
  await logger.logRequest(req, { endpoint: '/api/ip-info' })

  if (req.method === 'GET') {
    try {
      // 获取用户真实IP
      const userIp = getUserIpFromRequest(req)

      if (!userIp) {
        await logger.warn('Unable to determine user IP', { headers: req.headers })
        return res.status(400).json({ error: '无法获取用户IP地址' })
      }

      await logger.info('Processing user IP info request', { userIp })

      // 获取IP位置信息
      const locationData = await getLocationByIp(userIp)

      // 转换为更详细的IP信息格式
      const ipInfo = convertLocationDataToIpInfo(locationData)

      const responseTime = Date.now() - startTime
      await logger.logResponse(200, responseTime, { userIp, success: true })

      return res.status(200).json(ipInfo)
    } catch (error) {
      const responseTime = Date.now() - startTime
      await logger.error(
        'Failed to get user IP info',
        error instanceof Error ? error : new Error(String(error)),
        {
          endpoint: '/api/ip-info',
          responseTime,
        }
      )

      await logger.logResponse(500, responseTime, { success: false })

      return res.status(500).json({
        error: '获取IP信息失败，请稍后再试',
        message: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  await logger.warn('Method not allowed', { method: req.method })
  const responseTime = Date.now() - startTime
  await logger.logResponse(405, responseTime, { success: false })

  return res.status(405).json({ error: 'Method not allowed' })
}
