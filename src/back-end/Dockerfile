# Node.js 공식 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일들을 먼저 복사 (Docker 캐시 최적화)
COPY package*.json ./

# 의존성 설치 (package-lock.json 유무에 따라 분기)
RUN if [ -f package-lock.json ]; then \
        npm ci --only=production; \
    else \
        npm install --only=production; \
    fi && npm cache clean --force

# 애플리케이션 코드 복사
COPY . .

# 비root 사용자 생성 및 권한 설정 (보안)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# 포트 노출
EXPOSE 8080

# 환경 변수 기본값 설정
ENV NODE_ENV=production
ENV PORT=8080

# Health check 추가 (간단한 버전으로 수정)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthz || exit 1

# 애플리케이션 실행 (package.json의 start 스크립트 사용)
CMD ["npm", "start"]
