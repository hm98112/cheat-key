import React, { createContext, useState, useContext } from 'react';
// api/auth.js에서 실제 API를 호출하는 함수들을 가져옵니다.
import { login as apiLogin, logout as apiLogout } from '../api/auth';

// 1. Context 생성: 앱 전체에서 공유될 데이터 저장 공간을 만듭니다.
const AuthContext = createContext(null);

/**
 * AuthProvider 컴포넌트:
 * 이 컴포넌트로 감싸진 모든 자식 요소들은 AuthContext의 데이터에 접근할 수 있게 됩니다.
 * 앱의 최상단(예: App.jsx)에서 사용됩니다.
 */
export const AuthProvider = ({ children }) => {
  // 2. 상태 관리: accessToken의 존재 여부로 로그인 상태를 관리합니다.
  // 초기값으로 localStorage에서 토큰을 가져와, 페이지를 새로고침해도 로그인 상태를 유지합니다.
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  /**
   * 로그인 함수:
   * LoginPage에서 호출되며, API 요청, 토큰 저장, 상태 업데이트를 모두 책임집니다.
   */
  const login = async (identifier, password) => {
    // 1. api/auth.js의 login 함수를 호출하여 서버로부터 토큰을 받아옵니다.
    const data = await apiLogin(identifier, password);
    
    // 2. 받은 토큰들을 localStorage에 저장합니다.
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    // 3. React의 상태를 업데이트하여 앱 전체에 로그인했음을 알립니다.
    setAccessToken(data.accessToken);
  };

  /**
   * 로그아웃 함수:
   * Header 등에서 호출되며, 서버에 로그아웃을 알리고 로컬 토큰을 삭제합니다.
   */
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    // 1. 서버에 로그아웃을 요청합니다 (보안 강화).
    await apiLogout(refreshToken);
    
    // 2. 로컬 저장소의 모든 토큰을 삭제합니다.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 3. React의 상태를 업데이트하여 앱 전체에 로그아웃했음을 알립니다.
    setAccessToken(null);
  };

  // 4. 자식 컴포넌트들에게 공유할 값들을 객체로 묶습니다.
  const value = {
    isLoggedIn: !!accessToken, // accessToken이 있으면 true, 없으면 false
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


/**
 * useAuth 커스텀 훅:
 * 어떤 컴포넌트에서든 이 훅을 호출하면 AuthContext의 값(isLoggedIn 등)에 쉽게 접근할 수 있습니다.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};