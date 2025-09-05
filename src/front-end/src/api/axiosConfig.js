import axios from 'axios';

import { refreshAccessToken } from './auth'; 

const apiClient = axios.create({
  baseURL: '/api', // Vite 프록시를 통해 백엔드로 전달될 기본 경로
});

// ====================================================================
// 1. 요청 인터셉터 (Request Interceptor)
//    - 모든 API 요청이 서버로 전송되기 전에 실행됩니다.
//    - localStorage에서 accessToken을 가져와 'Authorization' 헤더에 담아줍니다.
// ====================================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ====================================================================
// 2. 응답 인터셉터 (Response Interceptor)
//    - 서버로부터 응답을 받은 후, .then() 또는 .catch()로 처리되기 전에 실행됩니다.
//    - Access Token 만료(401 에러) 시, Refresh Token으로 재발급을 시도합니다.
// ====================================================================
apiClient.interceptors.response.use(
  (response) => {
    // 2xx 범위의 상태 코드는 이 함수를 트리거합니다.
    // 여기서는 특별한 작업 없이 응답을 그대로 반환합니다.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Access Token이 만료되었다는 401 에러이고,
    // 이 요청이 토큰 재발급을 시도했던 첫 번째 요청일 경우에만 실행합니다.
    // (무한 재발급 요청 루프를 방지하기 위함)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        console.log('Access token expired. Attempting to refresh...');
        // 1. auth.js에 정의된 refreshAccessToken 함수를 호출하여 새 토큰을 받아옵니다.
        const newAccessToken = await refreshAccessToken();
        
        // 2. 새로 받은 토큰을 localStorage와 axios 인스턴스의 기본 헤더에 저장합니다.
        localStorage.setItem('accessToken', newAccessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // 3. 원래 실패했던 요청의 헤더에도 새 토큰을 설정합니다.
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        console.log('Token refreshed successfully. Retrying original request...');
        // 4. 원래 실패했던 요청을 새로운 토큰으로 다시 보냅니다.
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh Token마저 만료되었거나 유효하지 않은 경우
        console.error('Failed to refresh token. Logging out...');
        // TODO: 사용자를 로그아웃 처리하고 로그인 페이지로 리디렉션하는 로직 추가
        // 예: logout(); window.location = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 401 에러가 아니거나 다른 문제일 경우, 에러를 그대로 반환합니다.
    return Promise.reject(error);
  }
);

export default apiClient;

