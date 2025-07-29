import * as L from 'leaflet'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface MapComponentProps {
  latitude: number
  longitude: number
  city?: string
  country_name?: string
  region?: string
  ip?: string
}

/**
 * 地图组件，用于显示IP位置
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
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // 如果地图实例已存在，则移除它
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
    }

    // 修复Leaflet图标问题
    // 使用更具体的类型定义，而不是any
    interface IconDefaultPrototype extends L.Icon.Default {
      _getIconUrl?: unknown
    }
    delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })

    // 创建地图实例
    const map = L.map(mapRef.current).setView([latitude, longitude], 13)
    mapInstanceRef.current = map

    // 添加地图图层 - 使用高德地图
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
    }).addTo(map)

    // 添加标记
    const popupContent = `
      <div style="text-align: center; padding: 8px; min-width: 200px;">
        <div style="font-size: 16px; font-weight: bold; color: #1890ff; margin-bottom: 8px;">
          ${city || '未知城市'}, ${region || '未知地区'}
        </div>
        <div style="font-size: 14px; color: #333; margin-bottom: 4px;">
          ${country_name || '未知国家'}
        </div>
        <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
          IP: ${ip || '未知'}
        </div>
        <div style="font-size: 13px; color: #666; display: flex; justify-content: center; gap: 8px;">
          <span>经度: ${longitude.toFixed(4)}</span>
          <span>纬度: ${latitude.toFixed(4)}</span>
        </div>
      </div>
    `

    // 创建自定义图标
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="marker-pin"></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    })

    // 添加带自定义图标的标记
    L.marker([latitude, longitude], { icon: customIcon })
      .addTo(map)
      .bindPopup(popupContent, {
        className: 'custom-popup',
        closeButton: true,
        autoClose: false,
      })
      .openPopup()

    // 添加圆形区域表示大致范围
    L.circle([latitude, longitude], {
      color: '#1890ff',
      fillColor: '#1890ff',
      fillOpacity: 0.1,
      radius: 1000,
    }).addTo(map)

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, city, country_name, ip, region])

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
}

export default MapComponent
