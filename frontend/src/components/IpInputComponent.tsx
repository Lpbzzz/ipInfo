import { SearchOutlined, WifiOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Button, Input, Typography } from 'antd'
import React, { useEffect, useRef, useState } from 'react'

interface IpInputComponentProps {
  onSearch: (ip: string) => void
  onGetMyIp: () => void
  loading?: boolean
  currentIp?: string
}

/**
 * IP输入组件
 * 提供四段式IP输入界面，支持Tab、点和Enter键切换输入框
 * @param onSearch 查询IP的回调函数
 * @param onGetMyIp 获取当前IP的回调函数
 * @param loading 加载状态
 */
const IpInputComponent: React.FC<IpInputComponentProps> = ({
  onSearch,
  onGetMyIp,
  loading = false,
  currentIp,
}) => {
  // 存储四个IP段的值
  const [ipSegments, setIpSegments] = useState<string[]>(['', '', '', ''])

  // 创建四个输入框的引用
  const inputRefs = [
    useRef<InputRef>(null),
    useRef<InputRef>(null),
    useRef<InputRef>(null),
    useRef<InputRef>(null),
  ]

  // 检查IP是否有效
  const isValidIp = ipSegments.every(
    (segment) => segment !== '' && parseInt(segment) >= 0 && parseInt(segment) <= 255
  )

  // 处理IP段输入变化
  const handleIpSegmentChange = (index: number, value: string) => {
    // 只允许输入数字
    const numericValue = value.replace(/[^0-9]/g, '')

    // 限制输入范围为0-255
    let validValue = numericValue
    if (numericValue !== '' && parseInt(numericValue) > 255) {
      validValue = '255'
    }

    // 更新IP段值
    const newIpSegments = [...ipSegments]
    newIpSegments[index] = validValue
    setIpSegments(newIpSegments)

    // 如果输入了3位数字或输入了点号，自动跳转到下一个输入框
    if (validValue.length === 3 && index < 3) {
      inputRefs[index + 1].current?.focus()
      // 选中下一个输入框的内容
      setTimeout(() => {
        inputRefs[index + 1].current?.select()
      }, 0)
    }
  }

  // 处理键盘事件
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // 如果按下了点号或Tab键，跳转到下一个输入框
    if ((e.key === '.' || e.key === 'Tab') && index < 3) {
      e.preventDefault()
      inputRefs[index + 1].current?.focus()
      // 选中下一个输入框的内容
      setTimeout(() => {
        inputRefs[index + 1].current?.select()
      }, 0)
    }

    // 如果按下了退格键且当前输入框为空，跳转到上一个输入框
    if (e.key === 'Backspace' && ipSegments[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus()
    }

    // 如果按下了Enter键，执行查询
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 处理粘贴事件
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')

    // 尝试解析粘贴的内容为IP地址
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = pastedText.match(ipRegex)

    if (match) {
      // 提取IP段
      const newSegments = [match[1], match[2], match[3], match[4]]

      // 验证每个段是否在有效范围内
      const validSegments = newSegments.map((segment) => {
        const num = parseInt(segment)
        return num >= 0 && num <= 255 ? segment : ''
      })

      setIpSegments(validSegments)
    }
  }

  // 执行IP查询
  const handleSearch = () => {
    if (isValidIp) {
      const fullIp = ipSegments.join('.')
      onSearch(fullIp)
    }
  }

  // 当IP段变化时，检查是否可以执行查询
  useEffect(() => {
    // 自动聚焦第一个输入框（仅在组件挂载时）
    if (ipSegments.every((segment) => segment === '')) {
      inputRefs[0].current?.focus()
    }
  }, [inputRefs[0].current?.focus, ipSegments.every])

  // 当currentIp变化时，自动填充输入框
  useEffect(() => {
    if (currentIp) {
      const ipParts = currentIp.split('.')
      if (ipParts.length === 4) {
        setIpSegments(ipParts)
      }
    }
  }, [currentIp])

  return (
    <div className="ip-input-container">
      <Typography.Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>
        查询IP地理位置
      </Typography.Title>
      <div className="ip-segments-container">
        {ipSegments.map((segment, index) => (
          <React.Fragment key={`segment-${index}-${segment}`}>
            <Input
              ref={inputRefs[index]}
              className="ip-segment-input"
              value={segment}
              onChange={(e) => handleIpSegmentChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              maxLength={3}
              size="large"
              placeholder="0"
            />
            {index < 3 && <span className="ip-segment-dot">.</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="ip-buttons-container">
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          loading={loading}
          disabled={!isValidIp || loading}
          size="large"
          className="ip-search-button"
          block
        >
          查询位置
        </Button>
        <Button
          type="default"
          icon={<WifiOutlined />}
          onClick={onGetMyIp}
          loading={loading}
          size="large"
          className="ip-my-button"
          block
          style={{ backgroundColor: '#f5f5f5' }}
        >
          获取当前IP位置
        </Button>
      </div>
    </div>
  )
}

export default IpInputComponent
