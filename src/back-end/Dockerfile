# 1. 베이스 이미지 설정
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 의존성 파일 먼저 복사 (빌드 캐시 활용)
# 컨텍스트가 루트이므로 'back-end/' 경로를 명시해야 합니다.
COPY back-end/package.json back-end/package-lock.json ./

# 4. 프로덕션용 의존성만 설치
RUN npm ci --only=production

# 5. 나머지 소스 코드 복사
# 'back-end/' 디렉토리의 모든 내용을 컨테이너의 /app 디렉토리로 복사합니다.
COPY back-end/ .

# 6. 애플리케이션 실행 포트 노출 (실제 사용하는 포트로 변경하세요)
EXPOSE 3000

# 7. 컨테이너 시작 명령어
CMD [ "node", "index.js" ]
