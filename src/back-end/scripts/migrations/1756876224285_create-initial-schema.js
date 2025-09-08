/**
 * @file 1756876224285_create-initial-schema.js (파일명은 생성 시점에 따라 다름)
 * @brief node-pg-migrate를 사용한 초기 데이터베이스 스키마 정의 파일
 * @details 이 마이그레이션 파일은 프로젝트에 필요한 모든 테이블과 관계를 생성합니다.
 * 'up' 함수는 스키마를 생성하고, 'down' 함수는 생성된 스키마를 제거(롤백)하는 역할을 합니다.
 */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
// node-pg-migrate의 단축키(shorthands) 기능 설정입니다. 여기서는 사용하지 않으므로 undefined로 둡니다.
exports.shorthands = undefined;

/**
 * 'up' 마이그레이션: 데이터베이스에 변경사항을 적용합니다 (테이블 생성 등).
 * @param pgm {import('node-pg-migrate').MigrationBuilder} - 마이그레이션 작업을 수행하는 빌더 객체
 */
exports.up = (pgm) => {
  // --- 1. 독립적인 테이블 생성 ---
  // 다른 테이블을 참조하지 않아 먼저 생성해야 하는 테이블들입니다.
  pgm.sql(`
    -- game_types: 게임의 종류('테트리스', '체스' 등)를 정의하는 마스터 테이블
    CREATE TABLE game_types (
      game_type_id SERIAL PRIMARY KEY,      -- 게임 종류 고유 ID (자동 증가)
      name VARCHAR(50) UNIQUE NOT NULL,     -- 게임 이름 (중복 불가)
      description TEXT                      -- 게임에 대한 설명
    );

    -- users: 사용자 계정 정보를 관리하는 테이블
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,                     -- 사용자 고유 ID (자동 증가)
      username VARCHAR(50) UNIQUE NOT NULL,           -- 사용자 닉네임 (중복 불가)
      email VARCHAR(100) UNIQUE NOT NULL,             -- 사용자 이메일 (중복 불가)
      password_hash VARCHAR(100) NOT NULL,            -- 해시된 비밀번호
      role VARCHAR(20) DEFAULT 'user' NOT NULL,       -- 사용자 권한 ('user', 'admin')
      status VARCHAR(20) DEFAULT 'active' NOT NULL,   -- 계정 상태 ('active', 'banned' 등)
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,  -- 계정 생성 시각 (타임존 포함)
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL   -- 마지막 정보 수정 시각 (타임존 포함)
    );
  `);

  // --- 2. 종속적인 테이블 생성 ---
  // 위에서 생성한 테이블들을 외래 키(Foreign Key)로 참조하는 테이블들입니다.
  pgm.sql(`
    -- user_game_ratings: 사용자의 게임별 ELO 점수를 저장하는 테이블
    CREATE TABLE user_game_ratings (
      rating_id SERIAL PRIMARY KEY,
      
      -- user_id: 'users' 테이블의 user_id를 참조합니다.
      -- ON DELETE CASCADE: 참조하는 user 레코드가 삭제되면, 해당 유저의 ELO 기록도 함께 삭제됩니다.
      user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
      
      -- game_type_id: 'game_types' 테이블의 game_type_id를 참조합니다.
      -- ON DELETE CASCADE: 참조하는 게임 종류 레코드가 삭제되면, 해당 게임 종류의 모든 유저 ELO 기록도 함께 삭제됩니다.
      game_type_id INT REFERENCES game_types(game_type_id) ON DELETE CASCADE NOT NULL,

       -- ELO 점수 (기본값 1200)
      elo_rating INT DEFAULT 1200 NOT NULL,

      -- UNIQUE 제약 조건: 한 명의 유저는 하나의 게임 종류에 대해 하나의 ELO 점수만 가질 수 있습니다.
      UNIQUE (user_id, game_type_id)
    );

    -- games: 개별 게임 세션(한 판의 게임) 정보를 기록하는 테이블
    CREATE TABLE games (
      game_id SERIAL PRIMARY KEY
      game_type_id INT REFERENCES game_types(game_type_id) NOT NULL,

      -- 게임 상태 ('in_progress', 'finished')
      status VARCHAR(20) NOT NULL,
      
      -- winner_user_id: 승리한 유저의 ID. 'users' 테이블을 참조합니다.
      -- ON DELETE SET NULL: 만약 승리한 유저의 계정이 삭제되더라도 게임 기록은 남기고, 승자 정보만 NULL로 변경합니다.
      winner_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,

      -- 게임 시작 시각
      started_at TIMESTAMPTZ DEFAULT now() NOT NULL,

      -- 게임 종료 시각
      ended_at TIMESTAMPTZ
    );

    -- game_participants: 특정 게임 세션에 어떤 유저들이 참여했는지 기록하는 테이블
    CREATE TABLE game_participants (
      participant_id SERIAL PRIMARY KEY,

      -- game_id: 'games' 테이블의 game_id를 참조. 게임이 삭제되면 참여자 기록도 삭제(CASCADE).
      game_id INT REFERENCES games(game_id) ON DELETE CASCADE NOT NULL,

      -- user_id: 'users' 테이블의 user_id를 참조. 유저가 삭제되면 참여자 기록도 삭제(CASCADE).
      user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
      
      -- 게임 시작 시점의 ELO 점수
      initial_elo INT NOT NULL,

      -- 게임 종료 후의 ELO 점수
      final_elo INT
    );


    -- 초기 데이터(Seed Data) 삽입: 'Tetris'라는 기본 게임 종류를 추가합니다.
    -- 이렇게 해야 서버가 시작될 때 최소한 하나의 게임 종류가 존재하게 됩니다.
    INSERT INTO game_types (name, description) VALUES
    ('Tetris', 'Classic Tetris game');
  `);
};

/**
 * 'down' 마이그레이션: 'up'으로 적용된 변경사항을 되돌립니다 (테이블 삭제 등).
 * @param pgm {import('node-pg-migrate').MigrationBuilder} - 마이그레이션 작업을 수행하는 빌더 객체
 */
exports.down = (pgm) => {
  // 테이블을 삭제할 때는 생성 순서의 역순으로 진행해야 합니다.
  // 외래 키 제약 조건으로 인해, 다른 테이블에 의해 참조되고 있는 테이블은 먼저 삭제할 수 없기 때문입니다.
  // (삭제 순서: participants -> games -> ratings -> users -> types)
  pgm.sql(`
    DROP TABLE IF EXISTS game_participants;
    DROP TABLE IF EXISTS games;
    DROP TABLE IF EXISTS user_game_ratings;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS game_types;
  `);
};
