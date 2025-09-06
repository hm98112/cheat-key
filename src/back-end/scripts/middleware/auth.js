const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  // 1. 요청 헤더에서 'Authorization' 토큰을 가져옵니다.
  const authHeader = req.header('Authorization');

  // 2. 헤더에 토큰이 없는 경우
  if (!authHeader) {
    return res.status(401).json({ message: '인증 토큰이 없어 접근이 거부되었습니다.' }); // 401 Unauthorized
  }

  try {
    // 3. 토큰 형식(Bearer <token>) 확인 및 파싱
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '잘못된 형식의 토큰입니다.' });
    }

    // 4. 토큰 검증
    //    .env 파일에 정의된 JWT_SECRET을 사용하여 토큰의 유효성을 검사합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. 검증 성공 시, 요청 객체(req)에 사용자 정보(payload)를 추가합니다.
    //    이제 이 미들웨어를 사용하는 모든 API 핸들러에서 req.user로 사용자 정보에 접근할 수 있습니다.
    req.user = decoded;

    // 6. 다음 미들웨어 또는 API 핸들러로 제어를 넘깁니다.
    next();
  } catch (err) {
    console.error('JWT 검증 오류:', err);
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = auth;
