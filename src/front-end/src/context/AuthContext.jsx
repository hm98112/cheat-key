import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);

    useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    if (storedUsername && storedUserId) {
      setUser({ username: storedUsername, userId: storedUserId });
    }
  }, [accessToken]);


  const login = async (identifier, password) => {
    // 1. 서버로부터 토큰 및 사용자 정보를 받아옵니다.
    const data = await apiLogin(identifier, password);

    // 2. 받은 토큰들을 localStorage에 저장합니다.
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);

    // 4. React, user의 상태를 업데이트하여 앱 전체에 로그인했음을 알립니다.
    setUser({ username: data.username, userId: data.userId });
    setAccessToken(data.accessToken);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await apiLogout(refreshToken);
    } catch (error) {
      console.error("Logout API failed, proceeding with local cleanup:", error);
    }

    // 로그아웃 시 모든 관련 정보를 깔끔하게 삭제합니다.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    setAccessToken(null);
  };

  const value = {
    isLoggedIn: !!accessToken,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

