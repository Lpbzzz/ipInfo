import { useEffect, useRef, memo } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from 'react-i18next'

// 修复 Leaflet 默认图标问题
if (L.Icon?.Default?.prototype) {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

interface MapComponentProps {
  latitude: number
  longitude: number
  city?: string
  country_name?: string
  ip?: string
}

/**
 * 地图组件
 * 使用 Leaflet 显示 IP 地理位置
 */
const MapComponent = memo(({ latitude, longitude, city, country_name, ip }: MapComponentProps) => {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) {
      return
    }

    // 清理之前的地图实例
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // 创建地图实例
    const map = L.map(mapRef.current, {
      center: [latitude, longitude],
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      attributionControl: true,
    })

    mapInstanceRef.current = map

    // 添加瓦片图层 - 使用 OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
    }).addTo(map)

    // 创建自定义图标
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: rotate(-45deg);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    })

    // 添加标记
    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map)
    markerRef.current = marker

    // 创建弹出窗口内容
    const popupContent = `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 200px;
        padding: 8px 0;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: #1890ff;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span style="
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #1890ff;
            border-radius: 50%;
          "></span>
          ${t('map.locationInfo')}
        </div>
        
        ${
          ip
            ? `
          <div style="margin-bottom: 6px;">
            <strong style="color: #595959;">${t('ipInfo.fields.ip')}:</strong>
            <span style="
              color: #1890ff;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 14px;
              margin-left: 8px;
            ">${ip}</span>
          </div>
        `
            : ''
        }
        
        ${
          country_name
            ? `
          <div style="margin-bottom: 6px;">
            <strong style="color: #595959;">${t('ipInfo.fields.countryOrRegion')}:</strong>
            <span style="margin-left: 8px; color: #262626;">${country_name}</span>
          </div>
        `
            : ''
        }
        
        ${
          city
            ? `
          <div style="margin-bottom: 6px;">
            <strong style="color: #595959;">${t('ipInfo.fields.city')}:</strong>
            <span style="margin-left: 8px; color: #262626;">${city}</span>
          </div>
        `
            : ''
        }
        
        <div style="margin-bottom: 6px;">
          <strong style="color: #595959;">${t('ipInfo.fields.coordinates')}:</strong>
          <span style="
            margin-left: 8px;
            color: #262626;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
          ">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</span>
        </div>
        
        <div style="\n          margin-top: 12px;\n          padding-top: 8px;\n          border-top: 1px solid #f0f0f0;\n          font-size: 12px;\n          color: #8c8c8c;\n          text-align: center;\n        ">
        </div>
      </div>
    `

    // 绑定弹出窗口
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup',
      closeButton: true,
      autoClose: false,
      closeOnClick: false,
    })

    // 添加地图点击事件
    map.on('click', (e) => {
      const { lat, lng } = e.latlng

      // 创建临时标记显示点击位置的坐标
      const tempPopup = L.popup()
        .setLatLng([lat, lng])
        .setContent(`
          <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="font-size: 14px; color: #595959; margin-bottom: 4px;">
              ${t('map.clickedLocation')}
            </div>
            <div style="
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 12px;
              color: #1890ff;
              font-weight: 500;
            ">
              ${lat.toFixed(4)}, ${lng.toFixed(4)}
            </div>
          </div>
        `)
        .openOn(map)

      // 3秒后自动关闭临时弹窗
      setTimeout(() => {
        map.closePopup(tempPopup)
      }, 3000)
    })

    // 添加缩放控制样式
    const zoomControl = map.zoomControl
    if (zoomControl) {
      const zoomContainer = zoomControl.getContainer()
      if (zoomContainer) {
        zoomContainer.style.border = 'none'
        zoomContainer.style.borderRadius = '6px'
        zoomContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
      }
    }

    // 自动打开弹窗显示位置信息
    setTimeout(() => {
      marker.openPopup()
    }, 500)

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (markerRef.current) {
        markerRef.current = null
      }
    }
  }, [latitude, longitude, city, country_name, ip, t])

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      />

      {/* 地图控制说明 */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#595959',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      >
        {t('map.controls')}
      </div>

      {/* 添加自定义样式 */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid #f0f0f0;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 12px 16px;
          line-height: 1.5;
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
          border: 1px solid #f0f0f0;
          border-top: none;
          border-right: none;
        }
        
        .leaflet-control-zoom a {
          background-color: white;
          border: 1px solid #d9d9d9;
          color: #595959;
          font-size: 16px;
          line-height: 26px;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: #f5f5f5;
          border-color: #1890ff;
          color: #1890ff;
        }
        
        .leaflet-control-attribution {
          display: none;
        }
        background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          border-radius: 4px;
          font-size: 11px;
        }
        
        .custom-marker {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
      `}</style>
    </div>
  )
})

MapComponent.displayName = 'MapComponent'

export default MapComponent
