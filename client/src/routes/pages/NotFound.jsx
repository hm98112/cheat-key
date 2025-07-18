import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>페이지 잘못 들어왔어, 인마!</h1>
      <Link to="/">주소 확인해, 짜식아</Link>
    </div>
  )
}
