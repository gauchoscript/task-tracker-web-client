import { TaskForm } from '@/components/TaskForm';
import { useTasksQuery, useUpdateTaskMutation } from '@/hooks/useTasks';
import type { TaskFormData } from '@/lib/schemas';
import { useNavigate, useParams } from 'react-router-dom';

export function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasksQuery();
  const updateMutation = useUpdateTaskMutation();

  const task = tasks.find((t) => t.id === id);

  const handleSubmit = (data: TaskFormData) => {
    if (!id) return;
    
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          navigate('/');
        },
      }
    );
  };

  const handleCancel = () => {
    navigate('/');
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
        <p className="text-slate-400 mb-6">The task you are trying to edit does not exist.</p>
        <button onClick={() => navigate('/')} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Edit Task</h2>
      <div className="glass-card p-5">
        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
