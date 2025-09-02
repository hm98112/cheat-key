# 🎯 온라인 매칭 게임 개발 시나리오
## 1. 주요 기능 목록 (Features)
회원 관리: 소셜 로그인을 포함한 가입/탈퇴, 로그인/로그아웃 등 기본적인 사용자 인증 기능.

회원 정보: 승률, 전적, ELO, 랭킹 등 개인 프로필을 통해 사용자의 성취감과 동기를 부여.

게임 매칭: ELO 기반 실력별 매칭(SBMM) 시스템. 매칭 시작, 대기, 성공/실패 플로우를 포함하여 공정한 게임 경험을 제공.

게임 플레이: 실시간 게임 진행, 결과 전송, 연결 끊김 및 재접속 처리, JWT 토큰 재발급 등 핵심 플레이 로직.

부가 기능: 게임 직후 상대와 바로 다시 플레이할 수 있는 재대결 요청 기능.

랭킹 시스템: 시즌별/전체 사용자 랭킹을 보여주는 리더보드. 경쟁을 유도하고 장기적인 목표를 제시.

관리자 기능: 운영팀을 위한 관리자 페이지. 서버 모니터링, 유저 조회 및 제재(Ban) 등 안정적인 운영을 지원.

게임 확장: 새로운 게임 모드나 종류 추가를 대비한 게임 선택 로비. 서비스 확장성을 위한 기반 설계.

## 2. 단계별 개발 계획 (Phased Roadmap)
### Phase 1: 핵심 게임 플레이 루프 구현 (MVP)
목표: 사용자가 회원가입 후 실제 게임 한 판을 온전히 끝마칠 수 있는 핵심적인 기능 흐름을 완성합니다.

- 시나리오 1: 회원 관리 (가입 및 로그인)  
    - Front-end (React)  
        - UI 개발  
            메인 페이지 (로그인/로그아웃 상태에 따라 UI 분기 처리)  
            회원가입 페이지 (Sign-up Form)  
            로그인 페이지 (Log-in Form)  

        - API 연동  
            회원가입, 로그인 API 호출 및 서버 응답(성공/실패) 처리  
            사용자에게 에러 메시지 표시  

        - 상태 관리  
            로그인 성공 시 받은 **JWT(토큰)**를 안전하게 저장 (HttpOnly Cookie 등)  
            사용자의 로그인 상태를 전역(Global)으로 관리  
        - 기술 스택: React, Axios, Recoil/Redux
    - Back-end (Node.js - User Service)
        - API 개발  
            POST /api/users/signup: 회원가입 요청 처리  
            POST /api/auth/login: 로그인 요청 처리  

        - 데이터베이스  
            스키마 설계: Users 테이블 (user_id, username, password 등)  
            연동: Azure PostgreSQL 서버와 애플리케이션 연동  

        - 비즈니스 로직  
            비밀번호 암호화: bcrypt를 사용한 해싱 처리  
            인증: jsonwebtoken을 사용한 JWT(Access/Refresh Token) 생성 및 발급  

        - 기술 스택: Node.js, Express, pg, jsonwebtoken, bcrypt  
    - CI/CD 및 배포 (DevOps)  
        - CI (Continuous Integration) 파이프라인  
            GitHub Push 시 자동 빌드 및 테스트 실행  
            Front-end, Back-end Docker 이미지 생성 후 **ACR(Azure Container Registry)**에 Push  
        - CD (Continuous Deployment) 파이프라인  
            ArgoCD를 사용하여 ACR의 최신 이미지를 **AKS(Azure Kubernetes Service)**에 자동으로 배포 (GitOps)  
        - 인프라 구성 (IaC)  
            K8s 매니페스트: Deployment, Service, Ingress 등 YAML 파일 정의
        - DB 연결 관리  
            Kubernetes Secret을 사용하여 PostgreSQL 연결 정보를 안전하게 Back-end 컨테이너에 환경 변수로 주입  

- 시나리오 3 & 4: 게임 매칭 및 진행  
    - Front-end (React)  
        - UI 상태 관리  
            기본: '게임 찾기' 버튼 활성화  
            대기: POST /api/matchmaking/queue 호출 후 "상대 찾는 중..." 모달 및 '매칭 취소' 버튼 표시  
            성공: WebSocket으로 match_success 이벤트 수신 후, 게임 페이지로 즉시 이동  
        - 핵심 기술: React, Axios, WebSocket (Socket.IO 등)  
    - Back-end (Matchmaking & Game Service)  
        - API 개발  
            POST /api/matchmaking/queue: 요청 사용자를 Redis 대기열에 추가  
            DELETE /api/matchmaking/queue: Redis 대기열에서 사용자 제거  
        - 대기열 관리 (Redis)  
            Sorted Set을 사용하여 ELO 점수 기반의 실시간 대기열 구현  
        - 매칭 로직  
            주기적으로 Redis를 스캔하여 ELO 점수가 비슷한 사용자 매칭  
        - 서비스 연동 및 실시간 통신 (WebSocket)  
            Game-Service에 게임 세션 생성 요청  
            두 사용자에게 WebSocket으로 매칭 성공 알림 및 게임 세션 정보 전송  
            게임 진행 중 발생하는 모든 상호작용을 WebSocket으로 중계  
        - 핵심 기술: Node.js, Express, Redis, WebSocket  
    - Database  
        - PostgreSQL (영구 저장)
            Games 테이블: 게임 종료 후 결과 데이터 저장 (game_id, start_time, winner_id 등)  
            GameParticipants 테이블: 게임 참여자 기록  
        - Redis (휘발성/캐시 저장)  
            실시간 매칭 대기열 관리  

### Phase 2: 사용자 경험 및 동기부여 강화
목표: 사용자의 재방문을 유도하기 위해 성취감, 편의성 등 부가 기능을 개발하여 사용자 유지율(Retention)을 높입니다.

- 시나리오 2 & 6: 회원 정보 및 랭킹 시스템  
    - Front-end (React)  
        - UI 개발: '내 정보(마이페이지)', '리더보드' 페이지 구현  
        - API 연동: 전적, ELO, 랭킹 정보를 API로 호출하여 화면에 표시  
    - Back-end (User & Ranking Service)  
        - API 개발  
            GET /api/users/me/history: 내 전적 기록 조회  
            GET /api/ranking/leaderboard: 상위 랭킹 사용자 목록 조회  
    - 로직 및 데이터베이스  
        - User Service: PostgreSQL에서 특정 유저의 게임 기록 조회  
        - Ranking Service: PostgreSQL의 Users 테이블을 elo_rating 기준으로 정렬. Redis에 리더보드 정보를 캐싱하여 조회 성능 최적화.  

- 시나리오 4 & 5: JWT 재발급 및 재대결  
    - Front-end (React)  
        - UI 개발: 게임 결과 화면에 '재대결' 버튼 추가  
        - 로직 구현  
            API 요청 시 401 에러가 발생하면 Refresh Token으로 새로운 Access Token을 요청하는 로직 구현  
            '재대결' 버튼 클릭 시 WebSocket으로 재대결 요청 이벤트 전송  
    - Back-end (User & Game Service)  
        - API 개발: POST /api/auth/refresh (in User Service)  
        - 로직 구현  
            User Service: Refresh Token을 검증하고 새로운 Access Token을 발급  
            Game Service: WebSocket을 통해 재대결 요청을 상대방에게 전달하고, 양측이 수락하면 새로운 게임 세션을 즉시 생성  

### Phase 3: 서비스 운영 및 확장성 확보
목표: 안정적이고 지속 가능한 서비스를 위해 운영 도구를 만들고, 예외 상황 대응 및 향후 확장성을 위한 기술 기반을 마련합니다.

- 시나리오 7: 관리자 기능  
    - Front-end (React)  
        - UI 개발: 별도의 관리자용 대시보드 페이지 구현 (관리자 계정으로만 접근 가능)  
    - Back-end (Admin Service)  
        - API 개발: 사용자 조회, 제재(Ban), 서버 상태 모니터링 API 구현  
        - 인증/인가: 관리자 역할(Role) 기반의 접근 제어 로직 구현  

- 시나리오 4 & 8: 재접속 처리 및 게임 확장  
    - Front-end (React)  
        - UI 개발: 여러 게임을 선택할 수 있는 로비(Lobby) 화면 구현  
        - 로직 구현: WebSocket 연결이 끊겼을 때 자동으로 재연결을 시도하는 로직 추가  
    - Back-end (Matchmaking & Game Service)  
        - 로직 구현  
            Matchmaking Service: 게임 종류별로 별도의 매칭 대기열을 관리하도록 로직 확장  
            Game Service: Redis에 진행 중인 게임 상태를 임시 저장하여, 사용자가 재접속 시 이전 세션에 복귀할 수 있도록 처리  
        - 데이터베이스: Games 테이블에 game_type과 같은 컬럼을 추가하여 어떤 게임인지 구분  

- 시나리오 1: 회원 탈퇴 및 로그아웃  
    - Front-end (React)  
        - UI 개발: '로그아웃', '회원 탈퇴' 버튼 및 관련 확인 모달 구현  
    - Back-end (User Service)  
        - API 개발  
            POST /api/auth/logout: 로그아웃 처리 (Refresh Token 무효화 등)  
            DELETE /api/users/me: 회원 탈퇴 처리 (사용자 데이터 삭제 또는 비활성화)  