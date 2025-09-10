# 1. 베이스 이미지 설정
FROM node:20-alpine

# 2. 전체 빌드를 위한 작업 디렉토리 설정
WORKDIR /app

# --- 의존성 설치 ---
# 3. 루트의 package.json과 package-lock.json을 복사
COPY package.json package-lock.json ./

# 4. 백엔드용 package.json도 복사 (workspace 인식을 위해 필요)
COPY src/back-end/package.json ./src/back-end/

# 5. 루트 컨텍스트에서 전체 프로덕션 의존성 설치
RUN npm ci --only=production

# --- 애플리케이션 코드 ---
# 6. 백엔드 소스 코드 복사
COPY src/back-end/ ./src/back-end/

# 7. 최종 실행을 위해 작업 디렉토리를 백엔드 폴더로 변경
WORKDIR /app/src/back-end

# 8. 애플리케이션 포트 노출
EXPOSE 3000

# 9. 컨테이너 시작 명령어
CMD [ "node", "index.js" ]