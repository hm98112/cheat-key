import { create } from 'zustand'

export const useTodoStore = create(function (set, get) {
  return {
    todos: [],
    text: '',
    order: 'asc',
    done: undefined,
    setText: function (text) {
      set({
        text: text
      })
    },
    ascending: function () {
      set({
        order: 'asc'
      })
      get().fetchTodos()
    },
    descending: function () {
      set({
        order: 'desc'
      })
      get().fetchTodos()
    },
    setDone: function (done) {
      set({
        done: done
      })
      get().fetchTodos()
    },
    fetchTodos: async function () {
      const order = get().order
      const done = get().done
      const res = await fetch(
        `http://localhost:3000/api/todos?order=${order}&done=${done}`,
        {
          method: 'GET'
        }
      )
      const data = await res.json()
      //setTodos(data)
      set({
        todos: data
      })
    },
    createTodo: async function () {
      const text = get().text
      const todos = get().todos
      if (text.trim() === '') return
      const res = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim(), // 사용자가 작성한 할 일
          done: false
        })
      })
      const todo = await res.json()
      set({
        todos: todos.concat([todo]),
        text: ''
      })
    },
    updateTodo: async function (todo) {
      const res = await fetch(`http://localhost:3000/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
      })
      const newTodo = await res.json()
      const todos = get().todos
      //   const index = todos.findIndex(function (todo) {
      //     return todo.id === newTodo.id
      //   })
      set({
        todos: todos.map(function (todo) {
          if (todo.id === newTodo.id) return newTodo
          return todo
        })
      })
    },
    deleteTodo: async function (todoId) {
      const todos = get().todos
      const res = await fetch(`http://localhost:3000/api/todos/${todoId}`, {
        method: 'DELETE'
      })
      const message = await res.json()
      const newTodos = todos.filter(function (todo) {
        return todo.id !== todoId
      })
      set({
        todos: newTodos
      })
      alert(message)
    }
  }
})
