import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          // 将 React 相关库分离到单独的 chunk
          'react-vendor': ['react', 'react-dom'],
          // 将 Ant Design 分离到单独的 chunk
          'antd-vendor': ['antd', '@ant-design/icons'],
          // 将地图相关库分离到单独的 chunk
          'map-vendor': ['leaflet', 'react-leaflet'],
          // 将 Vercel 分析工具分离到单独的 chunk
          'analytics-vendor': ['@vercel/analytics', '@vercel/speed-insights'],
        },
        // 优化 chunk 文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用源码映射（生产环境可关闭以减小体积）
    sourcemap: false,
    // 压缩配置
    minify: 'esbuild',
    // 目标浏览器
    target: 'es2015',
  },
  server: {
    proxy: {
      // 开发环境下，将API请求代理到后端服务
      '/api/ip-info': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      '@ant-design/icons',
      'axios',
    ],
    exclude: [
      // 排除较大的可选依赖
      'leaflet',
      'react-leaflet',
    ],
  },
  // 启用 esbuild 优化
  esbuild: {
    // 移除 console 和 debugger（生产环境）
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
