import { TaskForm } from '@/components/TaskForm';
import { useCreateTaskMutation } from '@/hooks/useTasks';
import type { TaskFormData } from '@/lib/schemas';
import { useNavigate } from 'react-router-dom';

export function NewTaskPage() {
  const navigate = useNavigate();
  const createMutation = useCreateTaskMutation();

  const handleSubmit = (data: TaskFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">New Task</h2>
      <div className="glass-card p-5">
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  );
}
