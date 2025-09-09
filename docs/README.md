# 서버 실행 메뉴얼(로컬)
## 1. GitHub 레포지토리에서 소스 코드를 가져온다.

- 1-1. 프로젝트 폴더를 하나 만든다.

- 1-2. 해당 폴더를 VScode로 연다. (파일 탐색기에서 우클릭 후 code.) 

- 1-3 VScode 터미널을 통해 원격 레포지토리의 내용을 클론한다.

- ``` git clone https://github.com/hm98112/cheat-key.git ```

## 2. 서버 구성에 필요한 모듈을 다운 받는다.

- 2-1 먼저 터미널에서 프로젝트 root 폴더 경로로 이동한 다음   
```npm run i``` 를 실행한다.

## 3. 데이터 베이스 연결을 위한 준비를 한다.

- 3-1 redis 로컬 서버를 실행한다.

- 3-2 PostgreSQL 연결 문자열을 담은 .env 파일을 root/src/back-end/ 경로에 추가한다.

- 3-3 access token secrete 과 refresh token secrete 을 추가한다.

    .env 파일 example

    DB_USER=postgres  
    DB_HOST=localhost  
    DB_DATABASE=postgres  
    DB_PASSWORD=1234  
    DB_PORT=5432  
    DATABASE_URL=postgres://postgres:1234@localhost:5432/postgres  
    JWT_SECRET=아무거나 긴 문자열을 추가 111  
    REFRESH_TOKEN_SECRET=아무거나 긴 문자열 추가 222

## 4. 데이터 베이스 연결

- 4-1 redis 서버는 열어두면 자동으로 연결 됨(로컬 환경에서)

- 4-2 root/src/back-end 경로로 이동해서 데이터베이스 마이그레이션을 진행한다.

    ``` cd .\src\back-end\ && npm run migrate:up ```

    데이터베이스 생성이 자동으로 진행 되고 migration 성공 메시지가 나오면 모든 설정 완료

## 5. 서버 구동

- root 폴더 경로에서 다음 명령어를 실행한다.

    ``` npm run dev ```  
- 즐거운 개발 되세요~



# 가상 머신 네이밍 규칙

## 1. 가상 네트워크 이름 'vnet-프로젝트명'
    ex) vnet-cheatkey

## 2. 서브 넷 이름 'snet-역할'
    ex) snet-frontend

## 3. 가상 머신 이름 'vm-역할+번호'
    ex) vm-frontend01
- 모두 소문자

## 4. 키 쌍 이름 '역할_key'
    ex) frontend01_key

## 5. DDos Protection 플랜 'ddos-가상네트워크 이름'
    ex) ddos-vnet-cheatkey


## 가상 네트워크 스펙
- 리소스 그룹: cheat-key
- 가상 네트워크 이름: vnet-cheatkey
- 지역: korea central
- 보안: 가상 네트워크 암호화 체크 (가상 머신에서 가속화된 네트워킹 사용 설정 필요, 공용 IP에 대한 트래픽은 암호화되지 않음)
- Azure DDoS 네트워크 보호: 사용
- DDoS Protection 플랜: 신규 생성(ddos-vnet-cheatkey)

### 서브넷 설정
- IPv4 주소 범위: 10.0.0.0/16 (65536개)
- 프론트 엔드: 10.0.1.0/24 (256개)
- 백 엔드: 10.0.2.0/24 (256개)  
    프라이빗 서브넷 사용(기본 아웃바운드 액세스 없음)

## 가상 머신 스펙
- 리소스 그룹: cheat-key
- 가상 머신 이름:
 프론트: vm-frontend01
 백: vm-backend01
- 지역: korea central
- 가용성 옵션: 인프라 중복이 필요하지 않습니다.
- 보안 유형: 표준
- 이미지: Ubuntu Server 22.04 LTS
- VM 아키텍쳐: x64
- 크기: Standard_D2s_v5 (2vcpu, 8GiB)
- 인증 형식: ssh
- 사용자 이름: cheatadmin
- SSH 공개 키 원본: 새 키 쌍 생성
- SSH 키 유형: RSA SSH 형식
