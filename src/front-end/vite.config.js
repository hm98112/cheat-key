import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }]
  },
  server: {
    proxy: {
      // '/api'로 시작하는 모든 요청을 백엔드 서버(localhost:8080)로 전달합니다.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true, // CORS 에러를 피하기 위해 필요한 옵션
      }
    }
  }
})