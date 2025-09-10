# Node.js 공식 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일들을 먼저 복사 (Docker 캐시 최적화)
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production && npm cache clean --force

# 애플리케이션 코드 복사
COPY . .

# 비root 사용자 생성 및 권한 설정 (보안)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# 포트 노출
EXPOSE 8080

# 환경 변수 기본값 설정 (빌드 시 오류 방지)
ENV NODE_ENV=production
ENV PORT=8080

# Health check 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 애플리케이션 실행
CMD ["npm", "start"]
