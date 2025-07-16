import { useState } from 'react'

export default function App() {
  // count 상태 변수와 setCount 상태 변경 함수 선언, 초기값은 0
  const [count, setCount] = useState(0)

  function increase() {
    setCount(count + 1)
  }
  function decrease() {
    setCount(count - 1)
  }

  return (
    <>
      <div>Hello {count}?</div>
      <button onClick={increase}>올려</button>
      <button onClick={decrease}>내려</button>
    </>
  )
}
