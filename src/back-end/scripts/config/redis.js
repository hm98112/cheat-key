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