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
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter(TaskStatus.TODO)}
          className={`filter-tab ${filter === TaskStatus.TODO ? 'active' : ''}`}
        >
          Todo
        </button>
        <button
          onClick={() => setFilter(TaskStatus.DONE)}
          className={`filter-tab ${filter === TaskStatus.DONE ? 'active' : ''}`}
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
