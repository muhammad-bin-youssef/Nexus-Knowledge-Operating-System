import { create } from 'zustand'
import type { GraphNode, SearchResult, TaskInfo } from '../types'
import type { Locale } from '../i18n'

interface AppState {
  selectedNodeId: string | null
  searchQuery: string
  searchResults: SearchResult[]
  commandPaletteOpen: boolean
  tutorialOpen: boolean
  locale: Locale
  tasks: TaskInfo[]
  sidebarCollapsed: boolean
  inspectorCollapsed: boolean

  setSelectedNodeId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setCommandPaletteOpen: (open: boolean) => void
  setTutorialOpen: (open: boolean) => void
  setLocale: (locale: Locale) => void
  addTask: (task: TaskInfo) => void
  updateTask: (id: string, updates: Partial<TaskInfo>) => void
  removeTask: (id: string) => void
  toggleSidebar: () => void
  toggleInspector: () => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedNodeId: null,
  searchQuery: '',
  searchResults: [],
  commandPaletteOpen: false,
  tutorialOpen: false,
  locale: 'en',
  tasks: [],
  sidebarCollapsed: false,
  inspectorCollapsed: false,

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setTutorialOpen: (open) => set({ tutorialOpen: open }),
  setLocale: (locale) => set({ locale }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleInspector: () => set((state) => ({ inspectorCollapsed: !state.inspectorCollapsed })),
}))

export function selectSelectedNode(nodes: GraphNode[], selectedId: string | null): GraphNode | null {
  if (!selectedId) return null
  return nodes.find((n) => n.id === selectedId) ?? null
}
