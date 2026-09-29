import { useEffect, useState } from 'react'
import { NavProvider, useNav } from './nav/NavContext'
import { AppShell } from './components/layout/AppShell'
import { TodayScreen } from './components/today/TodayScreen'
import { BooksScreen } from './components/reading/BooksScreen'
import { ReflectionsScreen } from './components/reflection/ReflectionsScreen'
import { ActionsScreen } from './components/action/ActionsScreen'
import { WritingStudio } from './components/writing/WritingStudio'
import { PrinciplesScreen } from './components/principle/PrinciplesScreen'
import { WeeklyReviewScreen } from './components/review/WeeklyReviewScreen'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { seedIfEmpty } from './data/seed'

function Screens() {
  const { view } = useNav()
  switch (view) {
    case 'today':
      return <TodayScreen />
    case 'books':
      return <BooksScreen />
    case 'reflections':
      return <ReflectionsScreen />
    case 'actions':
      return <ActionsScreen />
    case 'writing':
      return <WritingStudio />
    case 'principles':
      return <PrinciplesScreen />
    case 'review':
      return <WeeklyReviewScreen />
    case 'settings':
      return <SettingsScreen />
    default:
      return null
  }
}

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedIfEmpty().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink-faint text-sm">
        불러오는 중...
      </div>
    )
  }

  return (
    <NavProvider>
      <AppShell>
        <Screens />
      </AppShell>
    </NavProvider>
  )
}

export default App
