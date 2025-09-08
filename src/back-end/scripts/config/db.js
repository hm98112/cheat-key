const { Pool } = require('pg');

// Azure Key Vault에서 주입된 환경 변수 사용
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
  // 연결 풀 설정
  max: 10, // 최대 연결 수
  min: 2,  // 최소 연결 수
  idle_timeout: 30000, // 30초
  connectionTimeoutMillis: 10000, // 10초
});

// 서버 시작 시 DB 연결 테스트
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 오류:', err.stack);
    return;
  }
  console.log('✅ PostgreSQL 데이터베이스에 성공적으로 연결되었습니다.');
  release(); // 연결 테스트 후 반드시 반환
});

module.exports = pool;