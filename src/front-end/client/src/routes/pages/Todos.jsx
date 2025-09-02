import TodoCreator from '@/components/todos/TodoCreator.jsx'
import TodoFilters from '@/components/todos/TodoFilters.jsx'
import TodoList from '@/components/todos/TodoList.jsx'
export default function Todos() {
  return (
    <>
      <TodoCreator />
      <TodoFilters />
      <TodoList />
    </>
  )
}
