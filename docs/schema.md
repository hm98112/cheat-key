# 온라인 매칭 게임 데이터베이스 스키마 (게임별 ELO 적용)

## 개요 (ERD - Entity Relationship Diagram)  

    erDiagram
    users {
        INT user_id PK
        VARCHAR username UK
        VARCHAR password_hash
        VARCHAR role
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    games {
        INT game_id PK
        INT game_type_id FK
        VARCHAR status
        INT winner_user_id FK
        TIMESTAMP started_at
        TIMESTAMP ended_at
    }

    game_participants {
        INT participant_id PK
        INT game_id FK
        INT user_id FK
        INT initial_elo
        INT final_elo
    }
    
    game_types {
        INT game_type_id PK
        VARCHAR name UK
        TEXT description
    }

    user_game_ratings {
        INT rating_id PK
        INT user_id FK
        INT game_type_id FK
        INT elo_rating
    }

    users ||--o{ game_participants : "participates in"
    games ||--|{ game_participants : "has"
    games }|--|| game_types : "is of type"
    users ||--o{ games : "can win"
    users ||--o{ user_game_ratings : "has rating for"
    game_types ||--o{ user_game_ratings : "defines rating for"

## 테이블 상세 정의
### 1. users 테이블
사용자의 계정 정보, 역할, 상태 등을 관리합니다.  

| 컬럼명 | 데이터 타입 | 제약 조건 |설명 | 
|-------|-------|-------|-------|
| user_id | SERIAL | PRIMARY KEY |사용자 고유 식별자 (자동 증가)|
| username | VARCHAR(50) | UNIQUE, NOT NULL |사용자 닉네임 (중복 불가)|
<<<<<<< HEAD
=======
| email | VARCHAR(50) | UNIQUE, NOT NULL |사용자 이메일 (중복 불가)|
>>>>>>> origin/back-end
|password_hash|VARCHAR(100)|NOT NULL|비밀번호 (Bcrypt로 해싱하여 저장)|
|role|VARCHAR(20)|DEFAULT 'user'|사용자 역할 ('user', 'admin')|
|status|VARCHAR(20)|DEFAULT 'active'|계정 상태 ('active', 'banned', 'deleted')|
|created_at|TIMESTAMPZ|DEFAULT now()|계정 생성 시각|
|updated_at|TIMESTAMPZ|DEFAULT now()|정보 마지막 수정 시각|
  

### 2. game_types 테이블  
서비스가 제공하는 게임의 종류를 정의합니다.  

| 컬럼명 | 데이터 타입 | 제약 조건 |설명 | 
|-------|-------|-------|-------|
| game_type_id | SERIAL | PRIMARY KEY |게임 종류 고유 식별자|
| name | VARCHAR(50) | UNIQUE, NOT NULL |게임 이름 (예: '테트리스')|

  
### 3. user_game_ratings 테이블
사용자의 게임별 ELO 점수를 관리하는 핵심 테이블입니다.

| 컬럼명 | 데이터 타입 | 제약 조건 |설명 | 
|-------|-------|-------|-------|
| rating_id | SERIAL | PRIMARY KEY | 레이팅 기록 고유 식별자|
| user_id | SERIAL | FK (users) |사용자의 ID|
|game_type_id|SERIAL|FK (game_types)|게임 종류의 ID|
|elo_rating|INT|DEFAULT 1200 <br> UNIQUE (user_id, game_type_id)|해당 게임에 대한 사용자의 ELO 점수 <br> 한 사용자는 한 게임에 대해 하나의 ELO만 가짐|


### 4. games 테이블
한 판의 게임 세션 정보를 기록합니다.


| 컬럼명 | 데이터 타입 | 제약 조건 |설명 | 
|-------|-------|-------|-------|
| game_id | SERIAL | PRIMARY KEY | 게임 고유 식별자 (세션 ID)|
| game_type_id | SERIAL | FK (game_types) |게임 종류의 ID|
|status|VARCHAR(20)|NOT NULL|게임 상태 ('in_progress', 'completed', 'abandoned')|
|winner_user_id|SERIAL|FK (users)|승리한 사용자의 ID (무승부나 중단 시 NULL)|
| started_at | TIMESTAMPZ | DEFAULT now() | 게임 시작 시각|
| ended_at | TIMESTAMPZ |  |게임 종료 시각|



### 5. game_participants 테이블
특정 게임 세션에 어떤 사용자들이 참여했는지 기록하는 연결 테이블입니다.

| 컬럼명 | 데이터 타입 | 제약 조건 |설명 | 
|-------|-------|-------|-------|
| participant_id | SERIAL | PRIMARY KEY | 참여 기록 고유 식별자|
| game_id | SERIAL |FK (games) |게임 고유 식별자 (세션 ID)|
|user_id|SERIAL|FK (users)|참여한 사용자의 ID|
|initial_elo|INT|NOT NULL|게임 시작 시점의 ELO 점수|
<<<<<<< HEAD
| final_elo | INT | NOT NULL | 게임 종료 후 변동된 ELO 점수|
=======
| final_elo | INT |  | 게임 종료 후 변동된 ELO 점수|
>>>>>>> origin/back-end

