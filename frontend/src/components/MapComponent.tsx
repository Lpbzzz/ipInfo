import { useEffect, useRef } from 'react'

// 声明高德地图的全局类型
declare global {
  interface Window {
    AMap: any
    AMapLoader: {
      load: (config: {
        key: string
        version: string
        plugins?: string[]
      }) => Promise<any>
    }
  }
}

interface MapComponentProps {
  latitude: number
  longitude: number
  city?: string
  country_name?: string
  region?: string
  ip?: string
}

/**
 * WGS84坐标系转GCJ-02坐标系（GPS坐标转火星坐标）
 * 用于解决国外IP地理位置API返回的WGS84坐标在高德地图上的偏移问题
 */
const transformWGS84ToGCJ02 = (lng: number, lat: number): [number, number] => {
  const a = 6378245.0 // 长半轴
  const ee = 0.006693421622965943 // 偏心率平方

  let dlat = transformLat(lng - 105.0, lat - 35.0)
  let dlng = transformLng(lng - 105.0, lat - 35.0)
  const radlat = (lat / 180.0) * Math.PI
  let magic = Math.sin(radlat)
  magic = 1 - ee * magic * magic
  const sqrtmagic = Math.sqrt(magic)
  dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * Math.PI)
  dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * Math.PI)
  const mglat = lat + dlat
  const mglng = lng + dlng
  return [mglng, mglat]
}

const transformLat = (lng: number, lat: number): number => {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += ((20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin((lat / 3.0) * Math.PI)) * 2.0) / 3.0
  ret += ((160.0 * Math.sin((lat / 12.0) * Math.PI) + 320 * Math.sin((lat * Math.PI) / 30.0)) * 2.0) / 3.0
  return ret
}

const transformLng = (lng: number, lat: number): number => {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += ((20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin((lng / 3.0) * Math.PI)) * 2.0) / 3.0
  ret += ((150.0 * Math.sin((lng / 12.0) * Math.PI) + 300.0 * Math.sin((lng / 30.0) * Math.PI)) * 2.0) / 3.0
  return ret
}

/**
 * 判断坐标是否在中国境内（需要进行坐标转换）
 */
const isInChina = (lng: number, lat: number): boolean => {
  return lng >= 72.004 && lng <= 137.8347 && lat >= 0.8293 && lat <= 55.8271
}

/**
 * 地图组件，使用高德地图显示IP位置
 * @param latitude 纬度
 * @param longitude 经度
 * @param city 城市
 * @param country_name 国家名称
 * @param region 地区
 * @param ip IP地址
 */
const MapComponent = ({
  latitude,
  longitude,
  city,
  country_name,
  region,
  ip,
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // 动态加载高德地图API - 使用官方 AMapLoader
     const loadAMapScript = () => {
       return new Promise((resolve, reject) => {
         if (window.AMap) {
           resolve(window.AMap)
           return
         }

         // 使用环境变量中的API密钥，如果没有则使用开发环境的临时密钥
         const apiKey = import.meta.env.VITE_AMAP_API_KEY || '7a04506d60c3ba5f5d2a0e60d1012b18'
         
         console.log('正在加载高德地图 API...')
         
         // 首先加载 AMapLoader
         const loaderScript = document.createElement('script')
         loaderScript.src = 'https://webapi.amap.com/loader.js'
         loaderScript.async = true
         loaderScript.onload = () => {
           console.log('AMapLoader 加载成功，开始初始化...')
           
           // 使用 AMapLoader 加载地图
           window.AMapLoader.load({
             key: apiKey,
             version: '2.0',
             plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.InfoWindow', 'AMap.Marker', 'AMap.Circle', 'AMap.Icon']
           }).then((AMap: any) => {
             console.log('高德地图 API 初始化成功')
             window.AMap = AMap
             resolve(AMap)
           }).catch((error: any) => {
             console.error('高德地图 API 初始化失败:', error)
             reject(new Error(`高德地图 API 初始化失败: ${error.message || error}`))
           })
         }
         loaderScript.onerror = (error) => {
           console.error('AMapLoader 加载失败:', error)
           reject(new Error('AMapLoader 脚本加载失败'))
         }
         document.head.appendChild(loaderScript)
       })
     }

    const initMap = async () => {
      try {
        console.log('开始初始化地图...')
        await loadAMapScript()

        // 确保 AMap 对象存在且包含必要的构造函数
        if (!window.AMap || !window.AMap.Map) {
          throw new Error('高德地图 API 未正确加载，AMap.Map 不可用')
        }

        console.log('AMap 对象可用，创建地图实例...')

        // 坐标转换：将WGS84坐标转换为GCJ-02坐标（仅对中国境内坐标进行转换）
        let mapLng = longitude
        let mapLat = latitude
        
        if (isInChina(longitude, latitude)) {
          const [transformedLng, transformedLat] = transformWGS84ToGCJ02(longitude, latitude)
          mapLng = transformedLng
          mapLat = transformedLat
          console.log(`坐标转换: WGS84(${longitude}, ${latitude}) -> GCJ-02(${mapLng}, ${mapLat})`)
        } else {
          console.log(`坐标位于中国境外，无需转换: (${longitude}, ${latitude})`)
        }

        // 如果地图实例已存在，则销毁它
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy()
        }

        // 创建地图实例
        const map = new window.AMap.Map(mapRef.current, {
          zoom: 13,
          center: [mapLng, mapLat], // 使用转换后的坐标
          mapStyle: 'amap://styles/normal', // 标准地图样式
          viewMode: '2D',
          lang: 'zh_cn',
          features: ['bg', 'road', 'building', 'point'],
        })

        console.log('地图实例创建成功')
        mapInstanceRef.current = map

        // 创建信息窗口内容
        const infoContent = `
          <div style="padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="font-size: 16px; font-weight: bold; color: #1890ff; margin-bottom: 8px; text-align: center;">
              ${city || '未知城市'}, ${region || '未知地区'}
            </div>
            <div style="font-size: 14px; color: #333; margin-bottom: 6px; text-align: center;">
              ${country_name || '未知国家'}
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 6px;">
              <strong>IP:</strong> ${ip || '未知'}
            </div>
            <div style="font-size: 13px; color: #666; display: flex; justify-content: space-between;">
              <span><strong>经度:</strong> ${longitude.toFixed(4)}</span>
              <span><strong>纬度:</strong> ${latitude.toFixed(4)}</span>
            </div>
          </div>
        `

        // 创建标记点
        const marker = new window.AMap.Marker({
          position: [mapLng, mapLat], // 使用转换后的坐标
          title: `${city || '未知城市'} - ${ip || '未知IP'}`,
          icon: new window.AMap.Icon({
             size: new window.AMap.Size(32, 32),
             image: `data:image/svg+xml;base64,${btoa(`
               <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                 <circle cx="16" cy="16" r="8" fill="#1890ff" stroke="#fff" stroke-width="2"/>
                 <circle cx="16" cy="16" r="4" fill="#fff"/>
               </svg>
             `)}`,
             imageSize: new window.AMap.Size(32, 32),
           }),
        })

        // 添加标记到地图
        map.add(marker)

        // 创建信息窗口
        const infoWindow = new window.AMap.InfoWindow({
          content: infoContent,
          offset: new window.AMap.Pixel(0, -30),
        })

        // 点击标记显示信息窗口
        marker.on('click', () => {
          infoWindow.open(map, marker.getPosition())
        })

        // 默认打开信息窗口
        infoWindow.open(map, marker.getPosition())

        // 添加圆形覆盖物表示大致范围
        const circle = new window.AMap.Circle({
          center: [mapLng, mapLat], // 使用转换后的坐标
          radius: 1000, // 半径1000米
          strokeColor: '#1890ff',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: '#1890ff',
          fillOpacity: 0.1,
        })

        map.add(circle)

        // 添加地图控件
        map.addControl(new window.AMap.Scale())
        map.addControl(new window.AMap.ToolBar({
          position: 'RB'
        }))

      } catch (error) {
        console.error('高德地图加载失败:', error)
        // 显示错误信息
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666; font-size: 14px;">
              <div style="text-align: center;">
                <div style="margin-bottom: 8px;">🗺️</div>
                <div>地图加载失败</div>
                <div style="font-size: 12px; margin-top: 4px;">请检查网络连接</div>
              </div>
            </div>
          `
        }
      }
    }

    initMap()

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, city, country_name, ip, region])

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: '100%', 
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #d9d9d9'
      }} 
    />
  )
}

export default MapComponent
