# --- 1. 빌드 스테이지 ---
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # 루트의 package.json과 package-lock.json을 복사
    COPY package.json package-lock.json ./
    
    # 프론트엔드용 package.json과 빌드 설정 파일들 복사
    COPY src/front-end/package.json src/front-end/vite.config.js src/front-end/tailwind.config.js ./src/front-end/
    
    # 전체 의존성 설치 (빌드를 위해 devDependencies 포함)
    RUN npm ci
    
    # 프론트엔드 소스 코드 복사
    COPY src/front-end/ ./src/front-end/
    
    # 프론트엔드 프로젝트를 지정하여 빌드 실행
    RUN npm run build --workspace=front-end
    
    # --- 2. 프로덕션 스테이지 ---
    FROM nginx:stable-alpine
    
    # 빌드 결과물 복사
    COPY --from=builder /app/src/front-end/dist /usr/share/nginx/html
    
    # Nginx 설정 파일 복사
    COPY src/front-end/nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]