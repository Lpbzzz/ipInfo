declare module 'antd' {
  import { ComponentType, ReactNode } from 'react'
  
  export interface AlertProps {
    message?: ReactNode
    type?: 'success' | 'info' | 'warning' | 'error'
    showIcon?: boolean
    style?: React.CSSProperties
    className?: string
  }
  
  export interface CardProps {
    title?: ReactNode
    extra?: ReactNode
    className?: string
    style?: React.CSSProperties
    variant?: 'outlined' | 'filled'
    children?: ReactNode
  }
  
  export interface ColProps {
    span?: number
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
    children?: ReactNode
  }
  
  export interface RowProps {
    gutter?: number | [number, number]
    children?: ReactNode
  }
  
  export interface SpinProps {
    size?: 'small' | 'default' | 'large'
    spinning?: boolean
    children?: ReactNode
  }
  
  export interface StatisticProps {
    title?: ReactNode
    value?: string | number
    precision?: number
    prefix?: ReactNode
    suffix?: ReactNode
    valueStyle?: React.CSSProperties
  }
  
  export interface TagProps {
    color?: string
    children?: ReactNode
  }
  
  export interface DescriptionsProps {
    column?: number
    size?: 'default' | 'middle' | 'small'
    bordered?: boolean
    children?: ReactNode
  }
  
  export interface DividerProps {
    type?: 'horizontal' | 'vertical'
    orientation?: 'left' | 'right' | 'center'
    children?: ReactNode
  }
  
  export const Alert: ComponentType<AlertProps>
  export const Card: ComponentType<CardProps>
  export const Col: ComponentType<ColProps>
  export const Row: ComponentType<RowProps>
  export const Spin: ComponentType<SpinProps>
  export const Statistic: ComponentType<StatisticProps>
  export const Tag: ComponentType<TagProps>
  export const Descriptions: ComponentType<DescriptionsProps> & {
    Item: ComponentType<{ label?: ReactNode; children?: ReactNode }>
  }
  export const Divider: ComponentType<DividerProps>
}