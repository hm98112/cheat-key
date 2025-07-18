import { useTodoStore } from '@/stores/todo.js'

export default function TodoFilters() {
  const ascending = useTodoStore(state => state.ascending)
  const descending = useTodoStore(state => state.descending)
  const setDone = useTodoStore(state => state.setDone)

  return (
    <>
      <div>
        <button onClick={ascending}>오름차순</button>
        <button onClick={descending}>내림차순</button>
        <button
          onClick={function () {
            setDone(undefined)
          }}>
          전체
        </button>
        <button
          onClick={function () {
            setDone(true)
          }}>
          완료
        </button>
        <button
          onClick={function () {
            setDone(false)
          }}>
          할일
        </button>
      </div>
      <ul></ul>
    </>
  )
}
