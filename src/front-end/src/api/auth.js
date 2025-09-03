import axios from 'axios';

/**
 * 회원가입 API를 호출하는 함수
 * @param {string} username - 사용자가 입력한 닉네임
 * @param {string} email - 사용자가 입력한 이메일
 * @param {string} password - 사용자가 입력한 비밀번호
 * @returns {Promise<any>} - 성공 시 서버로부터 받은 데이터
 */
export const signup = async (username, email, password) => {
  try {
    // Vite 프록시 설정을 통해 '/api' 경로로 요청을 보냅니다.
    // 백엔드 API도 email을 받도록 수정해야 합니다.
    const response = await axios.post('/api/users/signup', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // 컴포넌트에서 에러를 처리할 수 있도록 다시 던집니다.
    console.error("Signup API Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 로그인 API를 호출하는 함수
 * @param {string} identifier - 사용자가 입력한 아이디 또는 이메일
 * @param {string} password - 사용자가 입력한 비밀번호
 * @returns {Promise<any>} - 성공 시 서버로부터 받은 데이터 (JWT 토큰 포함)
 */
export const login = async (identifier, password) => {
  try {
    const response = await axios.post('/api/auth/login', {
      identifier, // 백엔드에서는 username 또는 email로 받을 수 있도록 처리
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};