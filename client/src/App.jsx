import { useState } from 'react'
import ButtonGroup from './components/ButtonGroup.jsx'
import Button from './components/Button.jsx'

export default function App() {
  const [isLoadingforCancel, setIsLoadingforCencle] = useState(false)
  const [isLoadingforSave, setIsLoadingforSave] = useState(false)
  const [isLoadingforDelete, setIsLoadingforDelete] = useState(false)
  return (
    <ButtonGroup direction="horizontal">
      <Button
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          alignItems: 'flex-start'
        }}>
        <Button
          variant="secondary"
          width={60}
          loading={isLoadingforCancel}
          onClick={function () {
            setIsLoadingforCencle(!isLoadingforCancel)
          }}>
          Cancle
        </Button>
        <Button
          variant="primary"
          width={100}
          loading={isLoadingforSave}
          onClick={function () {
            setIsLoadingforSave(!isLoadingforSave)
          }}>
          Save
        </Button>
        <Button
          variant="danger"
          loading={isLoadingforDelete}
          onClick={function () {
            setIsLoadingforDelete(!isLoadingforDelete)
          }}>
          Delete
        </Button>
      </Button>
    </ButtonGroup>
  )
}
