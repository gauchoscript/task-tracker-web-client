import { parseDateForInput } from '@/lib/dateUtils';
import { taskSchema, type TaskFormData } from '@/lib/schemas';
import { TaskStatus, type Task } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isSubmitting }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? TaskStatus.TODO,
      due_date: parseDateForInput(task?.due_date),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          placeholder="Enter task title"
          className="input-field"
          autoFocus
        />
        {errors.title && (
          <p className="error-text">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-slate-300 mb-2">
          Due Date
        </label>
        <input
          id="due_date"
          type="date"
          {...register('due_date')}
          className="input-field"
        />
        {errors.due_date && (
          <p className="error-text">{errors.due_date.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Add details about this task..."
          rows={5}
          className="input-field resize-none"
        />
        {errors.description && (
          <p className="error-text">{errors.description.message}</p>
        )}
      </div>

      {task && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-2">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="input-field"
          >
            <option value={TaskStatus.TODO}>Todo</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>
          {errors.status && (
            <p className="error-text">{errors.status.message}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white text-center py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
