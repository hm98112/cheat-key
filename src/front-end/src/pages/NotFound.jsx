import { useNavigate } from 'react-router-dom';
import TetrisAnimation from '@/components/TetrisAnimation';
import './pages.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <TetrisAnimation />
      <div className="not-found-content">
        <h1>404 NOT FOUND</h1>
        <button className="main-button login" onClick={() => navigate('/')}>
          주소를 다시확인해주세요. 메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default NotFound;