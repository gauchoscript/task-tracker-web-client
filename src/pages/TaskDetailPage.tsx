import { useDeleteTaskMutation, useTasksQuery, useUpdateTaskMutation } from '@/hooks/useTasks';
import { formatDateForDisplay } from '@/lib/dateUtils';
import { TaskStatus } from '@/lib/types';
import { useNavigate, useParams } from 'react-router-dom';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasksQuery();
  const deleteMutation = useDeleteTaskMutation();
  const updateMutation = useUpdateTaskMutation();

  const task = tasks.find((t) => t.id === id);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(id!, {
        onSuccess: () => {
          navigate('/');
        },
      });
    }
  };

  const handleEdit = () => {
    navigate(`/tasks/${id}/edit`);
  };

  const toggleStatus = () => {
    if (!task) return;
    const newStatus = task.status === TaskStatus.TODO ? TaskStatus.DONE : TaskStatus.TODO;
    updateMutation.mutate({ id: task.id, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white mb-2">Task Not Found</h2>
        <p className="text-slate-400 mb-6">The task you are looking for does not exist.</p>
        <button onClick={() => navigate('/')} className="btn-secondary cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  const isDone = task.status === TaskStatus.DONE;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer group"
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
            className="group-hover:-translate-x-1 transition-transform"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="text-sm font-medium">Back to List</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            title="Edit"
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
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            title="Delete"
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Header Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={toggleStatus}
                  aria-label={isDone ? "Mark as todo" : "Mark as done"}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    isDone 
                      ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isDone ? 'bg-green-400' : 'bg-blue-400'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {task.status}
                  </span>
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
              </div>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight transition-all duration-500 ${
                isDone 
                  ? 'text-slate-500 line-through decoration-green-500/50' 
                  : 'text-white'
              }`}>
                {task.title}
              </h1>
            </div>
          </div>

          {task.description && (
            <div className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/50 to-transparent rounded-full opacity-50" />
              <p className={`text-xl md:text-2xl leading-relaxed font-light ${
                isDone ? 'text-slate-500' : 'text-slate-300'
              }`}>
                {task.description}
              </p>
            </div>
          )}
        </section>

        {/* Metadata Section */}
        <div className="pt-12 border-t border-slate-800/50">
          {task.due_date && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Target Date</h3>
                <div className="text-lg text-white font-semibold">
                  {formatDateForDisplay(task.due_date)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
