/**
 * @file auth.js
 * @brief JWT(JSON Web Token)를 검증하여 API 요청을 인증하는 Express 미들웨어
 * @details 이 미들웨어는 API 요청 헤더의 'Authorization'에 담긴 Access Token을 검증합니다.
 * 토큰이 유효하면, 요청 객체(req)에 사용자 정보를 추가하고 다음 로직으로 제어를 전달합니다.
 * 토큰이 없거나 유효하지 않으면, 401 Unauthorized 오류를 응답하여 접근을 차단하는 '문지기' 역할을 합니다.
 */

// --- 모듈 임포트 ---
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Express 미들웨어 함수
 * @param {object} req - Express 요청(request) 객체
 * @param {object} res - Express 응답(response) 객체
 * @param {function} next - 다음 미들웨어 또는 라우트 핸들러로 제어를 전달하는 함수
 */
const auth = (req, res, next) => {
  // 1. 요청 헤더에서 'Authorization' 값을 가져옵니다.
  //    클라이언트는 보통 "Bearer <token>"이라는 표준 형식으로 토큰을 전송합니다.
  const authHeader = req.header('Authorization');

  // 2. 헤더에 토큰이 없는 경우, 인증되지 않은 요청이므로 401 Unauthorized 응답을 보냅니다.
  if (!authHeader) {
    return res.status(401).json({ message: '인증 토큰이 없어 접근이 거부되었습니다.' }); // 401 Unauthorized
  }

  try {
    // 3. "Bearer " 접두사를 제외하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1];
    if (!token) {
      // "Bearer " 접두사가 없거나 토큰 값이 없는 등 형식이 잘못된 경우
      return res.status(401).json({ message: '잘못된 형식의 토큰입니다.' });
    }

    // 4. 토큰을 검증합니다.
    //    jwt.verify() 함수는 토큰과 .env 파일에 저장된 비밀 키(JWT_SECRET)를 사용해
    //    토큰의 서명을 확인하고 유효기간 등을 검사합니다.
    //    검증에 실패하면 자동으로 에러를 발생시켜 catch 블록으로 이동합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. 검증 성공 시, 디코딩된 페이로드(토큰에 담겼던 사용자 정보)를 요청 객체(req)에 추가합니다.
    //    이제 이 미들웨어를 통과하는 모든 라우터에서는 `req.user`를 통해
    //    로그인한 사용자의 정보(userId, username 등)에 손쉽게 접근할 수 있습니다.
    req.user = decoded;

    // 6. 모든 검증이 성공적으로 완료되었으므로, next()를 호출하여
    //    요청을 다음 미들웨어나 실제 API 로직으로 전달합니다.
    next();
  } catch (err) {
    // jwt.verify()에서 에러가 발생한 경우 (예: 토큰 만료, 서명 불일치 등)
    // 디버깅: JWT 검증 실패 시 서버 로그에서 원인을 확인하고 싶을 때 아래 줄의 주석을 해제하세요.
    // console.error('JWT 검증 오류:', err);
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 작성된 auth 미들웨어 함수를 모듈로 내보내 다른 파일에서 라우터에 적용할 수 있도록 합니다.
module.exports = auth;
