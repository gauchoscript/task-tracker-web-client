import { TaskList } from '@/components/TaskList';
import { useTasksQuery } from '@/hooks/useTasks';
import { type Task, TaskStatus } from '@/lib/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type FilterStatus = 'all' | TaskStatus;

export function HomePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const { data: tasks = [], isLoading } = useTasksQuery(filter === 'all' ? undefined : filter);

  const handleEdit = (task: Task) => {
    navigate(`/tasks/${task.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/tasks/new');
  };

  return (
    <div className="pb-20">
      <h2 className="text-lg font-semibold text-white mb-4">Your Tasks</h2>
      
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter(TaskStatus.TODO)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === TaskStatus.TODO
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Todo
        </button>
        <button
          onClick={() => setFilter(TaskStatus.DONE)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === TaskStatus.DONE
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Done
        </button>
      </div>
      
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
