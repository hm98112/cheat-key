/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
// 'export const' -> 'exports.' 로 변경
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// 'export const' -> 'exports.' 로 변경
exports.up = (pgm) => {
  // 1. 순서가 중요하지 않은 독립적인 테이블부터 생성합니다.
  pgm.sql(`
    -- 게임 종류를 정의하는 테이블
    CREATE TABLE game_types (
      game_type_id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT
    );
    -- 사용자 계정 정보를 관리하는 테이블
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      role VARCHAR(20) DEFAULT 'user' NOT NULL,
      status VARCHAR(20) DEFAULT 'active' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );
  `);

  // 2. 다른 테이블을 참조하는 종속적인 테이블들을 생성합니다.
  pgm.sql(`
    -- 사용자의 게임별 ELO 점수를 관리하는 테이블
    CREATE TABLE user_game_ratings (
      rating_id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
      game_type_id INT REFERENCES game_types(game_type_id) ON DELETE CASCADE NOT NULL,
      elo_rating INT DEFAULT 1200 NOT NULL,
      UNIQUE (user_id, game_type_id)
    );

    -- 게임 세션 정보를 기록하는 테이블
    CREATE TABLE games (
      game_id SERIAL PRIMARY KEY,
      game_type_id INT REFERENCES game_types(game_type_id) NOT NULL,
      status VARCHAR(20) NOT NULL,
      winner_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
      started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      ended_at TIMESTAMPTZ
    );

    -- 게임 참여자 정보를 기록하는 테이블
    CREATE TABLE game_participants (
      participant_id SERIAL PRIMARY KEY,
      game_id INT REFERENCES games(game_id) ON DELETE CASCADE NOT NULL,
      user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
      initial_elo INT NOT NULL,
      final_elo INT NOT NULL
    );


    -- 초기 데이터 삽입: 기본 게임 종류 추가
    INSERT INTO game_types (name, description) VALUES
    ('Tetris', 'Classic Tetris game');
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// 'export const' -> 'exports.' 로 변경
exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS game_participants;
    DROP TABLE IF EXISTS games;
    DROP TABLE IF EXISTS user_game_ratings;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS game_types;
  `);
};
