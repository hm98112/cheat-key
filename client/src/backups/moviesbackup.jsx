import { useMovieStore } from '@/stores/movie.js'

export default function App() {
  const movies = useMovieStore(state => state.movies)
  const searchText = useMovieStore(state => state.sarchText)
  const setSearchText = useMovieStore(state => state.setSearchText)
  const fetchMovies = useMovieStore(state => state.fetchMovies)
  // useEffect(function () {
  //   fetchMovies()
  // }, [])

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
