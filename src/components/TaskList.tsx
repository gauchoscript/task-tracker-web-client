import type { Task } from '@/lib/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  isLoading: boolean;
}

export function TaskList({ tasks, onEdit, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">No tasks yet</p>
        <p className="text-slate-500 text-sm mt-1">
          Tap the + button to create your first task
        </p>
      </div>
    );
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEdit} />
      ))}
    </div>
  );
}
