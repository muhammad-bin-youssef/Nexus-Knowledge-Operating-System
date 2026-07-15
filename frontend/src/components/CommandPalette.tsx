import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Search, Upload, Command, FileText } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useTranslation } from '../i18n/useTranslation'
import { searchNodes, importTxtText } from '../api/client'

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
}

export function CommandPalette() {
  const open = useAppStore((s) => s.commandPaletteOpen)
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const setSearchResults = useAppStore((s) => s.setSearchResults)
  const addTask = useAppStore((s) => s.addTask)
  const updateTask = useAppStore((s) => s.updateTask)
  const removeTask = useAppStore((s) => s.removeTask)
  const queryClient = useQueryClient()
  const t = useTranslation()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, setOpen])

  const handleSearch = useCallback(async () => {
    const q = query.trim()
    if (!q) return
    setSearchQuery(q)
    const results = await searchNodes(q)
    setSearchResults(results)
    setOpen(false)
    setQuery('')
  }, [query, setSearchQuery, setSearchResults, setOpen])

  const handlePasteImport = useCallback(async () => {
    const text = query.trim()
    if (!text) return
    setOpen(false)

    const taskId = crypto.randomUUID()
    addTask({
      id: taskId,
      name: 'Import pasted text',
      status: 'running',
      progress: 30,
    })

    try {
      const result = await importTxtText('Pasted Text', text)
      updateTask(taskId, {
        status: 'completed',
        progress: 100,
        message: `Created ${result.nodes_created} nodes`,
      })
      await queryClient.invalidateQueries({ queryKey: ['graph'] })
      setTimeout(() => removeTask(taskId), 4000)
    } catch {
      updateTask(taskId, { status: 'failed', progress: 100, message: 'Import failed' })
    }
    setQuery('')
  }, [query, setOpen, addTask, updateTask, removeTask, queryClient])

  const handleImportSample = useCallback(async () => {
    setOpen(false)

    const taskId = crypto.randomUUID()
    addTask({
      id: taskId,
      name: 'Import sample knowledge',
      status: 'running',
      progress: 20,
      message: 'Loading sample…',
    })

    try {
      const response = await fetch('/sample-knowledge.txt')
      const content = await response.text()
      const result = await importTxtText('Sample Knowledge', content)
      updateTask(taskId, {
        status: 'completed',
        progress: 100,
        message: `Imported ${result.nodes_created} nodes`,
      })
      await queryClient.invalidateQueries({ queryKey: ['graph'] })
      setTimeout(() => removeTask(taskId), 4000)
    } catch {
      updateTask(taskId, { status: 'failed', progress: 100, message: 'Failed to import sample' })
    }
  }, [addTask, updateTask, removeTask, queryClient, setOpen])

  const commands: CommandItem[] = [
    {
      id: 'search',
      label: t('commandSearch', { query }),
      icon: <Search size={16} />,
      action: handleSearch,
    },
    {
      id: 'import',
      label: t('commandImport'),
      icon: <Upload size={16} />,
      action: handlePasteImport,
    },
    {
      id: 'sample',
      label: t('commandImportSample'),
      icon: <FileText size={16} />,
      action: handleImportSample,
    },
  ].filter((cmd) => {
    if (cmd.id === 'search') return query.trim().length > 0
    if (cmd.id === 'import') return query.trim().length > 10
    return true
  })

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, commands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && commands[selectedIndex]) {
      commands[selectedIndex].action()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[#161922] border border-[#2a3042] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a3042]">
          <Command size={16} className="text-slate-500" />
          <input
            autoFocus
            type="text"
            placeholder={t('commandPalettePlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-500"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a3042] text-slate-400">
            ESC
          </kbd>
        </div>

        {commands.length > 0 && (
          <ul className="py-2">
            {commands.map((cmd, index) => (
              <li key={cmd.id}>
                <button
                  onClick={cmd.action}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'hover:bg-[#2a3042]'
                  }`}
                >
                  <span className="text-slate-400">{cmd.icon}</span>
                  {cmd.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.trim().length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            {t('commandPaletteHint')}
          </div>
        )}
      </div>
    </div>
  )
}
