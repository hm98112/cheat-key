const { Pool } = require('pg');
require('dotenv').config(); // .env 파일의 변수들을 process.env로 로드

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // 필요한 경우 SSL 설정 등 추가
});

module.exports = pool;