import { ChevronLeft, ChevronRight, Shield, ShieldOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchGraph } from '../api/client'
import { useAppStore, selectSelectedNode } from '../store/appStore'
import { formatNodeType, nodeTypeColor } from '../lib/graphUtils'

export function Inspector() {
  const collapsed = useAppStore((s) => s.inspectorCollapsed)
  const toggleInspector = useAppStore((s) => s.toggleInspector)
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)

  const { data: graph } = useQuery({
    queryKey: ['graph'],
    queryFn: fetchGraph,
  })

  const selectedNode = selectSelectedNode(graph?.nodes ?? [], selectedNodeId)

  if (collapsed) {
    return (
      <aside className="w-10 flex flex-col items-center py-3 border-l border-[#2a3042] bg-[#161922]">
        <button
          onClick={toggleInspector}
          className="p-1.5 rounded hover:bg-[#2a3042] text-slate-400"
          title="Expand inspector"
        >
          <ChevronLeft size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-80 flex flex-col border-l border-[#2a3042] bg-[#161922] shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a3042]">
        <span className="font-semibold text-sm">Inspector</span>
        <button
          onClick={toggleInspector}
          className="p-1 rounded hover:bg-[#2a3042] text-slate-400"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <div
                className="inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${nodeTypeColor(selectedNode.node_type)}22`,
                  color: nodeTypeColor(selectedNode.node_type),
                }}
              >
                {formatNodeType(selectedNode.node_type)}
              </div>
              <h2 className="text-lg font-semibold mt-2">{selectedNode.label}</h2>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {selectedNode.verified ? (
                <>
                  <Shield size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Verified</span>
                </>
              ) : (
                <>
                  <ShieldOff size={14} className="text-amber-400" />
                  <span className="text-amber-400">Unverified</span>
                </>
              )}
            </div>

            {selectedNode.content && (
              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">
                  Content
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedNode.content}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">
                Provenance
              </h3>
              <dl className="text-sm space-y-1.5">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Source</dt>
                  <dd className="text-slate-300">{selectedNode.provenance.source_type}</dd>
                </div>
                {selectedNode.provenance.excerpt && (
                  <div>
                    <dt className="text-slate-500 mb-0.5">Excerpt</dt>
                    <dd className="text-slate-400 text-xs italic">
                      "{selectedNode.provenance.excerpt}"
                    </dd>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-400">
                  <div>
                    <dt className="text-slate-500">Source ID</dt>
                    <dd className="truncate">{selectedNode.provenance.source_id}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Created</dt>
                    <dd>{new Date(selectedNode.created_at).toLocaleDateString()}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {graph && (
              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">
                  Connections
                </h3>
                <ul className="text-sm space-y-1">
                  {graph.edges
                    .filter(
                      (e) =>
                        e.source_id === selectedNode.id ||
                        e.target_id === selectedNode.id,
                    )
                    .map((edge) => {
                      const isOutgoing = edge.source_id === selectedNode.id
                      const otherId = isOutgoing ? edge.target_id : edge.source_id
                      const other = graph.nodes.find((n) => n.id === otherId)
                      return (
                        <li
                          key={edge.id}
                          className="flex items-center gap-2 text-slate-400"
                        >
                          <span className="text-indigo-400">
                            {isOutgoing ? '→' : '←'}
                          </span>
                          <span className="text-[11px] uppercase">
                            {edge.edge_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-slate-300 truncate">
                            {other?.label ?? otherId}
                          </span>
                        </li>
                      )
                    })}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">
            Select a node to inspect its properties, provenance, and connections
          </div>
        )}
      </div>
    </aside>
  )
}
