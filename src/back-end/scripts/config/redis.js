<<<<<<< HEAD
// config/redis.js

const redis = require('redis');

// 환경 변수 존재 여부 확인
const requiredEnvVars = ['REDIS_HOST', 'REDIS_PASS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(`❌ Redis 설정 오류: 필수 환경 변수가 없습니다: ${missingVars.join(', ')}`);
    process.exit(1);
}

const redisUrl = `rediss://:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:6380`;

// 클라이언트 인스턴스를 생성하고 바로 내보냅니다.
const redisClient = redis.createClient({
    url: redisUrl,
    socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                return new Error('Redis 연결 재시도 횟수를 초과했습니다.');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('connect', () => console.log('🔄 Redis 서버에 연결을 시도합니다...'));
redisClient.on('ready', () => console.log('✅ Redis 서버에 성공적으로 연결되었습니다!'));
redisClient.on('error', (err) => console.error('❌ Redis 클라이언트 오류:', err.message));
redisClient.on('end', () => console.log('🔌 Redis 연결이 종료되었습니다.'));

// 연결 로직을 별도의 함수로 분리하여 내보냅니다.
async function connectRedis() {
    try {
        if (redisClient.isOpen) {
            console.log('이미 Redis에 연결되어 있습니다.');
            return;
        }
        await redisClient.connect();
        const pingResponse = await redisClient.ping();
        if (pingResponse !== 'PONG') {
            throw new Error('Redis 서버로부터 PONG 응답을 받지 못했습니다.');
        }
        console.log('✅ Redis PING-PONG 테스트 성공. 서비스 준비 완료.');
    } catch (err) {
        console.error('❌ Redis 초기 연결 실패:', err.message);
        process.exit(1);
    }
}

module.exports = { redisClient, connectRedis };
=======
/**
 * @file redis.js
 * @brief Redis 클라이언트를 설정하고 내보내는 모듈
 * @details 이 파일은 node-redis 라이브러리를 사용하여 Redis 서버와의 연결을 관리하는
 * 클라이언트 인스턴스를 생성하고 초기화합니다. 이 인스턴스는 애플리케이션 전체에서 공유됩니다.
 */


// --- 모듈 임포트 ---
// Node.js용 Redis 클라이언트 라이브러리인 'redis'를 가져옵니다.
const redis = require('redis');

// --- Redis 클라이언트 생성 ---
// Redis 서버와 통신하기 위한 클라이언트 인스턴스를 생성합니다.
// 별도의 설정이 없으면 기본적으로 'redis://localhost:6379'에 연결을 시도합니다.
// 운영 환경 등 다른 서버에 연결하려면 { url: 'redis://user:password@host:port' }와 같이
// 연결 정보를 인자로 전달할 수 있습니다.
const redisClient = redis.createClient();

// --- 이벤트 리스너 설정 ---
// Redis 서버에 성공적으로 연결되었을 때 발생하는 'connect' 이벤트의 리스너입니다.
redisClient.on('connect', () => {
  // 디버깅: Redis 연결 성공 로그를 확인하고 싶을 때 아래 줄의 주석을 해제하세요.
  // console.log('✅ Connected to Redis server!');
});

// 연결 중 오류가 발생했을 때 발생하는 'error' 이벤트의 리스너입니다.
redisClient.on('error', (err) => {
  // 디버깅: Redis 연결 오류를 확인하고 싶을 때 아래 줄의 주석을 해제하세요.
  // console.error('❌ Redis connection error:', err);
});

// --- Redis 클라이언트 연결 ---
// 애플리케이션 시작 시 Redis 서버에 연결을 시도합니다.
// Node-redis 라이브러리 v4부터는 connect()를 명시적으로 호출해 주어야 합니다.
// 즉시 실행 비동기 함수(IIAFE) 패턴을 사용하여 모듈이 로드되는 시점에 바로 연결을 수행합니다.
(async () => {
  await redisClient.connect();
})();

// --- 모듈 내보내기 ---
// 설정 및 연결이 완료된 redisClient 인스턴스를 내보냅니다.
// 애플리케이션의 다른 부분에서 이 모듈을 require() 하면, 항상 동일한 클라이언트 인스턴스를
// 공유하며 사용하게 됩니다 (이는 싱글톤 패턴과 유사하게 동작합니다).
module.exports = redisClient;
>>>>>>> origin/back-end
