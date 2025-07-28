import {
  BankOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { Alert, Card, Col, Descriptions, Divider, Row, Spin, Statistic, Tag } from 'antd'
import axios from 'axios'
import { useState } from 'react'
import type { IpInfo } from '../types/IpInfo'
import IpInputComponent from './IpInputComponent'
import MapComponent from './MapComponent'

/**
 * IP信息查询页面组件
 * 提供查询当前IP和指定IP的功能
 */
const IpInfoPage = () => {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 不再自动获取当前IP信息
  // useEffect(() => {
  //   fetchMyIpInfo();
  // }, []);

  /**
   * 发送日志到VPS
   * @param message 日志消息
   * @param metadata 元数据
   */
  const sendLogToVPS = async (message: string, metadata: Record<string, unknown>) => {
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

      // 使用更短的超时时间，避免影响用户体验
      await axios.post('http://localhost:3001/api/logs', logData, {
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
  }

  /**
   * 获取当前IP信息
   * 直接从前端调用外部API，确保获取用户的真实IP（包括代理IP）
   */
  const fetchMyIpInfo = async () => {
    setLoading(true)
    setError('')
    try {
      // 首先通过外部API获取用户的真实IP
      const ipResponse = await axios.get('https://ipwho.is/', {
        timeout: 5000,
      })

      if (ipResponse.data.success === false) {
        throw new Error(ipResponse.data.message || '获取IP失败')
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
        setError('获取IP信息失败，请稍后再试')
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
  }

  /**
   * 查询指定IP信息
   * @param ip IP地址
   */
  const fetchSpecificIpInfo = async (ip: string) => {
    if (!ip.trim()) {
      setError('请输入有效的IP地址')
      return
    }

    setLoading(true)
    setError('')
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
      setError('获取IP信息失败，请稍后再试')
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
  }

  return (
    <div className="ip-info-container">
      <Card className="query-card" variant="outlined">
        <IpInputComponent
          onSearch={fetchSpecificIpInfo}
          onGetMyIp={fetchMyIpInfo}
          loading={loading}
          currentIp={ipInfo?.ip}
        />

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        {loading ? (
          <div className="loading-container">
            <div style={{ textAlign: 'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#1890ff' }}>正在获取IP信息...</div>
            </div>
          </div>
        ) : ipInfo ? (
          <div className="ip-info-result">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  className="info-card"
                  title={
                    <>
                      <BankOutlined /> 基本信息
                    </>
                  }
                  extra={<Tag color="blue">{ipInfo.version || 'IPv4'}</Tag>}
                  variant="outlined"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Statistic
                        title="IP地址"
                        value={ipInfo.ip}
                        valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="国家"
                        value={ipInfo.country_name || '未知'}
                        prefix={<EnvironmentOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="城市"
                        value={ipInfo.city || '未知'}
                        prefix={<EnvironmentOutlined />}
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="地区">{ipInfo.region || '未知'}</Descriptions.Item>
                    <Descriptions.Item label="邮编">{ipInfo.postal || '未知'}</Descriptions.Item>
                    <Descriptions.Item label="ISP提供商">{ipInfo.org || '未知'}</Descriptions.Item>
                    <Descriptions.Item label="网络">{ipInfo.network || '未知'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  className="info-card"
                  title={
                    <>
                      <CompassOutlined /> 地理位置
                    </>
                  }
                  variant="outlined"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="经度"
                        value={ipInfo.longitude || '未知'}
                        precision={4}
                        prefix={<CompassOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="纬度"
                        value={ipInfo.latitude || '未知'}
                        precision={4}
                        prefix={<CompassOutlined />}
                      />
                    </Col>
                    <Col span={24}>
                      <Statistic
                        title="时区"
                        value={ipInfo.timezone || '未知'}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                  </Row>

                  {ipInfo.currency && (
                    <>
                      <Divider />
                      <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="货币">
                          {ipInfo.currency || '未知'}
                        </Descriptions.Item>
                        <Descriptions.Item label="语言">
                          {ipInfo.languages || '未知'}
                        </Descriptions.Item>
                      </Descriptions>
                    </>
                  )}
                </Card>
              </Col>
            </Row>

            {ipInfo.latitude && ipInfo.longitude && (
              <Card
                className="map-card"
                title={
                  <>
                    <GlobalOutlined /> 位置地图
                  </>
                }
                variant="outlined"
                style={{ marginTop: 24 }}
              >
                <div className="map-container">
                  <MapComponent
                    latitude={ipInfo.latitude}
                    longitude={ipInfo.longitude}
                    city={ipInfo.city}
                    country_name={ipInfo.country_name}
                    region={ipInfo.region}
                    ip={ipInfo.ip}
                  />
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default IpInfoPage
