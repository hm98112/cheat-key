import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Node.js 'path' 모듈을 가져옵니다.

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // alias 경로를 프로젝트 폴더 기준으로 정확하게 설정합니다.
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})