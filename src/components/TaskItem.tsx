import { useDeleteTaskMutation } from '@/hooks/useTasks';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { TaskStatus, type Task } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  isOverlay?: boolean;
}

export function TaskItem({ task, onEdit, isOverlay }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !!isOverlay });

  const deleteMutation = useDeleteTaskMutation();
  const isDone = task.status === TaskStatus.DONE;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(task.id);
    }
  };

  // If this item is being dragged in the list, show a placeholder
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[100px] mb-3 border-2 border-dashed border-blue-500/50 rounded-xl bg-blue-500/5"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={isOverlay ? undefined : style}
      className={`glass-card p-4 mb-3 transition-all duration-200 ${
        isOverlay ? 'shadow-2xl ring-2 ring-blue-500/50 cursor-grabbing' : ''
      } ${
        isDone 
          ? 'border-green-500/30 bg-green-500/5 opacity-80' 
          : 'hover:border-blue-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={`mt-1 p-1 shrink-0 ${
            isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
          } touch-none transition-colors ${
            isDone ? 'text-green-500/40 hover:text-green-400' : 'text-slate-500 hover:text-white'
          }`}
          aria-label="Drag to reorder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0" onClick={() => !isOverlay && onEdit(task)}>
              <h3 className={`text-base font-semibold truncate transition-colors ${
                isDone ? 'line-through text-green-400/70' : 'text-white'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-1 text-sm line-clamp-2 transition-colors ${
                  isDone ? 'text-green-500/40' : 'text-slate-400'
                }`}>
                  {task.description}
                </p>
              )}
              {task.due_date && (
                <div className={`mt-2 flex items-center gap-1.5 text-xs transition-colors ${
                  isDone ? 'text-green-500/40' : 'text-slate-500'
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <span>{formatDateForDisplay(task.due_date)}</span>
                </div>
              )}
            </div>
            {!isOverlay && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onEdit(task)}
                  className={`p-2 transition-colors ${
                    isDone ? 'text-green-500/40 hover:text-green-400' : 'text-slate-400 hover:text-white'
                  }`}
                  aria-label="Edit task"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className={`p-2 transition-colors disabled:opacity-50 ${
                    isDone ? 'text-green-500/40 hover:text-red-400' : 'text-slate-400 hover:text-red-400'
                  }`}
                  aria-label="Delete task"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
