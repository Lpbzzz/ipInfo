import { convertLocationDataToIpInfo } from '../lib/ip-info-converter'
import { getLocationByIp } from '../lib/ip-utils'

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { ip } = req.query

      if (!ip) {
        return res.status(400).json({ error: 'IP地址参数不能为空' })
      }

      // 验证IP地址格式
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipRegex.test(ip)) {
        return res.status(400).json({ error: '无效的IP地址格式' })
      }

      // 获取IP位置信息
      const locationData = await getLocationByIp(ip)

      // 转换为更详细的IP信息格式
      const ipInfo = convertLocationDataToIpInfo(locationData)

      return res.status(200).json(ipInfo)
    } catch (error) {
      console.error('查询IP信息失败:', error)
      return res.status(500).json({
        error: '查询IP信息失败，请稍后再试',
        message: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
