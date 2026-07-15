import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { nodeTypeColor, formatNodeType } from '../../lib/graphUtils'

interface KosNodeData {
  label: string
  nodeType: string
  verified: boolean
  content?: string | null
}

function KosNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as KosNodeData
  const color = nodeTypeColor(nodeData.nodeType)

  return (
    <div className={`react-flow__node-kos ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-2" />
      <div
        className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-t-lg"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {formatNodeType(nodeData.nodeType)}
        {nodeData.verified && (
          <span className="ml-1.5 opacity-70">✓</span>
        )}
      </div>
      <div className="px-3 py-2">
        <div className="font-medium text-sm leading-tight">{nodeData.label}</div>
        {nodeData.content && (
          <div className="mt-1 text-[11px] text-slate-400 line-clamp-2">
            {nodeData.content}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2 !h-2" />
    </div>
  )
}

export const KosNode = memo(KosNodeComponent)
