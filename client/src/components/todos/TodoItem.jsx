import { useState, useEffect, useRef } from 'react'
import { useTodoStore } from '@/stores/todo.js'

export default function TodoItem(props) {
  const todo = props.todo
  const deleteTodo = useTodoStore(state => state.deleteTodo)
  const updateTodo = useTodoStore(state => state.updateTodo)
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(todo.text)
  const [isDone, setIsDone] = useState(todo.done)
  const inputRef = useRef(null)

  useEffect(
    function () {
      if (isEditing) {
        inputRef.current.focus()
      }
    },
    [isEditing]
  )
  useEffect(
    function () {
      handleSave()
    },
    // eslint-disable-next-line
    [isDone]
  )

  function onEditMode() {
    setIsEditing(true)
  }
  function offEditMode(todoText = todo.text) {
    setIsEditing(false)
    setText(todoText)
  }
  async function handleSave() {
    if (text.trim() === '') return
    const newTodo = Object.assign({}, todo, {
      text: text.trim(),
      done: isDone
    })
    await updateTodo(newTodo)
    offEditMode(newTodo.text)
  }

  return (
    <li>
      {isEditing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={function (event) {
              setText(event.target.value)
            }}
            onKeyDown={function (event) {
              if (event.nativeEvent.isComposing) return
              if (event.key === 'Enter') handleSave()
              if (event.key === 'Escape') offEditMode()
            }}
          />
          <button
            onClick={function () {
              offEditMode()
            }}>
            취소
          </button>
          <button onClick={handleSave}>저장</button>
        </>
      ) : (
        <>
          <input
            type="checkbox"
            checked={isDone}
            onChange={function (event) {
              setIsDone(event.target.checked)
            }}
          />
          <span>{todo.text}</span>
          <button onClick={onEditMode}>수정</button>
          <button
            onClick={function () {
              deleteTodo(todo.id)
            }}>
            삭제
          </button>
        </>
      )}
    </li>
  )
}
