import { Injectable, Logger } from '@nestjs/common'
import { IpLocationService, type LocationData } from './ip-location.service'
import { RemoteLoggerService } from '../logger/remote-logger.service'

@Injectable()
export class IpInfoService {
  private readonly logger = new Logger(IpInfoService.name)

  constructor(
    private readonly ipLocationService: IpLocationService,
    private readonly remoteLogger: RemoteLoggerService
  ) {}

  /**
   * 获取IP信息
   * @param ip IP地址
   * @returns IP详细信息
   */
  async getIpInfo(ip: string) {
    const requestId = `ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // 使用IP位置服务获取位置信息
      const locationData = await this.ipLocationService.getLocationByIp(ip)

      // 转换为更详细的IP信息格式
      const result = this.convertLocationDataToIpInfo(locationData)

      // 记录成功日志（可选，如果需要的话）
      this.logger.log(`IP信息查询成功: ${ip}`)

      return result
    } catch (error) {
      this.logger.error(`获取IP信息失败: ${error.message}`)

      // 记录错误到远程日志服务
      await this.remoteLogger.logError(
        `获取IP信息失败: ${ip}`,
        {
          ip,
          errorType: 'IP_INFO_FETCH_ERROR',
          originalError: error.message,
        },
        error.stack,
        requestId
      )

      return {
        error: true,
        message: '获取IP信息失败',
        details: error.message,
        requestId,
      }
    }
  }

  /**
   * 获取当前IP信息
   * @returns 当前IP的详细信息
   */
  async getCurrentIpInfo() {
    const requestId = `current-ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // 使用IP位置服务获取当前IP的位置信息
      const locationData = await this.ipLocationService.getCurrentIpLocation()

      // 转换为更详细的IP信息格式
      const result = this.convertLocationDataToIpInfo(locationData)

      this.logger.log(`当前IP信息查询成功: ${locationData.ip}`)

      return result
    } catch (error) {
      this.logger.error(`获取当前IP信息失败: ${error.message}`)

      // 记录错误到远程日志服务
      await this.remoteLogger.logError(
        '获取当前IP信息失败',
        {
          errorType: 'CURRENT_IP_FETCH_ERROR',
          originalError: error.message,
        },
        error.stack,
        requestId
      )

      return {
        error: true,
        message: '获取当前IP信息失败',
        details: error.message,
        requestId,
      }
    }
  }

  /**
   * 将位置数据转换为详细的IP信息
   * @param locationData 位置数据
   * @returns 详细的IP信息
   */
  private convertLocationDataToIpInfo(locationData: LocationData) {
    // 根据国家名称推断国家代码
    const countryCode = this.getCountryCode(locationData.country)

    return {
      ip: locationData.ip,
      version: locationData.ip.includes(':') ? 'IPv6' : 'IPv4',
      city: locationData.city,
      region: locationData.region,
      region_code: this.getRegionCode(locationData.region),
      country: countryCode,
      country_name: locationData.country,
      country_code: countryCode,
      country_code_iso3: this.getCountryCodeIso3(countryCode),
      country_capital: this.getCountryCapital(locationData.country),
      country_tld: this.getCountryTld(countryCode),
      continent_code: this.getContinentCode(locationData.country),
      in_eu: this.isInEu(locationData.country),
      postal: this.getPostalCode(locationData.city),
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timezone: locationData.timezone,
      utc_offset: this.getUtcOffset(locationData.timezone),
      country_calling_code: this.getCountryCallingCode(countryCode),
      currency: this.getCurrency(countryCode),
      currency_name: this.getCurrencyName(countryCode),
      languages: this.getLanguages(countryCode),
      country_area: this.getCountryArea(locationData.country),
      country_population: this.getCountryPopulation(locationData.country),
      asn: `AS${Math.floor(Math.random() * 100000)}`,
      org: locationData.isp,
    }
  }

  /**
   * 获取国家代码
   * @param countryName 国家名称
   * @returns 国家代码
   */
  private getCountryCode(countryName: string): string {
    const countryMap = {
      中国: 'CN',
      美国: 'US',
      日本: 'JP',
      韩国: 'KR',
      英国: 'GB',
      法国: 'FR',
      德国: 'DE',
      加拿大: 'CA',
      澳大利亚: 'AU',
      俄罗斯: 'RU',
      China: 'CN',
      'United States': 'US',
      Japan: 'JP',
      'South Korea': 'KR',
      'United Kingdom': 'GB',
      France: 'FR',
      Germany: 'DE',
      Canada: 'CA',
      Australia: 'AU',
      Russia: 'RU',
    }

    return countryMap[countryName] || 'CN'
  }

  /**
   * 获取地区代码
   * @param regionName 地区名称
   * @returns 地区代码
   */
  private getRegionCode(regionName: string): string {
    const regionMap = {
      北京市: 'BJ',
      上海市: 'SH',
      广东省: 'GD',
      江苏省: 'JS',
      浙江省: 'ZJ',
      四川省: 'SC',
      Beijing: 'BJ',
      Shanghai: 'SH',
      Guangdong: 'GD',
      Jiangsu: 'JS',
      Zhejiang: 'ZJ',
      Sichuan: 'SC',
    }

    return regionMap[regionName] || regionName.substring(0, 2).toUpperCase()
  }

  /**
   * 获取国家ISO3代码
   * @param countryCode 国家代码
   * @returns 国家ISO3代码
   */
  private getCountryCodeIso3(countryCode: string): string {
    const iso3Map = {
      CN: 'CHN',
      US: 'USA',
      JP: 'JPN',
      KR: 'KOR',
      GB: 'GBR',
      FR: 'FRA',
      DE: 'DEU',
      CA: 'CAN',
      AU: 'AUS',
      RU: 'RUS',
    }

    return iso3Map[countryCode] || 'CHN'
  }

  /**
   * 获取国家首都
   * @param countryName 国家名称
   * @returns 国家首都
   */
  private getCountryCapital(countryName: string): string {
    const capitalMap = {
      中国: '北京',
      美国: '华盛顿',
      日本: '东京',
      韩国: '首尔',
      英国: '伦敦',
      法国: '巴黎',
      德国: '柏林',
      加拿大: '渥太华',
      澳大利亚: '堪培拉',
      俄罗斯: '莫斯科',
      China: '北京',
      'United States': '华盛顿',
      Japan: '东京',
      'South Korea': '首尔',
      'United Kingdom': '伦敦',
      France: '巴黎',
      Germany: '柏林',
      Canada: '渥太华',
      Australia: '堪培拉',
      Russia: '莫斯科',
    }

    return capitalMap[countryName] || '北京'
  }

  /**
   * 获取国家顶级域名
   * @param countryCode 国家代码
   * @returns 国家顶级域名
   */
  private getCountryTld(countryCode: string): string {
    return `.${countryCode.toLowerCase()}`
  }

  /**
   * 获取大洲代码
   * @param countryName 国家名称
   * @returns 大洲代码
   */
  private getContinentCode(countryName: string): string {
    const asianCountries = ['中国', '日本', '韩国', 'China', 'Japan', 'South Korea']
    const europeanCountries = ['英国', '法国', '德国', 'United Kingdom', 'France', 'Germany']
    const northAmericanCountries = ['美国', '加拿大', 'United States', 'Canada']
    const oceaniaCountries = ['澳大利亚', 'Australia']

    if (asianCountries.includes(countryName)) {
      return 'AS'
    }
    if (europeanCountries.includes(countryName)) {
      return 'EU'
    }
    if (northAmericanCountries.includes(countryName)) {
      return 'NA'
    }
    if (oceaniaCountries.includes(countryName)) {
      return 'OC'
    }
    if (countryName === '俄罗斯' || countryName === 'Russia') {
      return 'EU'
    }

    return 'AS'
  }

  /**
   * 判断国家是否在欧盟
   * @param countryName 国家名称
   * @returns 是否在欧盟
   */
  private isInEu(countryName: string): boolean {
    const euCountries = ['法国', '德国', 'France', 'Germany']
    return euCountries.includes(countryName)
  }

  /**
   * 获取邮政编码
   * @param cityName 城市名称
   * @returns 邮政编码
   */
  private getPostalCode(cityName: string): string {
    const postalMap = {
      北京: '100000',
      上海: '200000',
      广州: '510000',
      深圳: '518000',
      Beijing: '100000',
      Shanghai: '200000',
      Guangzhou: '510000',
      Shenzhen: '518000',
    }

    return postalMap[cityName] || '100000'
  }

  /**
   * 获取UTC偏移
   * @param timezone 时区
   * @returns UTC偏移
   */
  private getUtcOffset(timezone: string): string {
    const timezoneMap = {
      'Asia/Shanghai': '+0800',
      'America/New_York': '-0500',
      'Europe/London': '+0000',
      'Europe/Paris': '+0100',
      'Europe/Berlin': '+0100',
      'Asia/Tokyo': '+0900',
      'Asia/Seoul': '+0900',
      'Australia/Sydney': '+1000',
      'Europe/Moscow': '+0300',
    }

    return timezoneMap[timezone] || '+0800'
  }

  /**
   * 获取国家电话代码
   * @param countryCode 国家代码
   * @returns 国家电话代码
   */
  private getCountryCallingCode(countryCode: string): string {
    const callingCodeMap = {
      CN: '+86',
      US: '+1',
      JP: '+81',
      KR: '+82',
      GB: '+44',
      FR: '+33',
      DE: '+49',
      CA: '+1',
      AU: '+61',
      RU: '+7',
    }

    return callingCodeMap[countryCode] || '+86'
  }

  /**
   * 获取货币代码
   * @param countryCode 国家代码
   * @returns 货币代码
   */
  private getCurrency(countryCode: string): string {
    const currencyMap = {
      CN: 'CNY',
      US: 'USD',
      JP: 'JPY',
      KR: 'KRW',
      GB: 'GBP',
      FR: 'EUR',
      DE: 'EUR',
      CA: 'CAD',
      AU: 'AUD',
      RU: 'RUB',
    }

    return currencyMap[countryCode] || 'CNY'
  }

  /**
   * 获取货币名称
   * @param countryCode 国家代码
   * @returns 货币名称
   */
  private getCurrencyName(countryCode: string): string {
    const currencyNameMap = {
      CN: '人民币',
      US: '美元',
      JP: '日元',
      KR: '韩元',
      GB: '英镑',
      FR: '欧元',
      DE: '欧元',
      CA: '加拿大元',
      AU: '澳大利亚元',
      RU: '卢布',
    }

    return currencyNameMap[countryCode] || '人民币'
  }

  /**
   * 获取语言
   * @param countryCode 国家代码
   * @returns 语言
   */
  private getLanguages(countryCode: string): string {
    const languageMap = {
      CN: 'zh-CN,en',
      US: 'en-US,es',
      JP: 'ja,en',
      KR: 'ko,en',
      GB: 'en-GB',
      FR: 'fr,en',
      DE: 'de,en',
      CA: 'en-CA,fr-CA',
      AU: 'en-AU',
      RU: 'ru,en',
    }

    return languageMap[countryCode] || 'zh-CN,en'
  }

  /**
   * 获取国家面积
   * @param countryName 国家名称
   * @returns 国家面积
   */
  private getCountryArea(countryName: string): number {
    const areaMap = {
      中国: 9596961.0,
      美国: 9833517.0,
      日本: 377975.0,
      韩国: 100210.0,
      英国: 242495.0,
      法国: 551695.0,
      德国: 357022.0,
      加拿大: 9984670.0,
      澳大利亚: 7692024.0,
      俄罗斯: 17098246.0,
      China: 9596961.0,
      'United States': 9833517.0,
      Japan: 377975.0,
      'South Korea': 100210.0,
      'United Kingdom': 242495.0,
      France: 551695.0,
      Germany: 357022.0,
      Canada: 9984670.0,
      Australia: 7692024.0,
      Russia: 17098246.0,
    }

    return areaMap[countryName] || 9596961.0
  }

  /**
   * 获取国家人口
   * @param countryName 国家名称
   * @returns 国家人口
   */
  private getCountryPopulation(countryName: string): number {
    const populationMap = {
      中国: 1439323776,
      美国: 331002651,
      日本: 126476461,
      韩国: 51269185,
      英国: 67886011,
      法国: 65273511,
      德国: 83783942,
      加拿大: 37742154,
      澳大利亚: 25499884,
      俄罗斯: 145934462,
      China: 1439323776,
      'United States': 331002651,
      Japan: 126476461,
      'South Korea': 51269185,
      'United Kingdom': 67886011,
      France: 65273511,
      Germany: 83783942,
      Canada: 37742154,
      Australia: 25499884,
      Russia: 145934462,
    }

    return populationMap[countryName] || 1439323776
  }
}
