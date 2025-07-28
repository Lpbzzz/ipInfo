import { BadRequestException, Controller, Get, Query, Req } from '@nestjs/common'
import type { Request as ExpressRequest } from 'express'
import { IpInfoService } from './ip-info.service'

// 扩展Express的Request类型，确保包含headers和socket属性
type Request = ExpressRequest & {
  headers: Record<string, string | string[] | undefined>
  socket: {
    remoteAddress?: string
  }
}

@Controller('ip-info')
export class IpInfoController {
  constructor(private readonly ipInfoService: IpInfoService) {}

  /**
   * 健康检查端点
   * @returns 健康状态信息
   */
  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * 获取请求者的IP信息
   * @param req 请求对象
   * @returns IP信息
   */
  @Get()
  async getMyIpInfo(@Req() req: Request) {
    try {
      // 从请求头中获取用户的真实IP地址
      const userIp = this.getUserIpFromRequest(req)
      console.log(`Backend获取到用户IP: ${userIp}`)

      // 如果是本地IP地址，通过外部服务获取用户的真实公网IP
      if (this.isLocalIpAddress(userIp)) {
        console.log('检测到本地IP，通过外部服务获取用户真实公网IP')
        // 在本地开发环境中，通过外部API获取用户的真实公网IP
        return this.ipInfoService.getCurrentIpInfo()
      }

      // 使用从请求中获取的用户IP获取IP信息
      return this.ipInfoService.getIpInfo(userIp)
    } catch (error) {
      throw new BadRequestException(error.message)
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
   * 从请求中获取用户的真实IP地址
   * @param request 请求对象
   * @returns 用户IP地址
   */
  private getUserIpFromRequest(request: Request): string {
    // 尝试从各种可能的头部获取真实IP
    const forwarded = request.headers['x-forwarded-for']
    const realIp = request.headers['x-real-ip']
    const cfConnectingIp = request.headers['cf-connecting-ip'] // Cloudflare
    const vercelForwardedFor = request.headers['x-vercel-forwarded-for'] // Vercel

    if (vercelForwardedFor && typeof vercelForwardedFor === 'string') {
      return vercelForwardedFor.split(',')[0].trim()
    }

    if (cfConnectingIp && typeof cfConnectingIp === 'string') {
      return cfConnectingIp
    }

    if (realIp && typeof realIp === 'string') {
      return realIp
    }

    if (forwarded && typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim()
    }

    // 如果都没有，使用连接的远程地址
    return request.socket.remoteAddress || '127.0.0.1'
  }

  /**
   * 获取指定IP的信息
   * @param ip 指定的IP地址
   * @returns IP信息
   */
  @Get('query')
  async getSpecificIpInfo(@Query('ip') ip: string) {
    if (!ip) {
      throw new BadRequestException('IP地址是必需的')
    }

    // 支持IPv4和IPv6地址格式验证
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

    if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip) && ip !== 'localhost') {
      throw new BadRequestException('无效的IP地址格式')
    }

    try {
      return await this.ipInfoService.getIpInfo(ip)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
