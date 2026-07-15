import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactFlowProvider } from '@xyflow/react'
import { Sidebar } from './components/Sidebar'
import { GraphCanvas } from './components/GraphCanvas'
import { Inspector } from './components/Inspector'
import { TasksBar } from './components/TasksBar'
import { CommandPalette } from './components/CommandPalette'
import { Tutorial } from './components/Tutorial'
import { useAppStore } from './store/appStore'
import { useTranslation } from './i18n/useTranslation'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3000,
      retry: 2,
    },
  },
})

function App() {
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const setTutorialOpen = useAppStore((s) => s.setTutorialOpen)
  const t = useTranslation()

  return (
    <QueryClientProvider client={queryClient}>
      <ReactFlowProvider>
        <div className="h-full flex flex-col" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-[#2a3042] bg-[#161922] text-slate-300 text-sm">
            <div>
              <div className="text-lg font-semibold">{t('appTitle')}</div>
              <div className="mt-1 text-slate-500 text-xs flex flex-wrap gap-2">
                <span>{t('shortcutHint')}</span>
                <kbd className="rounded bg-[#2a3042] px-2 py-1 text-[11px]">{t('ctrlK')}</kbd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTutorialOpen(true)}
                className="rounded-lg bg-[#1e2230] px-3 py-2 text-sm text-slate-200 border border-[#2a3042] hover:border-indigo-500"
              >
                {t('tutorialOpen')}
              </button>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'ar')}
                className="rounded-lg bg-[#0f1117] border border-[#2a3042] px-2 py-2 text-sm text-slate-200"
              >
                <option value="en">{t('languageEnglish')}</option>
                <option value="ar">{t('languageArabic')}</option>
              </select>
            </div>
          </header>

          <div className="flex flex-1 min-h-0">
            <Sidebar />
            <main className="flex-1 min-w-0 relative">
              <GraphCanvas />
            </main>
            <Inspector />
          </div>
          <TasksBar />
          <CommandPalette />
          <Tutorial />
        </div>
      </ReactFlowProvider>
    </QueryClientProvider>
  )
}

export default App
