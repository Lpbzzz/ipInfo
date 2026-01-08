import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {}],
        ],
      },
    }),
  ],
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('antd') || id.includes('@ant-design/icons')) {
              return 'antd-vendor'
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'map-vendor'
            }
            if (id.includes('@vercel/analytics') || id.includes('@vercel/speed-insights')) {
              return 'analytics-vendor'
            }
          }
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
      'react-leaflet',
    ],
  },
})
