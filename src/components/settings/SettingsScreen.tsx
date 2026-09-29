import { useRef, useState } from 'react'
import { Download, Upload, Trash2, Compass } from 'lucide-react'
import { PageHeader } from '../common/PageHeader'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { downloadExport, exportAllData, importData, ImportValidationError } from '../../data/exportImport'
import { clearAllData } from '../../data/services'

export function SettingsScreen() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const handleExport = async () => {
    const data = await exportAllData()
    downloadExport(data)
    setMessage({ type: 'ok', text: '백업 파일을 내려받았습니다.' })
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('가져오기를 진행하면 현재 저장된 모든 데이터가 백업 파일의 내용으로 대체됩니다. 계속할까요?')) return
    try {
      await importData(file)
      setMessage({ type: 'ok', text: '데이터를 성공적으로 가져왔습니다.' })
    } catch (err) {
      const text =
        err instanceof ImportValidationError ? err.message : '가져오는 중 문제가 발생했습니다.'
      setMessage({ type: 'error', text })
    }
  }

  const handleClearAll = async () => {
    if (!confirm('모든 기록이 영구적으로 삭제됩니다. 정말 초기화할까요?')) return
    await clearAllData()
    setMessage({ type: 'ok', text: '모든 데이터를 초기화했습니다.' })
  }

  return (
    <div>
      <PageHeader title="설정" subtitle="데이터 백업과 앱 정보" />
      <div className="px-5 sm:px-8 space-y-4 pb-8">
        {message && (
          <div
            className={`text-sm px-4 py-2.5 rounded-xl ${
              message.type === 'ok'
                ? 'bg-accent-sage-soft text-accent-sage'
                : 'bg-accent-warm-soft text-accent-warm'
            }`}
          >
            {message.text}
          </div>
        )}

        <Card className="p-5">
          <h2 className="font-heading text-ink mb-1">데이터 내보내기 / 가져오기</h2>
          <p className="text-sm text-ink-faint mb-4">
            모든 기록은 이 기기의 브라우저에만 저장됩니다. JSON 파일로 내려받아 백업하거나 다른 기기로 옮길 수 있어요.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExport} icon={<Download size={16} />}>
              내보내기
            </Button>
            <Button variant="secondary" onClick={handleImportClick} icon={<Upload size={16} />}>
              가져오기
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-heading text-ink mb-1">데이터 초기화</h2>
          <p className="text-sm text-ink-faint mb-4">
            샘플 데이터를 포함해 저장된 모든 기록을 삭제합니다. 이 작업은 되돌릴 수 없어요.
          </p>
          <Button variant="danger" onClick={handleClearAll} icon={<Trash2 size={16} />}>
            모든 데이터 초기화
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Compass size={18} className="text-brand" />
            <h2 className="font-heading text-ink">행촉남 Compass</h2>
          </div>
          <p className="text-sm text-ink-faint leading-relaxed">
            성찰을 행동으로, 행동을 행복으로.
            <br />
            읽고, 생각하고, 쓰고, 행동하고, 다시 돌아보는 과정을 연결하는 개인 기록 공간입니다.
          </p>
        </Card>
      </div>
    </div>
  )
}
