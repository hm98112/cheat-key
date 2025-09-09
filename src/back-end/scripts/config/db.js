/**
 * @file db.js
 * @brief PostgreSQL 데이터베이스 연결 풀(Pool)을 설정하고 내보내는 모듈
 * @details 이 파일은 node-postgres (pg) 라이브러리를 사용하여 데이터베이스 커넥션 풀을 생성합니다.
 * 애플리케이션 전체에서 이 모듈을 통해 DB와 통신하게 됩니다.
 */

// --- 모듈 임포트 ---
// node-postgres 라이브러리에서 Pool 클래스를 가져옵니다.
const { Pool } = require('pg');
// dotenv 라이브러리를 사용하여 .env 파일에 정의된 환경 변수를 process.env 객체에 로드합니다.
// DB 접속 정보와 같은 민감한 데이터를 코드에서 분리하여 보안과 관리 용이성을 높입니다.
require('dotenv').config();

// --- 데이터베이스 커넥션 풀 생성 ---
// new Pool()은 여러 클라이언트가 DB에 접속할 때 커넥션을 효율적으로 관리해주는
// 커넥션 풀을 생성합니다. 요청이 있을 때마다 커넥션을 새로 생성하고 해제하는 비용을 줄여
// 애플리케이션의 전반적인 성능을 향상시킵니다.
const pool = new Pool({
  user: process.env.DB_USER,         // 데이터베이스 사용자 이름 (.env 파일에서 설정)
  host: process.env.DB_HOST,         // 데이터베이스 서버 호스트 주소 (.env 파일에서 설정)
  database: process.env.DB_DATABASE, // 연결할 데이터베이스 이름 (.env 파일에서 설정)
  password: process.env.DB_PASSWORD, // 데이터베이스 접속 비밀번호 (.env 파일에서 설정)
  port: process.env.DB_PORT,         // 데이터베이스 포트 번호 (.env 파일에서 설정)
  // 필요한 경우 SSL 설정 등 추가
});

// 생성된 커넥션 풀 객체를 모듈로 내보냅니다.
// 이제 다른 파일에서 require('../config/db')를 통해 이 pool 객체를 임포트하여
// 데이터베이스 쿼리를 실행할 수 있습니다.
module.exports = pool;