const redis = require('redis');

// 로컬 Redis 서버에 연결하기 위한 클라이언트를 생성합니다.
// 기본적으로 localhost:6379에 연결을 시도합니다.
const redisClient = redis.createClient();

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis server!');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// 비동기 함수로 클라이언트를 연결합니다.
// Node-redis v4부터는 connect()를 명시적으로 호출해야 합니다.
(async () => {
  await redisClient.connect();
})();

// 다른 파일에서 이 클라이언트를 가져와 사용할 수 있도록 내보냅니다.
module.exports = redisClient;
