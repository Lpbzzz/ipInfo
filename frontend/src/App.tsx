import { Divider, Layout, Space, Typography } from 'antd'
import { lazy, Suspense, memo } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import LanguageSwitcher from './components/LanguageSwitcher'

// 懒加载主要组件
const IpInfoPage = lazy(() => import('./components/IpInfoPage'))

// 优化的加载组件 - 现代化骨架屏风格
const LoadingFallback = memo(() => (
  <div
    style={{
      padding: '32px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* 闪烁动画背景 */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)',
        animation: 'shimmer 2s infinite',
      }}
    />

    {/* 输入区域骨架 */}
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      <div
        style={{
          width: '160px',
          height: '20px',
          background: '#f0f0f0',
          borderRadius: '4px',
          margin: '0 auto 24px',
          animation: 'pulse 2s infinite',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '60px',
                height: '40px',
                background: '#f0f0f0',
                borderRadius: '6px',
                animation: 'pulse 2s infinite',
              }}
            />
            {i < 3 && (
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  background: '#d9d9d9',
                  borderRadius: '50%',
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '40px',
            background: '#e6f7ff',
            borderRadius: '6px',
            animation: 'pulse 2s infinite',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '40px',
            background: '#f0f0f0',
            borderRadius: '6px',
            animation: 'pulse 2s infinite',
          }}
        />
      </div>
    </div>

    {/* 卡片骨架 */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #f0f0f0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)',
              animation: `shimmer ${2.5 + i * 0.2}s infinite`,
            }}
          />
          <div
            style={{
              width: '80px',
              height: '16px',
              background: '#f0f0f0',
              borderRadius: '4px',
              marginBottom: '16px',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                height: '14px',
                background: '#f0f0f0',
                borderRadius: '4px',
                width: ['60%', '80%', '100%'][i % 3],
              }}
            />
            <div
              style={{
                height: '14px',
                background: '#f0f0f0',
                borderRadius: '4px',
                width: ['80%', '60%', '90%'][i % 3],
              }}
            />
            <div
              style={{
                height: '14px',
                background: '#f0f0f0',
                borderRadius: '4px',
                width: ['100%', '70%', '85%'][i % 3],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
))

LoadingFallback.displayName = 'LoadingFallback'

const App = memo(() => {
  const { Header, Content, Footer } = Layout
  const { Title } = Typography
  const { t } = useTranslation()

  // 缓存当前年份
  const currentYear = new Date().getFullYear()

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Analytics />
      <SpeedInsights />
      <Header className="app-header">
        <div className="logo-container">
          <img
            src="/logo.svg"
            alt={t('app.logoAlt')}
            className="logo-icon"
            loading="eager"
            decoding="async"
          />
          <Title
            level={3}
            style={{
              color: '#ecf0f1',
              margin: 0,
              fontWeight: 500,
              fontSize: '18px',
              letterSpacing: '0.3px',
            }}
          >
            {t('app.title')}
          </Title>
        </div>
        <div className="header-actions">
          <LanguageSwitcher />
        </div>
      </Header>
      <Content className="app-content">
        <div className="content-container">
          <Suspense fallback={<LoadingFallback />}>
            <IpInfoPage />
          </Suspense>
        </div>
      </Content>
      <Footer className="app-footer">
        <Space split={<Divider type="vertical" />}>
          <span>{t('footer.copyright', { year: currentYear })}</span>
          <span>{t('footer.createdWith')}</span>
        </Space>
      </Footer>
    </Layout>
  )
})

App.displayName = 'App'

export default App
