import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const TetrisPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. 컴포넌트가 마운트되면, 서버에 게임 참여 권한을 확인하는 API를 호출합니다.
    const verifyAccess = async () => {
      try {
        await apiClient.get(`/games/${gameId}/verify`);
        // 2. API 호출이 성공하면 (200 OK), 로딩 상태를 끝내고 게임을 보여줍니다.
        setIsLoading(false);
      } catch (err) {
        // 3. API가 403 Forbidden 등의 에러를 반환하면
        console.error("접근 권한 없음:", err.response?.data?.message);
        setError("이 게임에 참여할 권한이 없습니다.");
        setIsLoading(false);
        // 4. 로비 페이지 등으로 쫓아냅니다.
        setTimeout(() => navigate('/lobby'), 3000);
      }
    };

    verifyAccess();
  }, [gameId, navigate]);

  // 로딩 중일 때 보여줄 UI
  if (isLoading) {
    return <div>게임 정보를 확인하는 중...</div>;
  }

  // 에러가 발생했을 때 보여줄 UI
  if (error) {
    return <div>{error} (3초 후 로비로 이동합니다.)</div>;
  }

  // 모든 확인이 끝나면 실제 게임 UI를 렌더링합니다.
  return (
    <div>
      <h1>Tetris Game Room</h1>
      <p>현재 게임 ID: {gameId}</p>
      {/* TODO: 이곳에 실제 게임 컴포넌트가 위치합니다. */}
    </div>
  );
};

export default TetrisPage;
