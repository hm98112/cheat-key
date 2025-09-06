const redis = require('redis');

// Kubernetes가 Key Vault에서 주입해 줄 REDIS_HOST와 REDIS_PASS 환경 변수를 사용합니다.
const redisHost = process.env.REDIS_HOST;
const redisPass = process.env.REDIS_PASS;

if (!redisHost) {
  throw new Error('REDIS_HOST 환경 변수가 설정되지 않았습니다. .env 파일을 확인하거나 Kubernetes 설정을 확인하세요.');
}

const redisClient = redis.createClient({
  // redis[s]://[[username][:password]@][host][:port][/db-number]
  url: `redis://:${redisPass}@${redisHost}:6379`
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis server!');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// 비동기 함수로 클라이언트를 연결합니다.
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;