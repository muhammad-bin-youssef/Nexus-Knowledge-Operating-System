import { useAppStore } from '../store/appStore'
import { t } from './index'

export function useTranslation() {
  const locale = useAppStore((s) => s.locale)
  return (key: string, params?: Record<string, string | number>) => t(locale, key, params)
}
