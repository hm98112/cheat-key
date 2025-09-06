# 이 단계의 별명을 'builder'라고 짓습니다.
FROM node:20-alpine AS builder

WORKDIR /app

# (빌드 속도 최적화를 위한 캐싱 기법)
COPY package*.json ./
RUN npm install

# 나머지 프론트엔드 소스 코드를 복사합니다.
COPY . .

# React 애플리케이션을 프로덕션용으로 빌드합니다.
# 결과물은 /app/dist 폴더에 생성됩니다.
RUN npm run build

# --- STAGE 2: Serve with Nginx ---
# 최종 이미지를 위해 매우 가벼운 Nginx 웹서버를 사용합니다.
FROM nginx:alpine

# 1단계(builder)에서 빌드된 프론트엔드 결과물(/app/dist)을
# Nginx의 기본 웹 루트 디렉토리(/usr/share/nginx/html)로 복사합니다.
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx는 기본적으로 80번 포트를 사용합니다.
EXPOSE 80

# 컨테이너가 시작될 때 Nginx 서버를 실행합니다.
CMD ["nginx", "-g", "daemon off;"]