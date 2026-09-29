import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { FieldWrapper, TextInput } from '../common/FormField'
import { createAction } from '../../data/services'

interface ActionFormProps {
  open: boolean
  onClose: () => void
}

export function ActionForm({ open, onClose }: ActionFormProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const handleClose = () => {
    setTitle('')
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('어떤 행동을 할지 적어주세요.')
      return
    }
    await createAction({ title: title.trim() })
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="오늘의 행동"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>추가하기</Button>
        </div>
      }
    >
      <FieldWrapper label="어떤 작은 행동을 하시겠습니까?" required hint="거창하지 않아도 괜찮습니다. 책 1쪽 읽기, 10분 걷기처럼요.">
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 글 한 문장 쓰기"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </FieldWrapper>
      {error && <p className="text-sm text-accent-warm">{error}</p>}
    </Modal>
  )
}
