# 1. 베이스 이미지로 Node.js 18 버전을 사용
FROM node:18-alpine

# 2. 작업 디렉토리 생성
WORKDIR /usr/src/app

# 3. 백엔드의 package.json 파일을 먼저 복사하여 의존성을 설치
COPY backend/package*.json ./
RUN npm install

# 4. 백엔드 소스 코드를 복사
COPY backend/ ./

# 5. 프론트엔드 정적 파일들을 백엔드 서버의 'public' 폴더로 복사
# (위 server.js에서 설정한 바로 그 폴더입니다.)
COPY frontend/ ./public/

# 6. 애플리케이션이 사용할 포트를 외부에 알림
EXPOSE 3000

# 7. 컨테이너가 시작되면 백엔드 서버를 실행
CMD [ "node", "server.js" ]