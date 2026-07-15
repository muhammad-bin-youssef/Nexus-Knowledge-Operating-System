import type { GraphEdge, GraphNode } from '../types'
import type { Edge, Node } from '@xyflow/react'

const NODE_TYPE_COLORS: Record<string, string> = {
  concept: '#6366f1',
  topic: '#8b5cf6',
  claim: '#f59e0b',
  evidence: '#10b981',
  question: '#3b82f6',
  answer: '#06b6d4',
  person: '#ec4899',
  book: '#f97316',
  definition: '#14b8a6',
}

export function nodeTypeColor(nodeType: string): string {
  return NODE_TYPE_COLORS[nodeType] ?? '#64748b'
}

export function toFlowNodes(nodes: GraphNode[]): Node[] {
  return nodes.map((node) => ({
    id: node.id,
    type: 'kos',
    position: { x: node.position_x, y: node.position_y },
    data: {
      label: node.label,
      nodeType: node.node_type,
      verified: node.verified,
      content: node.content,
    },
  }))
}

export function toFlowEdges(edges: GraphEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source_id,
    target: edge.target_id,
    label: edge.edge_type.replace(/_/g, ' '),
    animated: !edge.verified,
    data: { evidence: edge.evidence, verified: edge.verified },
  }))
}

export function formatNodeType(nodeType: string): string {
  return nodeType.replace(/_/g, ' ')
}
