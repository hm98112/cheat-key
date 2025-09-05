import React, { createContext, useState, useContext, useEffect } from 'react';
// api/auth.js에서 실제 API를 호출하는 함수들을 가져옵니다.
import { login as apiLogin, logout as apiLogout } from '../api/auth';

// 1. Context 생성: 앱 전체에서 공유될 데이터 저장 공간을 만듭니다.
const AuthContext = createContext(null);

/**
 * AuthProvider 컴포넌트:
 * 이 컴포넌트로 감싸진 모든 자식 요소들은 AuthContext의 데이터에 접근할 수 있게 됩니다.
 */
export const AuthProvider = ({ children }) => {
  // 2. 상태 관리: accessToken과 함께 사용자 정보(user)도 상태로 관리합니다.
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null); // ⭐ 사용자 정보를 저장할 상태 추가

  // ⭐ 앱이 처음 로드될 때 localStorage를 확인하여 로그인 상태를 복원하는 useEffect
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUsername = localStorage.getItem('username');

    if (storedToken && storedUsername) {
      setAccessToken(storedToken);
      setUser({ username: storedUsername });
    }
  }, []); // 빈 배열을 전달하여 최초 렌더링 시에만 실행되도록 합니다.

  /**
   * 로그인 함수:
   * API 요청, 토큰/사용자 정보 저장, 상태 업데이트를 모두 책임집니다.
   */
  const login = async (identifier, password) => {
    // 1. 서버로부터 토큰과 사용자 정보를 받아옵니다.
    const data = await apiLogin(identifier, password);

    // 2. 받은 정보들을 localStorage에 저장합니다.
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('username', data.username); // ⭐ username 저장 추가

    // 3. React의 상태를 업데이트하여 앱 전체에 변경 사항을 알립니다.
    setAccessToken(data.accessToken);
    setUser({ username: data.username }); // ⭐ user 상태 업데이트 추가
  };

  /**
   * 로그아웃 함수:
   * 서버에 로그아웃을 알리고 로컬 정보(토큰, 사용자 정보)를 삭제합니다.
   */
  const logout = async () => {
    // 백엔드에 로그아웃 API가 있다면 호출하는 것이 좋습니다.
    // await apiLogout(); 

    // 1. 로컬 저장소의 모든 관련 정보를 삭제합니다.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username'); // ⭐ username 삭제 추가

    // 2. React의 상태를 초기화하여 앱 전체에 로그아웃했음을 알립니다.
    setAccessToken(null);
    setUser(null); // ⭐ user 상태 초기화 추가
  };

  // 3. 자식 컴포넌트들에게 공유할 값들을 객체로 묶습니다.
  const value = {
    user, // ⭐ 공유할 값에 user 객체 추가
    isLoggedIn: !!accessToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


/**
 * useAuth 커스텀 훅:
 * 컴포넌트에서 이 훅을 호출하면 AuthContext의 값에 쉽게 접근할 수 있습니다.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};