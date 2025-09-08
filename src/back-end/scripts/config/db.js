const { Pool } = require('pg');

let pool; // pool 변수를 외부 스코프에 선언

// 데이터베이스 초기화 함수
function initializeDatabase() {
  // 필수 DB 환경 변수가 모두 설정되었는지 확인합니다.
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'DB_DATABASE'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`❌ 데이터베이스 연결 오류: 다음 필수 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
    console.error('app.js의 Key Vault 설정 또는 .env 파일을 확인해주세요.');
    process.exit(1);
  }
  
  const dbConfig = {
    host: process.env['DB_HOST'],
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    port: process.env['DB_PORT'],
    database: process.env['DB_DATABASE'],
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  // 데이터베이스 연결 풀 생성
  pool = new Pool(dbConfig);

  // 서버가 시작될 때 데이터베이스 연결을 한번 테스트합니다.
  return pool.query('SELECT NOW()')
    .then(res => console.log('✅ PostgreSQL 데이터베이스에 성공적으로 연결되었습니다. 현재 시간:', res.rows[0].now))
    .catch(err => {
      console.error('❌ 데이터베이스 초기 연결 테스트 실패:', err.stack);
      process.exit(1);
    });
}

// 다른 파일에서 사용할 수 있도록 pool 객체를 반환하는 함수
function getDbPool() {
    if (!pool) {
        throw new Error('데이터베이스가 초기화되지 않았습니다. initializeDatabase()를 먼저 호출하세요.');
    }
    return pool;
}

module.exports = { initializeDatabase, getDbPool };