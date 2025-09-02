import { useState } from 'react'

export default function App() {
  const [text, setText] = useState('Hello~')

  return (
    <>
      <input
        type="text"
        value={text}
        onChange={function (event) {
          setText(event.target.value)
        }}
      />
      <button
        onClick={function () {
          console.log(text)
        }}>
        LogIn
      </button>
      <h1>{text}</h1>
    </>
  )
}
