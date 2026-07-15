import { useRef, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Upload, ChevronLeft, ChevronRight, FileText, Database, Globe } from 'lucide-react'
import { fetchGraph, searchNodes, importTxtFile, importTxtText, resetGraph } from '../api/client'
import { useAppStore } from '../store/appStore'
import { useTranslation } from '../i18n/useTranslation'

export function Sidebar() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localQuery, setLocalQuery] = useState('')
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const setSearchResults = useAppStore((s) => s.setSearchResults)
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId)
  const searchResults = useAppStore((s) => s.searchResults)
  const addTask = useAppStore((s) => s.addTask)
  const updateTask = useAppStore((s) => s.updateTask)
  const removeTask = useAppStore((s) => s.removeTask)
  const t = useTranslation()

  const { data: graph } = useQuery({
    queryKey: ['graph'],
    queryFn: fetchGraph,
    staleTime: 5000,
  })

  const handleSearch = useCallback(async () => {
    const query = localQuery.trim()
    setSearchQuery(query)
    if (!query) {
      setSearchResults([])
      return
    }
    const results = await searchNodes(query)
    setSearchResults(results)
  }, [localQuery, setSearchQuery, setSearchResults])

  const handleImport = useCallback(
    async (file: File) => {
      const taskId = crypto.randomUUID()
      addTask({
        id: taskId,
        name: `Import ${file.name}`,
        status: 'running',
        progress: 0,
        message: t('taskProcessing'),
      })

      try {
        updateTask(taskId, { progress: 30, message: t('taskUploading') })
        const result = await importTxtFile(file)
        updateTask(taskId, {
          status: 'completed',
          progress: 100,
          message: t('taskCreatedNodes', { count: result.nodes_created, chunks: result.chunk_count }),
        })
        await queryClient.invalidateQueries({ queryKey: ['graph'] })
        setTimeout(() => removeTask(taskId), 4000)
      } catch {
        updateTask(taskId, {
          status: 'failed',
          progress: 100,
          message: t('taskImportFailed'),
        })
      }
    },
    [addTask, updateTask, removeTask, queryClient, t],
  )

  const importSample = useCallback(async () => {
    const taskId = crypto.randomUUID()
    addTask({
      id: taskId,
      name: t('taskSampleImport'),
      status: 'running',
      progress: 0,
      message: t('taskFetchingSample'),
    })

    try {
      const response = await fetch('/sample-knowledge.txt')
      const content = await response.text()
      updateTask(taskId, { progress: 40, message: t('taskImportingSample') })
      const result = await importTxtText(t('sampleLabelEnglish'), content)
      updateTask(taskId, {
        status: 'completed',
        progress: 100,
        message: t('taskImportedNodes', { count: result.nodes_created }),
      })
      await queryClient.invalidateQueries({ queryKey: ['graph'] })
      setTimeout(() => removeTask(taskId), 4000)
    } catch {
      updateTask(taskId, {
        status: 'failed',
        progress: 100,
        message: t('taskFailedImportSample'),
      })
    }
  }, [addTask, updateTask, removeTask, queryClient, t])

  const importArabicSample = useCallback(async () => {
    const taskId = crypto.randomUUID()
    addTask({
      id: taskId,
      name: t('taskArabicSampleImport'),
      status: 'running',
      progress: 0,
      message: t('taskFetchingSample'),
    })

    try {
      const response = await fetch('/sample-knowledge-ar.txt')
      const content = await response.text()
      updateTask(taskId, { progress: 40, message: t('taskImportingSample') })
      const result = await importTxtText(t('sampleLabelArabic'), content)
      updateTask(taskId, {
        status: 'completed',
        progress: 100,
        message: t('taskImportedNodes', { count: result.nodes_created }),
      })
      await queryClient.invalidateQueries({ queryKey: ['graph'] })
      setTimeout(() => removeTask(taskId), 4000)
    } catch {
      updateTask(taskId, {
        status: 'failed',
        progress: 100,
        message: t('taskFailedImportSample'),
      })
    }
  }, [addTask, updateTask, removeTask, queryClient, t])

  const handleResetGraph = useCallback(async () => {
    await resetGraph()
    queryClient.invalidateQueries({ queryKey: ['graph'] })
  }, [queryClient])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImport(file)
    e.target.value = ''
  }

  if (collapsed) {
    return (
      <aside className="w-10 flex flex-col items-center py-3 border-r border-[#2a3042] bg-[#161922]">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-[#2a3042] text-slate-400"
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-72 flex flex-col border-r border-[#2a3042] bg-[#161922] shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a3042]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold">
            K
          </div>
          <span className="font-semibold text-sm">{t('appTitle')}</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-[#2a3042] text-slate-400"
          title={t('collapseSidebar')}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
              <Database size={14} />
              <span>{t('graphSummary')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-[#0f1117] border border-[#2a3042] px-3 py-2">
                <div className="text-slate-500 text-[11px] uppercase tracking-wide">{t('nodes')}</div>
                <div className="text-lg font-semibold text-slate-100">{graph?.nodes.length ?? '–'}</div>
              </div>
              <div className="rounded-lg bg-[#0f1117] border border-[#2a3042] px-3 py-2">
                <div className="text-slate-500 text-[11px] uppercase tracking-wide">{t('edges')}</div>
                <div className="text-lg font-semibold text-slate-100">{graph?.edges.length ?? '–'}</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleResetGraph}
            className="rounded-lg bg-[#0f1117] px-3 py-2 text-xs uppercase tracking-wide text-slate-400 border border-[#2a3042] hover:border-indigo-500"
          >
            {t('resetGraph')}
          </button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-[#0f1117] border border-[#2a3042] focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-medium"
        >
          <Upload size={14} />
          {t('importTextFile')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={onFileChange}
        />

        <button
          onClick={importSample}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg bg-slate-800 border border-[#2a3042] hover:border-indigo-500 transition-colors font-medium text-slate-200"
        >
          <FileText size={14} />
          {t('importSampleKnowledge')}
        </button>

        <button
          onClick={importArabicSample}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg bg-slate-800 border border-[#2a3042] hover:border-indigo-500 transition-colors font-medium text-slate-200"
        >
          <Globe size={14} />
          {t('importArabicSample')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {searchResults.length > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 px-1 mb-2">
              <span>{t('searchResults')}</span>
              <span className="text-slate-400">{searchResults.length}</span>
            </div>
            {searchResults.map((result) => (
              <button
                key={result.node_id}
                onClick={() => setSelectedNodeId(result.node_id)}
                className="w-full text-left p-2.5 rounded-lg hover:bg-[#2a3042] transition-colors group"
              >
                <div className="text-sm font-medium truncate">{result.label}</div>
                <div
                  className="text-[11px] text-slate-400 mt-0.5 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: result.snippet }}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            <FileText size={24} className="mx-auto mb-2 opacity-50" />
            {t('emptySidebarMessage')}
          </div>
        )}
      </div>
    </aside>
  )
}
