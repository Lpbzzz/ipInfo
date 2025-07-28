import { convertLocationDataToIpInfo } from '../lib/ip-info-converter'
import { getLocationByIp, getUserIpFromRequest } from '../lib/ip-utils'

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      // 从请求头中获取用户的真实IP地址
      const userIp = getUserIpFromRequest(req)
      console.log(`获取到用户IP: ${userIp}`)

      // 使用用户的真实IP获取位置信息
      const locationData = await getLocationByIp(userIp)

      // 转换为更详细的IP信息格式
      const ipInfo = convertLocationDataToIpInfo(locationData)

      return res.status(200).json(ipInfo)
    } catch (error) {
      console.error('获取当前IP信息失败:', error)
      return res.status(500).json({
        error: '获取IP信息失败，请稍后再试',
        message: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
