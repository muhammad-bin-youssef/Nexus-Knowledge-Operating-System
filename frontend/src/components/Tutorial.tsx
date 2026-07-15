import { X } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useTranslation } from '../i18n/useTranslation'

export function Tutorial() {
  const open = useAppStore((s) => s.tutorialOpen)
  const setTutorialOpen = useAppStore((s) => s.setTutorialOpen)
  const t = useTranslation()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60"
      onClick={() => setTutorialOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#161922] border border-[#2a3042] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3042]">
          <div>
            <h2 className="text-lg font-semibold">{t('tutorialTitle')}</h2>
            <p className="text-slate-500 text-sm">{t('tutorialText')}</p>
          </div>
          <button
            onClick={() => setTutorialOpen(false)}
            className="p-2 rounded hover:bg-[#2a3042] text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-200">
          <p>{t('tutorialWelcome')}</p>
          <ol className="space-y-3 list-decimal list-inside text-slate-400">
            <li>{t('tutorialStep1')}</li>
            <li>{t('tutorialStep2')}</li>
            <li>{t('tutorialStep3')}</li>
            <li>{t('tutorialStep4')}</li>
          </ol>
        </div>

        <div className="px-6 py-4 border-t border-[#2a3042] text-right">
          <button
            onClick={() => setTutorialOpen(false)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
          >
            {t('tutorialClose')}
          </button>
        </div>
      </div>
    </div>
  )
}
