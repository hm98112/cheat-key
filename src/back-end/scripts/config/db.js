const { Pool } = require('pg');
require('dotenv').config(); // .env 파일의 변수들을 process.env로 로드

const pool = new Pool({
  connectionString: "postgresql://psqladmin:YourStrongPassword123!@tetrisgame-psql-server.postgres.database.azure.com:5432/tetrisgamedb?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

// 서버 시작 시 DB 연결 테스트
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ 데이터베이스 연결 오류:', err.stack);
  }
  console.log('✅ PostgreSQL 데이터베이스에 성공적으로 연결되었습니다.');
  release(); // 연결 테스트 후 반드시 반환
});


module.exports = pool;