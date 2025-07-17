import { useState } from 'react'

export default function App() {
  const [movies, setMovies] = useState([])
  const [searchText, setSearchText] = useState('')

  // useEffect(function () {
  //   fetchMovies()
  // }, [])

  async function fetchMovies() {
    const res = await fetch(
      `https://omdbapi.com?apikey=7035c60c&s=${searchText}`
    )
    const data = await res.json()
    data.Search
    setMovies(data.Search || [])
  }

  return (
    <>
      <div>
        <input
          type="text"
          value={searchText}
          onChange={function (event) {
            setSearchText(event.target.value)
          }}
          onKeyDown={function (event) {
            if (event.nativeEvent.isComposing) return
            if (event.key === 'Enter') fetchMovies()
          }}
        />
        <button onClick={fetchMovies}>Search</button>
      </div>
      <ul>
        {movies.map(function (movie) {
          return <li key={movie.imdbID}>{movie.Title}</li>
        })}
      </ul>
    </>
  )
}
