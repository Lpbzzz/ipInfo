import { GlobalOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd/es/menu'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n'

interface LanguageSwitcherProps {
  className?: string
}

/**
 * 语言切换组件
 * 简洁的语言选择器，支持桌面端和移动端
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { t, i18n } = useTranslation()

  // 处理语言切换
  const handleLanguageChange = useCallback(
    (language: SupportedLanguage) => {
      i18n.changeLanguage(language)
    },
    [i18n]
  )

  // 构建语言菜单项
  const menuItems: MenuProps['items'] = useMemo(() => {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => {
      return {
        key: code,
        label: (
          <span
            style={{
              fontWeight: code === i18n.language ? 500 : 'normal',
              color: code === i18n.language ? '#1890ff' : undefined,
            }}
          >
            {info.nativeName}
          </span>
        ),
        onClick:
          code !== i18n.language ? () => {
            return handleLanguageChange(code as SupportedLanguage)
          } : undefined,
        disabled: code === i18n.language,
      }
    })
  }, [i18n.language, handleLanguageChange])

  const currentLanguage = SUPPORTED_LANGUAGES[i18n.language as SupportedLanguage]

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
      overlayStyle={{ minWidth: '150px' }}
      className={className}
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="language-switcher-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          height: 'auto',
          color: '#fff',
        }}
        title={t('language.switch')}
      >
        <span
          className="language-text"
          style={{
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {currentLanguage?.nativeName}
        </span>
      </Button>
    </Dropdown>
  )
}

export default LanguageSwitcher
