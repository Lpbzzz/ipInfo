import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      // 开发环境下，将API请求代理到后端服务
      '/ip-info': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
