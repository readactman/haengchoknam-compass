import { Modal } from '../common/Modal'
import { Smile } from 'lucide-react'
import { completeAction } from '../../data/services'

const FACES = ['😔', '😐', '🙂', '😊', '🤩']

export function SatisfactionPicker({
  actionId,
  onClose,
}: {
  actionId: string | null
  onClose: () => void
}) {
  if (!actionId) return null

  const handlePick = async (value: 1 | 2 | 3 | 4 | 5) => {
    await completeAction(actionId, value)
    onClose()
  }

  const handleSkip = async () => {
    await completeAction(actionId)
    onClose()
  }

  return (
    <Modal open={Boolean(actionId)} onClose={onClose} title="완료했어요">
      <div className="text-center pb-2">
        <Smile className="mx-auto text-accent-sage mb-3" size={28} />
        <p className="text-sm text-ink-soft mb-5">이 행동을 하고 난 기분은 어땠나요?</p>
        <div className="flex justify-center gap-2">
          {FACES.map((face, i) => (
            <button
              key={face}
              onClick={() => handlePick((i + 1) as 1 | 2 | 3 | 4 | 5)}
              className="w-12 h-12 text-2xl rounded-full hover:bg-paper-dim transition-colors flex items-center justify-center"
              aria-label={`만족도 ${i + 1}점`}
            >
              {face}
            </button>
          ))}
        </div>
        <button onClick={handleSkip} className="text-xs text-ink-faint mt-4 hover:text-ink-soft">
          평가 없이 완료
        </button>
      </div>
    </Modal>
  )
}
