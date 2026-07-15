export type NodeType =
  | 'question'
  | 'answer'
  | 'claim'
  | 'evidence'
  | 'argument'
  | 'counter_argument'
  | 'conclusion'
  | 'definition'
  | 'verse'
  | 'hadith'
  | 'scholar'
  | 'book'
  | 'article'
  | 'concept'
  | 'topic'
  | 'person'
  | 'place'
  | 'organization'
  | 'event'
  | 'timeline_event'
  | 'custom'

export type EdgeType =
  | 'supports'
  | 'refutes'
  | 'answers'
  | 'asks'
  | 'defines'
  | 'mentions'
  | 'quotes'
  | 'references'
  | 'contradicts'
  | 'related_to'
  | 'same_entity'
  | 'same_topic'
  | 'authenticates'
  | 'declares_weak'
  | 'summarizes'
  | 'expands'
  | 'contains'
  | 'belongs_to'

export interface Provenance {
  source_id: string
  source_type: string
  excerpt: string | null
  offset_start: number | null
  offset_end: number | null
}

export interface GraphNode {
  id: string
  label: string
  node_type: string
  content: string | null
  verified: boolean
  position_x: number
  position_y: number
  provenance: Provenance
  created_at: string
  updated_at: string
}

export interface GraphEdge {
  id: string
  source_id: string
  target_id: string
  edge_type: string
  evidence: string
  verified: boolean
  created_at: string
}

export interface GraphSnapshot {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface SearchResult {
  node_id: string
  label: string
  node_type: string
  snippet: string
  rank: number
}

export interface ImportResult {
  source_id: string
  title: string
  chunk_count: number
  nodes_created: number
}

export interface HealthResponse {
  status: string
  version: string
  node_count: number
}

export interface TaskInfo {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  message?: string
}
