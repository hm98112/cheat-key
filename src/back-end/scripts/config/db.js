const { Pool } = require('pg');

// Kubernetes가 Key Vault에서 가져와 주입해 줄 DATABASE_URL 환경 변수를 직접 사용합니다.
// 로컬 개발 시에는 .env 파일에 이 변수가 정의되어 있어야 합니다.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다. .env 파일을 확인하거나 Kubernetes 설정을 확인하세요.');
}

const pool = new Pool({
  connectionString,
  // (선택사항) 클라우드 환경에서는 SSL 연결을 강제하는 것이 보안에 좋습니다.
  // ssl: {
  //   rejectUnauthorized: false 
  // }
});

module.exports = pool;