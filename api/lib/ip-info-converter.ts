import type { LocationData } from './ip-utils'

/**
 * 将位置数据转换为详细的IP信息
 */
export function convertLocationDataToIpInfo(locationData: LocationData) {
  // 根据国家名称推断国家代码
  const countryCode = getCountryCode(locationData.country)

  return {
    ip: locationData.ip,
    version: 'IPv4',
    city: locationData.city || '未知',
    region: locationData.region || '未知',
    region_code: getRegionCode(locationData.region, countryCode),
    country: countryCode,
    country_name: locationData.country || '未知',
    country_code: countryCode,
    country_code_iso3: getCountryCodeIso3(countryCode),
    country_capital: getCountryCapital(locationData.country),
    country_tld: getCountryTld(countryCode),
    continent_code: getContinentCode(countryCode),
    in_eu: isInEu(locationData.country),
    postal: '100000', // 默认邮编
    latitude: locationData.latitude || 0,
    longitude: locationData.longitude || 0,
    timezone: locationData.timezone || 'UTC',
    utc_offset: getUtcOffset(locationData.timezone),
    country_calling_code: getCountryCallingCode(countryCode),
    currency: getCurrency(countryCode),
    currency_name: getCurrencyName(countryCode),
    languages: getLanguages(countryCode),
    country_area: getCountryArea(locationData.country),
    country_population: getCountryPopulation(locationData.country),
    asn: 'AS0000',
    org: locationData.isp || '未知',
    network: '0.0.0.0/0',
  }
}

/**
 * 根据国家名称获取国家代码
 */
function getCountryCode(countryName: string): string {
  const countryMap: { [key: string]: string } = {
    中国: 'CN',
    China: 'CN',
    美国: 'US',
    'United States': 'US',
    日本: 'JP',
    Japan: 'JP',
    英国: 'GB',
    'United Kingdom': 'GB',
    德国: 'DE',
    Germany: 'DE',
    法国: 'FR',
    France: 'FR',
    加拿大: 'CA',
    Canada: 'CA',
    澳大利亚: 'AU',
    Australia: 'AU',
    韩国: 'KR',
    'South Korea': 'KR',
    印度: 'IN',
    India: 'IN',
    俄罗斯: 'RU',
    Russia: 'RU',
    巴西: 'BR',
    Brazil: 'BR',
  }

  return countryMap[countryName] || 'XX'
}

/**
 * 获取地区代码
 */
function getRegionCode(regionName: string, countryCode: string): string {
  if (countryCode === 'CN') {
    const regionMap: { [key: string]: string } = {
      北京: 'BJ',
      北京市: 'BJ',
      Beijing: 'BJ',
      上海: 'SH',
      上海市: 'SH',
      Shanghai: 'SH',
      广东: 'GD',
      广东省: 'GD',
      Guangdong: 'GD',
      浙江: 'ZJ',
      浙江省: 'ZJ',
      Zhejiang: 'ZJ',
    }
    return regionMap[regionName] || 'XX'
  }

  if (countryCode === 'US') {
    const stateMap: { [key: string]: string } = {
      California: 'CA',
      'New York': 'NY',
      Texas: 'TX',
      Florida: 'FL',
      Illinois: 'IL',
    }
    return stateMap[regionName] || 'XX'
  }

  return 'XX'
}

/**
 * 获取国家ISO3代码
 */
function getCountryCodeIso3(countryCode: string): string {
  const iso3Map: { [key: string]: string } = {
    CN: 'CHN',
    US: 'USA',
    JP: 'JPN',
    GB: 'GBR',
    DE: 'DEU',
    FR: 'FRA',
    CA: 'CAN',
    AU: 'AUS',
    KR: 'KOR',
    IN: 'IND',
    RU: 'RUS',
    BR: 'BRA',
  }

  return iso3Map[countryCode] || 'XXX'
}

/**
 * 获取国家首都
 */
function getCountryCapital(countryName: string): string {
  const capitalMap: { [key: string]: string } = {
    中国: '北京',
    China: '北京',
    美国: '华盛顿',
    'United States': '华盛顿',
    日本: '东京',
    Japan: '东京',
    英国: '伦敦',
    'United Kingdom': '伦敦',
    德国: '柏林',
    Germany: '柏林',
    法国: '巴黎',
    France: '巴黎',
    加拿大: '渥太华',
    Canada: '渥太华',
    澳大利亚: '堪培拉',
    Australia: '堪培拉',
  }

  return capitalMap[countryName] || '未知'
}

/**
 * 获取国家顶级域名
 */
function getCountryTld(countryCode: string): string {
  const tldMap: { [key: string]: string } = {
    CN: '.cn',
    US: '.us',
    JP: '.jp',
    GB: '.uk',
    DE: '.de',
    FR: '.fr',
    CA: '.ca',
    AU: '.au',
    KR: '.kr',
    IN: '.in',
    RU: '.ru',
    BR: '.br',
  }

  return tldMap[countryCode] || '.com'
}

/**
 * 获取大洲代码
 */
function getContinentCode(countryCode: string): string {
  const continentMap: { [key: string]: string } = {
    CN: 'AS', // 亚洲
    JP: 'AS',
    KR: 'AS',
    IN: 'AS',
    US: 'NA', // 北美洲
    CA: 'NA',
    GB: 'EU', // 欧洲
    DE: 'EU',
    FR: 'EU',
    RU: 'EU',
    AU: 'OC', // 大洋洲
    BR: 'SA', // 南美洲
  }

  return continentMap[countryCode] || 'XX'
}

/**
 * 判断国家是否在欧盟
 */
function isInEu(countryName: string): boolean {
  const euCountries = [
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Poland',
    'Romania',
    'Netherlands',
    'Belgium',
    'Czech Republic',
    'Greece',
    'Portugal',
    'Sweden',
    'Hungary',
    'Austria',
    'Belarus',
    'Bulgaria',
    'Serbia',
    'Switzerland',
    'Slovakia',
    'Denmark',
    'Finland',
    'Norway',
    'Ireland',
    'Croatia',
    'Bosnia and Herzegovina',
    'Albania',
    'Lithuania',
    'Slovenia',
    'Latvia',
    'Estonia',
    'Macedonia',
    'Moldova',
    'Luxembourg',
    'Malta',
    'Iceland',
    'Montenegro',
    'Cyprus',
  ]

  return euCountries.includes(countryName)
}

/**
 * 获取UTC偏移量
 */
function getUtcOffset(timezone: string): string {
  const offsetMap: { [key: string]: string } = {
    'Asia/Shanghai': '+0800',
    'Asia/Beijing': '+0800',
    'America/New_York': '-0500',
    'America/Los_Angeles': '-0800',
    'Europe/London': '+0000',
    'Europe/Paris': '+0100',
    'Asia/Tokyo': '+0900',
  }

  return offsetMap[timezone] || '+0000'
}

/**
 * 获取国家电话代码
 */
function getCountryCallingCode(countryCode: string): string {
  const callingCodeMap: { [key: string]: string } = {
    CN: '+86',
    US: '+1',
    JP: '+81',
    GB: '+44',
    DE: '+49',
    FR: '+33',
    CA: '+1',
    AU: '+61',
    KR: '+82',
    IN: '+91',
    RU: '+7',
    BR: '+55',
  }

  return callingCodeMap[countryCode] || '+000'
}

/**
 * 获取货币代码
 */
function getCurrency(countryCode: string): string {
  const currencyMap: { [key: string]: string } = {
    CN: 'CNY',
    US: 'USD',
    JP: 'JPY',
    GB: 'GBP',
    DE: 'EUR',
    FR: 'EUR',
    CA: 'CAD',
    AU: 'AUD',
    KR: 'KRW',
    IN: 'INR',
    RU: 'RUB',
    BR: 'BRL',
  }

  return currencyMap[countryCode] || 'USD'
}

/**
 * 获取货币名称
 */
function getCurrencyName(countryCode: string): string {
  const currencyNameMap: { [key: string]: string } = {
    CN: '人民币',
    US: '美元',
    JP: '日元',
    GB: '英镑',
    DE: '欧元',
    FR: '欧元',
    CA: '加元',
    AU: '澳元',
    KR: '韩元',
    IN: '卢比',
    RU: '卢布',
    BR: '雷亚尔',
  }

  return currencyNameMap[countryCode] || '美元'
}

/**
 * 获取语言
 */
function getLanguages(countryCode: string): string {
  const languageMap: { [key: string]: string } = {
    CN: 'zh-CN,en',
    US: 'en-US,es',
    JP: 'ja,en',
    GB: 'en-GB',
    DE: 'de,en',
    FR: 'fr,en',
    CA: 'en,fr',
    AU: 'en-AU',
    KR: 'ko,en',
    IN: 'hi,en',
    RU: 'ru,en',
    BR: 'pt-BR,en',
  }

  return languageMap[countryCode] || 'en'
}

/**
 * 获取国家面积
 */
function getCountryArea(countryName: string): number {
  const areaMap: { [key: string]: number } = {
    中国: 9596961,
    China: 9596961,
    美国: 9833517,
    'United States': 9833517,
    日本: 377975,
    Japan: 377975,
    英国: 242495,
    'United Kingdom': 242495,
    德国: 357114,
    Germany: 357114,
    法国: 643801,
    France: 643801,
    加拿大: 9984670,
    Canada: 9984670,
    澳大利亚: 7692024,
    Australia: 7692024,
  }

  return areaMap[countryName] || 0
}

/**
 * 获取国家人口
 */
function getCountryPopulation(countryName: string): number {
  const populationMap: { [key: string]: number } = {
    中国: 1439323776,
    China: 1439323776,
    美国: 331002651,
    'United States': 331002651,
    日本: 126476461,
    Japan: 126476461,
    英国: 67886011,
    'United Kingdom': 67886011,
    德国: 83783942,
    Germany: 83783942,
    法国: 65273511,
    France: 65273511,
    加拿大: 37742154,
    Canada: 37742154,
    澳大利亚: 25499884,
    Australia: 25499884,
  }

  return populationMap[countryName] || 0
}
