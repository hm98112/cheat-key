FROM node:18-alpine AS dependencies

WORKDIR /usr/src/app

# 소스 코드가 변경되어도 이 파일들이 그대로면 npm install을 건너뛰어 빌드 속도가 빨라집니다.
COPY package*.json ./
RUN npm install --production

# 최종 이미지를 위해 깨끗한 Node.js 이미지에서 다시 시작합니다.
FROM node:18-alpine

# 작업 디렉토리를 설정합니다.
WORKDIR /usr/src/app

# 1단계('dependencies')에서 설치된 node_modules 폴더만 복사해옵니다.
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# 나머지 백엔드 소스 코드(index.js, scripts/ 등)를 복사합니다.
COPY . .

# 애플리케이션이 사용할 포트를 외부에 알립니다.
EXPOSE 3000

# 컨테이너가 시작되면 백엔드 서버를 실행합니다.
CMD [ "node", "index.js" ]