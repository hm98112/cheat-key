# --- STAGE 1: Build React App ---
    FROM node:20-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build
    
    # --- STAGE 2: Serve with Nginx ---
    FROM nginx:alpine
    
    # ✨ 수정된 부분: 우리가 만든 nginx.conf 파일을 Nginx의 기본 설정 위치에 덮어씁니다.
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # 1단계에서 빌드된 React 결과물을 Nginx의 웹 루트 디렉토리로 복사합니다.
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]