import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [user, setUser] = useState(null);
    // 1. socket을 useRef 대신 useState로 관리합니다.
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');
        
        if (accessToken && storedUsername && storedUserId) {
            setUser({ username: storedUsername, userId: storedUserId });
            
            // Vite 환경 변수(import.meta.env)를 사용하여 API 서버 주소를 가져옵니다.
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
            
            const newSocket = io(API_URL, {
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