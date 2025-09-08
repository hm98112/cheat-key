# 멀티 스테이지 빌드: 1단계 - 빌드 환경
FROM node:22-alpine AS builder

WORKDIR /app

# 패키지 파일들 복사
COPY package*.json ./

# 의존성 설치 (개발 의존성 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# 프론트엔드 빌드
RUN npm run build

# 2단계 - 운영 환경 (Nginx)
FROM nginx:alpine

# 기본 Nginx 설정 파일 삭제
RUN rm -rf /usr/share/nginx/html/*

# 빌드된 파일들을 Nginx html 디렉토리로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사 (SPA를 위한 설정)
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# Health check 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]