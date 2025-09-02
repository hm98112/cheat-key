import Loader from './Loader.jsx'

export default function Button(props) {
  return (
    <button
      style={{
        width: props.width ? `${props.width}px` : null
      }}
      className={`btn btn-${props.variant}`}
      onClick={props.onClick}>
      {props.loading ? <Loader /> : props.children}
    </button>
  )
}
