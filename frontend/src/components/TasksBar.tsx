import { CheckCircle2, Loader2, XCircle, X } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export function TasksBar() {
  const tasks = useAppStore((s) => s.tasks)
  const removeTask = useAppStore((s) => s.removeTask)

  if (tasks.length === 0) return null

  return (
    <div className="border-t border-[#2a3042] bg-[#161922] px-4 py-2 flex gap-3 overflow-x-auto">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2230] border border-[#2a3042] text-sm shrink-0 min-w-[200px]"
        >
          {task.status === 'running' && (
            <Loader2 size={14} className="animate-spin text-indigo-400" />
          )}
          {task.status === 'completed' && (
            <CheckCircle2 size={14} className="text-emerald-400" />
          )}
          {task.status === 'failed' && (
            <XCircle size={14} className="text-red-400" />
          )}
          {task.status === 'pending' && (
            <Loader2 size={14} className="text-slate-400" />
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{task.name}</div>
            {task.message && (
              <div className="text-[11px] text-slate-400 truncate">{task.message}</div>
            )}
            {task.status === 'running' && (
              <div className="mt-1 h-1 rounded-full bg-[#2a3042] overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            )}
          </div>

          {(task.status === 'completed' || task.status === 'failed') && (
            <button
              onClick={() => removeTask(task.id)}
              className="p-0.5 rounded hover:bg-[#2a3042] text-slate-500"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
