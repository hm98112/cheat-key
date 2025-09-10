# 1. 베이스 이미지 설정
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 의존성 파일 먼저 복사 (경로 수정됨)
COPY src/back-end/package.json src/back-end/package-lock.json ./

# 4. 프로덕션용 의존성만 설치
RUN npm ci --only=production

# 5. 나머지 소스 코드 복사 (경로 수정됨)
COPY src/back-end/ .

# 6. 애플리케이션 실행 포트 노출
EXPOSE 3000

# 7. 컨테이너 시작 명령어
CMD [ "node", "index.js" ]
