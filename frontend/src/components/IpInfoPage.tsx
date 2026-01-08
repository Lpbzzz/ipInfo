import {
  BankOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { Alert, Card, Col, Descriptions, Divider, Row, Spin, Statistic, Tag } from 'antd'
import axios from 'axios'
import { useState, useCallback, useMemo, memo, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import type { IpInfo } from '../types/IpInfo'
import IpInputComponent from './IpInputComponent'

// 懒加载地图组件
const MapComponent = lazy(() => import('./MapComponent'))

// 地图加载组件
const MapLoadingFallback = memo(() => {
  const { t } = useTranslation()

  return (
    <div className="map-loading-placeholder">
      <div className="map-loading-content">
        <div className="map-loading-icon">
          <CompassOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
        </div>
        <div className="map-loading-text">{t('loading.map')}</div>
      </div>
    </div>
  )
})

MapLoadingFallback.displayName = 'MapLoadingFallback'

/**
 * IP信息查询页面组件
 * 提供查询当前IP和指定IP的功能
 */
const IpInfoPage = memo(() => {
  const { t } = useTranslation()
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorKey, setErrorKey] = useState('')

  // 不再自动获取当前IP信息
  // useEffect(() => {
  //   fetchMyIpInfo();
  // }, []);

  /**
   * 发送日志到VPS
   * @param message 日志消息
   * @param metadata 元数据
   */
  const sendLogToVPS = useCallback(async (message: string, metadata: Record<string, unknown>) => {
    // 静默处理日志发送，不影响主要功能
    try {
      const timestamp = new Date().toISOString()
      const logData = {
        timestamp,
        level: 'info',
        message,
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          timestamp: timestamp,
        },
      }

      // 只在生产环境或配置了日志服务时发送日志
      const logServiceUrl =
        import.meta.env.VITE_LOG_SERVICE_URL ||
        (import.meta.env.PROD ? 'http://localhost:3001' : null)

      if (!logServiceUrl) {
        // 开发环境且未配置日志服务时，直接返回
        return
      }

      // 使用更短的超时时间，避免影响用户体验
      await axios.post(`${logServiceUrl}/api/logs`, logData, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'default-secret-key',
        },
        timeout: 1500, // 1.5秒超时
      })
    } catch (_error) {
      // 完全静默处理，不输出任何错误信息
      // 日志系统不可用时不应该影响用户体验
    }
  }, [])

  /**
   * 获取当前IP信息
   * 直接从前端调用外部API，确保获取用户的真实IP（包括代理IP）
   */
  const fetchMyIpInfo = useCallback(async () => {
    setLoading(true)
    setErrorKey('')
    try {
      // 首先通过外部API获取用户的真实IP
      const ipResponse = await axios.get('https://ipwho.is/', {
        timeout: 5000,
      })

      if (ipResponse.data.success === false) {
        throw new Error(ipResponse.data.message || t('error.getIpFailed'))
      }

      const userIp = ipResponse.data.ip
      console.log('前端获取到用户真实IP:', userIp)

      // 记录用户查询自己IP的日志
      await sendLogToVPS('用户查询自己的IP信息', {
        action: 'get_my_ip',
        ip: userIp,
        source: 'frontend',
      })

      // 然后调用后端API获取详细的IP信息
      const response = await axios.get(`/api/ip-info/query?ip=${userIp}`)
      setIpInfo(response.data)
    } catch (err) {
      // 如果外部API失败，回退到后端API
      console.warn('外部API获取IP失败，回退到后端API:', err)
      try {
        const response = await axios.get('/api/ip-info')
        setIpInfo(response.data)

        // 记录回退到后端API的日志
        await sendLogToVPS('回退到后端API获取IP信息', {
          action: 'fallback_to_backend',
          error: err instanceof Error ? err.message : '未知错误',
          source: 'frontend',
        })
      } catch (backendErr) {
        setErrorKey('error.getIpInfoFailed')
        console.error('Error fetching IP info:', backendErr)

        // 记录错误日志
        await sendLogToVPS('获取IP信息失败', {
          action: 'get_my_ip_error',
          error: backendErr instanceof Error ? backendErr.message : '未知错误',
          source: 'frontend',
        })
      }
    } finally {
      setLoading(false)
    }
  }, [sendLogToVPS, t])

  /**
   * 查询指定IP信息
   * @param ip IP地址
   */
  const fetchSpecificIpInfo = useCallback(
    async (ip: string) => {
      if (!ip.trim()) {
        setErrorKey('error.invalidIp')
        return
      }

      setLoading(true)
      setErrorKey('')
      try {
        // 记录用户查询指定IP的日志
        await sendLogToVPS('用户查询指定IP信息', {
          action: 'query_specific_ip',
          target_ip: ip,
          source: 'frontend',
        })

        const response = await axios.get(`/api/ip-info/query?ip=${ip}`)
        setIpInfo(response.data)

        // 记录查询成功的日志
        await sendLogToVPS('IP查询成功', {
          action: 'query_success',
          target_ip: ip,
          result_country: response.data.country_name,
          result_city: response.data.city,
          source: 'frontend',
        })
      } catch (err) {
        setErrorKey('error.getIpInfoFailed')
        console.error('Error fetching IP info:', err)

        // 记录查询失败的日志
        await sendLogToVPS('IP查询失败', {
          action: 'query_error',
          target_ip: ip,
          error: err instanceof Error ? err.message : '未知错误',
          source: 'frontend',
        })
      } finally {
        setLoading(false)
      }
    },
    [sendLogToVPS]
  )

  // 缓存计算结果
  const hasMapData = useMemo(() => {
    return ipInfo?.latitude && ipInfo?.longitude
  }, [ipInfo?.latitude, ipInfo?.longitude])

  const loadingComponent = useMemo(
    () => (
      <div className="loading-container">
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#1890ff' }}>{t('loading.ipInfo')}</div>
        </div>
      </div>
    ),
    [t]
  )

  return (
    <div className="ip-info-container">
      <Card className="query-card" variant="outlined">
        <IpInputComponent
          onSearch={fetchSpecificIpInfo}
          onGetMyIp={fetchMyIpInfo}
          loading={loading}
          currentIp={ipInfo?.ip}
        />

        {errorKey && (
          <Alert message={t(errorKey)} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        {loading ? (
          loadingComponent
        ) : ipInfo ? (
          <div className="ip-info-result">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  className="info-card"
                  title={
                    <>
                      <BankOutlined /> {t('ipInfo.basicInfo')}
                    </>
                  }
                  extra={<Tag color="blue">{ipInfo.version || 'IPv4'}</Tag>}
                  variant="outlined"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Statistic
                        title={t('ipInfo.fields.ip')}
                        value={ipInfo.ip}
                        valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={t('ipInfo.fields.countryOrRegion')}
                        value={ipInfo.country_name || t('ipInfo.values.unknown')}
                        prefix={<EnvironmentOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={t('ipInfo.fields.city')}
                        value={ipInfo.city || t('ipInfo.values.unknown')}
                        prefix={<EnvironmentOutlined />}
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label={t('ipInfo.fields.region')}>
                      {ipInfo.region || t('ipInfo.values.unknown')}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('ipInfo.fields.postal')}>
                      {ipInfo.postal || t('ipInfo.values.unknown')}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('ipInfo.fields.isp')}>
                      {ipInfo.org || t('ipInfo.values.unknown')}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('ipInfo.fields.network')}>
                      {ipInfo.network || t('ipInfo.values.unknown')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  className="info-card"
                  title={
                    <>
                      <CompassOutlined /> {t('ipInfo.geoLocation')}
                    </>
                  }
                  variant="outlined"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title={t('ipInfo.fields.longitude')}
                        value={ipInfo.longitude || t('ipInfo.values.unknown')}
                        precision={4}
                        prefix={<CompassOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={t('ipInfo.fields.latitude')}
                        value={ipInfo.latitude || t('ipInfo.values.unknown')}
                        precision={4}
                        prefix={<CompassOutlined />}
                      />
                    </Col>
                    <Col span={24}>
                      <Statistic
                        title={t('ipInfo.fields.timezone')}
                        value={ipInfo.timezone || t('ipInfo.values.unknown')}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                  </Row>

                  {ipInfo.currency && (
                    <>
                      <Divider />
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label={t('ipInfo.fields.currency')}>
                          {ipInfo.currency || t('ipInfo.values.unknown')}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('ipInfo.fields.languages')}>
                          {ipInfo.languages || t('ipInfo.values.unknown')}
                        </Descriptions.Item>
                      </Descriptions>
                    </>
                  )}
                </Card>
              </Col>
            </Row>

            {hasMapData && ipInfo.latitude !== undefined && ipInfo.longitude !== undefined && (
              <Card
                className="map-card"
                title={
                  <>
                    <GlobalOutlined /> {t('map.title')}
                  </>
                }
                variant="outlined"
                style={{ marginTop: 24 }}
              >
                <div className="map-container">
                  <Suspense fallback={<MapLoadingFallback />}>
                    <MapComponent
                      latitude={ipInfo.latitude}
                      longitude={ipInfo.longitude}
                      city={ipInfo.city}
                      country_name={ipInfo.country_name}
                      ip={ipInfo.ip}
                    />
                  </Suspense>
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </Card>
    </div>
  )
})

IpInfoPage.displayName = 'IpInfoPage'

export default IpInfoPage
