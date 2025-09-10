# --- 1. 빌드 스테이지 (Build Stage) ---
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 먼저 복사
COPY front-end/package.json front-end/package-lock.json ./

# 모든 의존성 설치 (빌드에는 devDependencies가 필요할 수 있음)
RUN npm ci

# 나머지 소스 코드 복사
COPY front-end/ .

# React 앱 빌드
RUN npm run build

# --- 2. 프로덕션 스테이지 (Production Stage) ---
FROM nginx:stable-alpine

# 빌드 스테이지에서 생성된 정적 파일들을 Nginx의 기본 경로로 복사
# /app/dist 는 Vite의 기본 빌드 결과물 경로입니다.
COPY --from=builder /app/dist /usr/share/nginx/html

# 커스텀 Nginx 설정 파일 복사 (SPA 라우팅 처리를 위해 필요)
COPY front-end/nginx.conf /etc/nginx/conf.d/default.conf

# Nginx 기본 포트 80 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
