const redis = require('redis');

// Azure Key Vault에서 주입된 환경 변수 사용
const redisHost = process.env.REDIS_HOST;
const redisPass = process.env.REDIS_PASS;

if (!redisHost || !redisPass) {
  console.error('❌ REDIS_HOST 또는 REDIS_PASS 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const redisClient = redis.createClient({
  url: `rediss://${redisHost}:6380`,
  password: redisPass,
  socket: {
    connectTimeout: 10000,
    commandTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (retries > 5) return new Error('Redis 연결 재시도 초과');
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('connect', () => {
  console.log('✅ Redis 서버에 연결을 시도하고 있습니다...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis 서버에 성공적으로 연결되었습니다!');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis 연결 오류:', err.message);
});

redisClient.on('end', () => {
  console.log('🔌 Redis 연결이 종료되었습니다.');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis 서버에 다시 연결을 시도하고 있습니다...');
});

// 비동기 함수로 클라이언트를 연결합니다.
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;