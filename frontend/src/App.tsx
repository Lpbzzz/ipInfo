// React不需要显式导入，因为JSX会自动处理
import { Divider, Layout, Space, Typography } from 'antd'
import './App.css'
import IpInfoPage from './components/IpInfoPage'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

function App() {
  const { Header, Content, Footer } = Layout
  const { Title } = Typography

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Analytics />
      <SpeedInsights />
      <Header className="app-header">
        <div className="logo-container">
          <img src="/logo.svg" alt="IP查询Logo" className="logo-icon" />
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            IP地理位置查询
          </Title>
        </div>
      </Header>
      <Content className="app-content">
        <div className="content-container">
          <IpInfoPage />
        </div>
      </Content>
      <Footer className="app-footer">
        <Space split={<Divider type="vertical" />}>
          <span>IP地理位置查询 ©{new Date().getFullYear()}</span>
          <span>Created with React & Ant Design</span>
        </Space>
      </Footer>
    </Layout>
  )
}

export default App
