import { useEffect, useRef } from 'react'

// 声明高德地图的全局类型
declare global {
  interface Window {
    AMap: any
    AMapLoader: any
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

    // 动态加载高德地图API
     const loadAMapScript = () => {
       return new Promise((resolve, reject) => {
         if (window.AMap) {
           resolve(window.AMap)
           return
         }

         // 使用环境变量中的API密钥，如果没有则使用开发环境的临时密钥
         const apiKey = import.meta.env.VITE_AMAP_API_KEY || '7a04506d60c3ba5f5d2a0e60d1012b18'
         
         console.log('正在加载高德地图 API...')
         
         const script = document.createElement('script')
         script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.InfoWindow`
         script.async = true
         script.onload = () => {
           console.log('高德地图 API 加载成功')
           // 等待一小段时间确保 AMap 完全初始化
           setTimeout(() => {
             if (window.AMap) {
               resolve(window.AMap)
             } else {
               reject(new Error('AMap 对象未正确初始化'))
             }
           }, 100)
         }
         script.onerror = (error) => {
           console.error('高德地图 API 加载失败:', error)
           reject(new Error('高德地图 API 脚本加载失败'))
         }
         document.head.appendChild(script)
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

        // 如果地图实例已存在，则销毁它
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy()
        }

        // 创建地图实例
        const map = new window.AMap.Map(mapRef.current, {
          zoom: 13,
          center: [longitude, latitude], // 高德地图使用 [经度, 纬度] 格式
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
          position: [longitude, latitude],
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
          center: [longitude, latitude],
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
