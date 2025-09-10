# --- 1. 빌드 스테이지 (Build Stage) ---
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 파일 먼저 복사 (경로 수정됨)
COPY src/front-end/package.json src/front-end/package-lock.json ./

RUN npm ci

# 나머지 소스 코드 복사 (경로 수정됨)
COPY src/front-end/ .

RUN npm run build

# --- 2. 프로덕션 스테이지 (Production Stage) ---
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# 커스텀 Nginx 설정 파일 복사 (경로 수정됨)
COPY src/front-end/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
