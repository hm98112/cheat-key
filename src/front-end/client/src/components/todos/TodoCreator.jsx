import { useTodoStore } from '@/stores/todo.js'

export default function TodoCreator() {
  const text = useTodoStore(state => state.text)
  const setText = useTodoStore(state => state.setText)
  const createTodo = useTodoStore(state => state.createTodo)

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={function (event) {
          setText(event.target.value)
        }}
        onKeyDown={function (event) {
          if (event.nativeEvent.isComposing) return
          if (event.key === 'Enter') createTodo()
        }}
      />
      <button onClick={createTodo}>추가</button>
    </div>
  )
}
