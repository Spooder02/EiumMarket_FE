// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],

  server: {
    proxy: {
      // '/api'로 시작하는 모든 요청을 target 주소로 보냅니다.
      '/api': {
        target: 'https://geonnie-be.space', // 백엔드 서버 주소
        changeOrigin: true, // cross-origin 요청을 위해 필요한 설정
        // 요청 주소에서 '/api' 부분을 제거하고 보냅니다.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // '/search' 경로에 대한 프록시 추가
      '/search': {
        target: 'https://geonnie-be.space',
        changeOrigin: true,
      },
      '/naver-api': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/naver-api/, ''), // 경로에서 '/naver-api' 제거
      }
    }
  }
})