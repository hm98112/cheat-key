import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>페이지를 찾을 수 없습니다.</h1>
      <Link to="/">주소를 다시 확인해주세요.</Link>
    </div>
  )
}
