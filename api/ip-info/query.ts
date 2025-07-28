import { convertLocationDataToIpInfo } from '../lib/ip-info-converter'
import { getLocationByIp } from '../lib/ip-utils'
import { createLogger } from '../lib/logger'
import type { RequestLike } from '../lib/logger'

/**
 * Vercel API 请求对象类型
 */
interface VercelRequest extends RequestLike {
  method?: string
  query: {
    [key: string]: string | string[] | undefined
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
  await logger.logRequest(req, { endpoint: '/api/ip-info/query' })

  if (req.method === 'GET') {
    try {
      const { ip: ipParam } = req.query

      if (!ipParam) {
        await logger.warn('Missing IP parameter', { query: req.query })
        return res.status(400).json({ error: 'IP地址参数不能为空' })
      }

      // 确保 ip 是字符串类型
      const ip = Array.isArray(ipParam) ? ipParam[0] : ipParam

      if (!ip) {
        await logger.warn('Empty IP parameter', { ipParam })
        return res.status(400).json({ error: 'IP地址参数不能为空' })
      }

      // 验证IP地址格式
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipRegex.test(ip)) {
        await logger.warn('Invalid IP format', { ip })
        return res.status(400).json({ error: '无效的IP地址格式' })
      }

      await logger.info('Processing IP query', { ip })

      // 获取IP位置信息
      const locationData = await getLocationByIp(ip)

      // 转换为更详细的IP信息格式
      const ipInfo = convertLocationDataToIpInfo(locationData)

      const responseTime = Date.now() - startTime
      await logger.logResponse(200, responseTime, { ip, success: true })

      return res.status(200).json(ipInfo)
    } catch (error) {
      const responseTime = Date.now() - startTime
      await logger.error(
        'Failed to query IP info',
        error instanceof Error ? error : new Error(String(error)),
        {
          endpoint: '/api/ip-info/query',
          responseTime,
        }
      )

      await logger.logResponse(500, responseTime, { success: false })

      return res.status(500).json({
        error: '查询IP信息失败，请稍后再试',
        message: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  await logger.warn('Method not allowed', { method: req.method })
  const responseTime = Date.now() - startTime
  await logger.logResponse(405, responseTime, { success: false })

  return res.status(405).json({ error: 'Method not allowed' })
}
