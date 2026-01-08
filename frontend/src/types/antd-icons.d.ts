declare module '@ant-design/icons' {
  import { ComponentType } from 'react'

  interface AntdIconProps {
    className?: string
    style?: React.CSSProperties
    spin?: boolean
    rotate?: number
    twoToneColor?: string
    [key: string]: any
  }

  export const BankOutlined: ComponentType<AntdIconProps>
  export const ClockCircleOutlined: ComponentType<AntdIconProps>
  export const CompassOutlined: ComponentType<AntdIconProps>
  export const EnvironmentOutlined: ComponentType<AntdIconProps>
  export const GlobalOutlined: ComponentType<AntdIconProps>
  export const SearchOutlined: ComponentType<AntdIconProps>
  export const LoadingOutlined: ComponentType<AntdIconProps>
  export const InfoCircleOutlined: ComponentType<AntdIconProps>
  export const CheckCircleOutlined: ComponentType<AntdIconProps>
  export const ExclamationCircleOutlined: ComponentType<AntdIconProps>
  export const CloseCircleOutlined: ComponentType<AntdIconProps>
}
