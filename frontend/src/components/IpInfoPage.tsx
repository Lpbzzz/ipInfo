import { useState, useEffect } from 'react';
import { Card, Descriptions, Spin, Alert, Row, Col, Statistic, Tag, Divider } from 'antd';
import { GlobalOutlined, EnvironmentOutlined, BankOutlined, CompassOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import MapComponent from './MapComponent';
import IpInputComponent from './IpInputComponent';
import type { IpInfo } from '../types/IpInfo';

/**
 * IP信息查询页面组件
 * 提供查询当前IP和指定IP的功能
 */
const IpInfoPage = () => {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 不再自动获取当前IP信息
  // useEffect(() => {
  //   fetchMyIpInfo();
  // }, []);

  /**
   * 获取当前IP信息
   */
  const fetchMyIpInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3001/ip-info');
      setIpInfo(response.data);
    } catch (err) {
      setError('获取IP信息失败，请稍后再试');
      console.error('Error fetching IP info:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 查询指定IP信息
   * @param ip IP地址
   */
  const fetchSpecificIpInfo = async (ip: string) => {
    if (!ip.trim()) {
      setError('请输入有效的IP地址');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:3001/ip-info/query?ip=${ip}`);
      setIpInfo(response.data);
    } catch (err) {
      setError('获取IP信息失败，请稍后再试');
      console.error('Error fetching IP info:', err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="ip-info-container">
      <Card 
        className="query-card"
        variant="outlined"
      >
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
                  title={<><BankOutlined /> 基本信息</>}
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
                  title={<><CompassOutlined /> 地理位置</>}
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
                        <Descriptions.Item label="货币">{ipInfo.currency || '未知'}</Descriptions.Item>
                        <Descriptions.Item label="语言">{ipInfo.languages || '未知'}</Descriptions.Item>
                      </Descriptions>
                    </>
                  )}
                </Card>
              </Col>
            </Row>

            {ipInfo.latitude && ipInfo.longitude && (
              <Card 
                className="map-card" 
                title={<><GlobalOutlined /> 位置地图</>}
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
  );
};

export default IpInfoPage;