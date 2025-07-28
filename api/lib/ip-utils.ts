// IP位置查询工具函数
export interface LocationData {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
}

/**
 * 检查是否为本地IP地址
 */
export function isLocalIpAddress(ip: string): boolean {
  // 检查IPv4本地地址
  if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return true;
  }
  
  // 检查IPv6本地地址
  if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
    return true;
  }
  
  return false;
}

/**
 * 获取模拟的位置数据（用于本地开发环境）
 */
export function getMockLocationData(ip: string): LocationData {
  return {
    ip: ip,
    country: '中国',
    region: '北京市',
    city: '北京',
    latitude: 39.9042,
    longitude: 116.4074,
    timezone: 'Asia/Shanghai',
    isp: '本地开发环境'
  };
}

/**
 * 根据IP地址获取位置信息
 */
export async function getLocationByIp(ip: string): Promise<LocationData> {
  // 如果是本地IP地址，直接返回模拟数据
  if (isLocalIpAddress(ip)) {
    console.log(`检测到本地IP地址: ${ip}，使用模拟数据`);
    return getMockLocationData(ip);
  }
  
  try {
    // 使用ipwhois.io API
    const response = await fetch(`http://ipwho.is/${ip}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success === false) {
      console.error(`IP API返回失败: ${data.message || '未知错误'}`);
      // 如果API返回失败，使用备用方法
      return getFallbackIpLocation(ip);
    }
    
    return {
      ip: data.ip,
      country: data.country,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone?.id || '',
      isp: data.connection?.isp || '未知'
    };
  } catch (error) {
    console.error(`获取IP ${ip} 的位置信息失败:`, error);
    // 如果发生错误，使用备用方法
    return getFallbackIpLocation(ip);
  }
}

/**
 * 获取备用IP位置信息
 */
async function getFallbackIpLocation(ip: string): Promise<LocationData> {
  try {
    // 使用ipapi.co作为备用API
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || '备用API返回错误');
    }
    
    return {
      ip: ip,
      country: data.country_name || '未知',
      region: data.region || '未知',
      city: data.city || '未知',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || '',
      isp: data.org || '未知'
    };
  } catch (error) {
    console.error(`备用API获取IP ${ip} 的位置信息失败:`, error);
    // 最后的备用方案：返回模拟数据
    return getMockLocationData(ip);
  }
}

/**
 * 获取当前IP的位置信息
 */
export async function getCurrentIpLocation(): Promise<LocationData> {
  try {
    // 尝试获取当前IP地址
    const ipResponse = await fetch('http://ipwho.is/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!ipResponse.ok) {
      throw new Error(`HTTP error! status: ${ipResponse.status}`);
    }
    
    const ipData = await ipResponse.json();
    
    if (ipData.success === false) {
      console.warn(`获取当前IP失败: ${ipData.message || '未知错误'}，尝试备用方法`);
      return getFallbackIpLocation('');
    }
    
    // 检查是否为本地IP地址
    const currentIp = ipData.ip;
    if (isLocalIpAddress(currentIp)) {
      console.log(`检测到本地IP地址: ${currentIp}，使用模拟数据`);
      return getMockLocationData(currentIp);
    }
    
    return getLocationByIp(currentIp);
  } catch (error) {
    console.error(`获取当前IP位置失败:`, error);
    // 返回模拟数据而不是抛出错误
    return getMockLocationData('127.0.0.1');
  }
}

/**
 * 从请求中获取用户的真实IP地址
 */
export function getUserIpFromRequest(req: any): string {
  // 尝试从各种可能的头部获取真实IP
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
  const vercelForwardedFor = req.headers['x-vercel-forwarded-for']; // Vercel
  
  if (vercelForwardedFor && typeof vercelForwardedFor === 'string') {
    return vercelForwardedFor.split(',')[0].trim();
  }
  
  if (cfConnectingIp && typeof cfConnectingIp === 'string') {
    return cfConnectingIp;
  }
  
  if (realIp && typeof realIp === 'string') {
    return realIp;
  }
  
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  // 如果都没有，使用连接的远程地址
  return req.socket?.remoteAddress || '127.0.0.1';
}