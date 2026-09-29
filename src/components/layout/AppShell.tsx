import { useState, type ReactNode } from 'react'
import { Menu, X, Compass } from 'lucide-react'
import { useNav } from '../../nav/NavContext'
import { allNavItems, primaryNavItems, secondaryNavItems } from './navItems'

export function AppShell({ children }: { children: ReactNode }) {
  const { view, goTo } = useNav()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="min-h-screen bg-paper flex">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden sm:flex sm:flex-col w-60 shrink-0 border-r border-border bg-paper px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <Compass className="text-brand" size={22} />
          <span className="font-heading text-lg text-ink">행촉남 Compass</span>
        </div>
        <nav className="flex flex-col gap-1">
          {allNavItems.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  active
                    ? 'bg-paper-dim text-ink'
                    : 'text-ink-soft hover:bg-paper-dim hover:text-ink'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto px-2 pt-6 text-xs text-ink-faint leading-relaxed font-heading italic">
          성찰을 행동으로,
          <br />
          행동을 행복으로.
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* 모바일 상단 바 */}
        <header className="sm:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-paper sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Compass className="text-brand" size={20} />
            <span className="font-heading text-base text-ink">행촉남 Compass</span>
          </div>
        </header>

        <main className="flex-1 min-w-0 pb-20 sm:pb-8">{children}</main>

        {/* 모바일 하단 탭 */}
        <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-paper border-t border-border flex items-stretch h-16 pb-[env(safe-area-inset-bottom)]">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] ${
                  active ? 'text-brand' : 'text-ink-faint'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </button>
            )
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] ${
              secondaryNavItems.some((i) => i.id === view) ? 'text-brand' : 'text-ink-faint'
            }`}
          >
            <Menu size={20} strokeWidth={1.75} />
            더보기
          </button>
        </nav>

        {moreOpen && (
          <div
            className="sm:hidden fixed inset-0 z-40 bg-ink/30 flex items-end"
            onClick={() => setMoreOpen(false)}
          >
            <div
              className="bg-paper w-full rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-heading text-base text-ink">더보기</span>
                <button onClick={() => setMoreOpen(false)} className="p-1 text-ink-faint">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon
                  const active = view === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        goTo(item.id)
                        setMoreOpen(false)
                      }}
                      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl text-xs ${
                        active ? 'bg-paper-dim text-brand' : 'text-ink-soft'
                      }`}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
