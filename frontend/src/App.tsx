// React不需要显式导入，因为JSX会自动处理
import { Layout, Typography, Space, Divider } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import './App.css'
import IpInfoPage from './components/IpInfoPage'

function App() {
  const { Header, Content, Footer } = Layout
  const { Title } = Typography

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header className="app-header">
        <div className="logo-container">
          <GlobalOutlined className="logo-icon" />
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
          <a href="https://github.com/Lpbzzz/ip-location-app" target="_blank" rel="noopener noreferrer">GitHub</a>
        </Space>
      </Footer>
    </Layout>
  )
}

export default App
