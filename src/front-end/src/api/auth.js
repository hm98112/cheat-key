import axios from 'axios';
// 나중에 만들 axiosConfig.js에서 인터셉터가 적용된 인스턴스를 가져올 수 있습니다.
// import apiClient from './axiosConfig';

// Vite 프록시 설정을 통해 '/api'는 자동으로 백엔드 서버(localhost:8080)로 전달됩니다.

/**
 * 회원가입 API를 호출하는 함수
 * @param {string} username - 닉네임
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<any>} - 성공 시 서버 응답 데이터
 */
export const signup = async (username, email, password) => {
  try {
    // 백엔드의 /api/users/signup 엔드포인트에 요청을 보냅니다.
    const response = await axios.post('/api/users/signup', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // 에러가 발생하면 이 함수를 호출한 곳(예: AuthContext)에서 처리할 수 있도록 다시 던집니다.
    throw error;
  }
};

/**
 * 로그인 API를 호출하는 함수
 * @param {string} identifier - 닉네임 또는 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<any>} - 성공 시 토큰이 포함된 서버 응답 데이터
 */
export const login = async (identifier, password) => {
  try {
    const response = await axios.post('/api/auth/login', {
      identifier,
      password,
    });
    // 성공 시 { accessToken, refreshToken }이 담긴 데이터를 반환합니다.
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 로그아웃 API를 호출하는 함수
 * @param {string | null} refreshToken - 무효화할 리프레시 토큰
 * @returns {Promise<any>}
 */
export const logout = async (refreshToken) => {
  try {
    // refreshToken이 있을 경우에만 서버에 무효화 요청을 보냅니다.
    if (refreshToken) {
      await axios.post('/api/auth/logout', { refreshToken });
    }
  } catch (error) {
    // 서버 요청이 실패하더라도 클라이언트에서는 로그아웃 처리를 계속해야 하므로,
    // 에러를 던지지 않고 콘솔에만 기록합니다.
    console.error("Logout API failed, but proceeding with client-side logout.", error);
  }
};

/**
 * Access Token 재발급을 요청하는 함수
 * @returns {Promise<string>} - 새로 발급받은 accessToken
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available for refreshing access token.');
    }
    
    // 백엔드의 /api/auth/refresh 엔드포인트에 요청을 보냅니다.
    const response = await axios.post('/api/auth/refresh', { refreshToken });
    
    // 새로 발급받은 accessToken을 반환합니다.
    return response.data.accessToken;
  } catch (error) {
    console.error('Access token refresh failed:', error);
    // 재발급 실패 시, 보통 사용자를 로그아웃 처리해야 합니다.
    throw error;
  }
};

