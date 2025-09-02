export default function ButtonGroup(props) {
  return <div className={`btn-group ${props.direction}`}>{props.children}</div>
}
