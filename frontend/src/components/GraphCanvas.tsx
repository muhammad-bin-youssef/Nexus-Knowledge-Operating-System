import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery } from '@tanstack/react-query'
import { fetchGraph } from '../api/client'
import { useAppStore } from '../store/appStore'
import { KosNode } from './nodes/KosNode'
import { toFlowEdges, toFlowNodes } from '../lib/graphUtils'

const nodeTypes = { kos: KosNode }

export function GraphCanvas() {
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId)
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)

  const { data: graph, isLoading, error } = useQuery({
    queryKey: ['graph'],
    queryFn: fetchGraph,
    refetchInterval: 5000,
  })

  const initialNodes = useMemo(
    () => (graph ? toFlowNodes(graph.nodes) : []),
    [graph],
  )
  const initialEdges = useMemo(
    () => (graph ? toFlowEdges(graph.edges) : []),
    [graph],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    if (graph) {
      setNodes(toFlowNodes(graph.nodes))
      setEdges(toFlowEdges(graph.edges))
    }
  }, [graph, setNodes, setEdges])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id)
    },
    [setSelectedNodeId],
  )

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  const { setCenter } = useReactFlow()

  useEffect(() => {
    if (!graph || !selectedNodeId) return
    const selected = graph.nodes.find((node) => node.id === selectedNodeId)
    if (selected) {
      setCenter(selected.position_x, selected.position_y, { duration: 300 })
    }
  }, [graph, selectedNodeId, setCenter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Loading graph…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Failed to load graph. Is the backend running?
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={nodes.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
      }))}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#2a3042" gap={20} size={1} />
      <Controls className="!bg-[#1e2230] !border-[#2a3042] !shadow-lg [&>button]:!bg-[#1e2230] [&>button]:!border-[#2a3042] [&>button]:!text-slate-300 [&>button:hover]:!bg-[#2a3042]" />
      <MiniMap
        nodeColor={(n) => {
          const data = n.data as { nodeType?: string }
          return data.nodeType === 'claim' ? '#f59e0b' : '#6366f1'
        }}
        maskColor="rgba(15, 17, 23, 0.8)"
        className="!bg-[#161922] !border-[#2a3042]"
      />
    </ReactFlow>
  )
}
