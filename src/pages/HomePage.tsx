import { TaskList } from '@/components/TaskList';
import { useTasksQuery } from '@/hooks/useTasks';
import type { Task } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasksQuery();

  const handleEdit = (task: Task) => {
    navigate(`/tasks/${task.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/tasks/new');
  };

  return (
    <div className="pb-20">
      <h2 className="text-lg font-semibold text-white mb-4">Your Tasks</h2>
      
      <TaskList
        tasks={tasks}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      <button
        onClick={handleCreate}
        className="fab"
        aria-label="Create new task"
      >
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
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </button>
    </div>
  );
}
