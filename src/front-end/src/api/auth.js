// [수정] 순수 axios 대신, 인터셉터가 적용된 apiClient를 사용합니다.
import apiClient from './axiosConfig';

/**
 * 회원가입 API를 호출하는 함수
 */
export const signup = async (username, email, password) => {
  try {
    // [수정] axios.post -> apiClient.post
    const response = await apiClient.post('/users/signup', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 로그인 API를 호출하는 함수
 */
export const login = async (identifier, password) => {
  try {
    // [수정] axios.post -> apiClient.post
    const response = await apiClient.post('/auth/login', {
      identifier,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 로그아웃 API를 호출하는 함수
 */
export const logout = async (refreshToken) => {
  try {
    if (refreshToken) {
      // [수정] axios.post -> apiClient.post
      await apiClient.post('/auth/logout', { refreshToken });
    }
  } catch (error) {
    console.error("Logout API failed, but proceeding with client-side logout.", error);
  }
};

/**
 * Access Token 재발급을 요청하는 함수
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available.');
    }
    // [수정] axios.post -> apiClient.post
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data.accessToken;
  } catch (error) {
    console.error('Access token refresh failed:', error);
    throw error;
  }
};
