import * as os from 'node:os'
import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { HttpProxyAgent } from 'http-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'

export interface LocationData {
  ip: string
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
}

@Injectable()
export class IpLocationService {
  private readonly logger = new Logger(IpLocationService.name)

  /**
   * 获取Axios配置，包括代理设置
   * @returns Axios配置对象
   */
  private getAxiosConfig(): {
    httpAgent?: HttpProxyAgent<string>
    httpsAgent?: HttpsProxyAgent<string>
  } {
    const config: { httpAgent?: HttpProxyAgent<string>; httpsAgent?: HttpsProxyAgent<string> } = {}

    // 检查是否有代理配置
    const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY
    const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY

    if (httpProxy) {
      this.logger.log(`使用HTTP代理: ${httpProxy}`)
      config.httpAgent = new HttpProxyAgent(httpProxy)
    }
    if (httpsProxy) {
      this.logger.log(`使用HTTPS代理: ${httpsProxy}`)
      config.httpsAgent = new HttpsProxyAgent(httpsProxy)
    }

    return config
  }

  /**
   * 根据IP地址获取位置信息
   * @param ip IP地址
   * @returns 位置数据
   */
  async getLocationByIp(ip: string): Promise<LocationData> {
    // 如果是本地IP地址，直接返回模拟数据
    if (this.isLocalIpAddress(ip)) {
      this.logger.log(`检测到本地IP地址: ${ip}，使用模拟数据`)
      return this.getMockLocationData(ip)
    }

    try {
      // 使用ipwhois.io API - 更快的响应时间（约90ms）
      const response = await axios.get(`http://ipwho.is/${ip}`, {
        ...this.getAxiosConfig(),
        timeout: 3000, // 设置3秒超时，比之前更短
      })
      const data = response.data

      if (data.success === false) {
        this.logger.error(`IP API返回失败: ${data.message || '未知错误'}`)
        // 如果API返回失败，使用备用方法
        return this.getFallbackIpLocation(ip)
      }

      return {
        ip: data.ip,
        country: data.country,
        region: data.region,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone?.id || '',
        isp: data.connection?.isp || '未知',
      }
    } catch (error) {
      this.logger.error(`获取IP ${ip} 的位置信息失败: ${error.message}`)
      // 如果发生错误，使用备用方法
      return this.getFallbackIpLocation(ip)
    }
  }

  /**
   * 获取当前IP的位置信息
   * @param ip 可选的IP地址
   * @returns 位置数据
   */
  async getCurrentIpLocation(ip?: string): Promise<LocationData> {
    try {
      if (ip) {
        // 如果提供了IP地址，直接查询该IP
        if (this.isLocalIpAddress(ip)) {
          this.logger.log(`检测到本地IP地址: ${ip}，使用模拟数据`)
          return this.getMockLocationData(ip)
        }
        return this.getLocationByIp(ip)
      }

      try {
        // 尝试获取当前IP地址 - 使用ipwhois.io API
        const ipResponse = await axios.get('http://ipwho.is/', {
          ...this.getAxiosConfig(),
          timeout: 3000, // 设置3秒超时
        })

        if (ipResponse.data.success === false) {
          this.logger.warn(`获取当前IP失败: ${ipResponse.data.message || '未知错误'}，尝试备用方法`)
          return this.getFallbackIpLocation()
        }

        // 检查是否为本地IP地址
        const currentIp = ipResponse.data.ip
        if (this.isLocalIpAddress(currentIp)) {
          this.logger.log(`检测到本地IP地址: ${currentIp}，使用模拟数据`)
          return this.getMockLocationData(currentIp)
        }

        return this.getLocationByIp(currentIp)
      } catch (error) {
        this.logger.warn(`通过ipwho.is获取IP失败: ${error.message}，尝试备用方法`)
        return this.getFallbackIpLocation()
      }
    } catch (error) {
      this.logger.error(`获取当前IP位置失败: ${error.message}`)
      // 返回模拟数据而不是抛出错误
      return this.getMockLocationData('127.0.0.1')
    }
  }

  /**
   * 检查是否为本地IP地址
   * @param ip IP地址
   * @returns 是否为本地IP
   */
  private isLocalIpAddress(ip: string): boolean {
    // 检查IPv4本地地址
    if (
      ip === '127.0.0.1' ||
      ip === 'localhost' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.')
    ) {
      return true
    }

    // 检查IPv6本地地址
    if (
      ip === '::1' ||
      ip === '::ffff:127.0.0.1' ||
      ip.startsWith('fe80:') ||
      ip.startsWith('fc00:') ||
      ip.startsWith('fd00:')
    ) {
      return true
    }

    return false
  }

  /**
   * 获取模拟的位置数据（用于本地开发环境）
   * @param ip IP地址
   * @returns 模拟的位置数据
   */
  private getMockLocationData(ip: string): LocationData {
    return {
      ip: ip,
      country: '中国',
      region: '北京市',
      city: '北京',
      latitude: 39.9042,
      longitude: 116.4074,
      timezone: process.env.TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone,
      isp: '本地开发环境',
    }
  }

  /**
   * 获取备用IP位置信息
   * @param ip 可选的IP地址
   * @returns 位置数据
   */
  private async getFallbackIpLocation(ip?: string): Promise<LocationData> {
    // 如果提供了IP地址
    const ipToUse = ip || this.getLocalIpAddress() || '127.0.0.1'

    try {
      // 尝试使用ipgeolocation.io作为备用API（响应时间约40ms）
      // 注意：需要替换为您自己的API密钥，可以在 https://ipgeolocation.io/ 免费注册获取
      // 免费计划每月允许30,000次请求
      const response = await axios.get(
        `https://api.ipgeolocation.io/ipgeo?apiKey=d4600b4efdef474b89633808b51e0a7a&ip=${ipToUse}`,
        {
          timeout: 3000, // 设置3秒超时
        }
      )

      if (response.data.message?.includes('error')) {
        throw new Error(response.data.message || '备用API返回错误')
      }

      return {
        ip: ipToUse,
        country: response.data.country_name,
        region: response.data.state_prov,
        city: response.data.city,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.time_zone?.name || '',
        isp: response.data.isp || '未知',
      }
    } catch (error) {
      this.logger.error(`备用API获取IP位置失败: ${error.message}`)

      try {
        // 如果第一个备用API失败，尝试使用第二个备用API
        const response = await axios.get(`https://ipapi.co/${ipToUse}/json/`, {
          timeout: 3000, // 设置3秒超时
        })

        if (response.data.error) {
          throw new Error(response.data.reason || '第二备用API返回错误')
        }

        return {
          ip: ipToUse,
          country: response.data.country_name,
          region: response.data.region,
          city: response.data.city,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
          isp: response.data.org || '未知',
        }
      } catch (secondError) {
        this.logger.error(`第二备用API获取IP位置失败: ${secondError.message}`)
        // 如果所有API都失败，返回模拟数据
        return this.getMockLocationData(ipToUse)
      }
    }
  }

  /**
   * 获取本地IP地址
   * @returns 本地IP地址
   */
  private getLocalIpAddress(): string | null {
    try {
      const interfaces = os.networkInterfaces()
      for (const name of Object.keys(interfaces)) {
        const networkInterface = interfaces[name]
        if (!networkInterface) {
          continue
        }

        for (const iface of networkInterface) {
          // 跳过内部IP和非IPv4地址
          if (iface.internal || iface.family !== 'IPv4') {
            continue
          }
          return iface.address
        }
      }
      return null
    } catch (error) {
      this.logger.error(`获取本地IP地址失败: ${error.message}`)
      return null
    }
  }
}
