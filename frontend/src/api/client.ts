import type {
  GraphSnapshot,
  GraphNode,
  HealthResponse,
  ImportResult,
  SearchResult,
} from '../types'

const API_BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init)
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health')
}

export function fetchGraph(): Promise<GraphSnapshot> {
  return request<GraphSnapshot>('/graph')
}

export function fetchNode(id: string): Promise<GraphNode> {
  return request<GraphNode>(`/graph/nodes/${id}`)
}

export function searchNodes(query: string, limit = 20): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) })
  return request<SearchResult[]>(`/search?${params}`)
}

export async function importTxtFile(file: File): Promise<ImportResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/import/txt`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Import failed: ${response.status}`)
  }

  return response.json() as Promise<ImportResult>
}

export async function importTxtText(title: string, content: string): Promise<ImportResult> {
  const blob = new Blob([content], { type: 'text/plain' })
  const file = new File([blob], `${title}.txt`, { type: 'text/plain' })
  return importTxtFile(file)
}

export async function resetGraph(): Promise<void> {
  const response = await fetch(`${API_BASE}/graph/reset`, { method: 'POST' })
  if (!response.ok) {
    throw new Error(`Reset failed: ${response.status}`)
  }
}
