import React, { createContext, useState, useContext, useEffect } from 'react';
<<<<<<< HEAD
=======
import { io } from 'socket.io-client';
>>>>>>> origin/back-end
import { login as apiLogin, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    if (accessToken && storedUsername && storedUserId) {
      setUser({ username: storedUsername, userId: storedUserId });
    } else {
      setUser(null); // 토큰이 없으면 사용자 정보도 확실히 비웁니다.
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
    setUser(null);

  };

  const value = {
    isLoggedIn: !!accessToken,
    user,
    login,
    logout,
    token: accessToken
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

=======
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [user, setUser] = useState(null);
    // 1. socket을 useRef 대신 useState로 관리합니다.
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');
        
        if (accessToken && storedUsername && storedUserId) {
            setUser({ username: storedUsername, userId: storedUserId });

            // 2. 새로운 소켓을 생성하고 state를 업데이트합니다.
            const newSocket = io('http://localhost:8080', {
                auth: {
                    token: accessToken
                }
            });
            setSocket(newSocket);

            // 3. 컴포넌트가 unmount될 때 소켓 연결을 확실히 해제합니다.
            return () => {
                newSocket.disconnect();
            };
        } 
        else {
            setUser(null);
            // 로그아웃 시 기존 소켓 연결 해제 및 state 초기화
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [accessToken]); // accessToken이 바뀔 때마다 실행됩니다.

    const login = async (identifier, password) => {
        const data = await apiLogin(identifier, password);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        setAccessToken(data.accessToken);
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await apiLogout(refreshToken);
        } catch (error) {
            console.error("Logout API failed, proceeding with local cleanup:", error);
        }
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
        token: accessToken,
        // 4. state로부터 최신 socket 값을 전달합니다.
        socket: socket 
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
>>>>>>> origin/back-end
