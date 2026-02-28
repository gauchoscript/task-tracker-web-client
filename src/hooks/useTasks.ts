import { MAX_POSITION, TaskStatus, type CreateTaskRequest, type Task, type UpdateTaskRequest } from '@/lib/types';
import { tasksApi } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query key factory
export const taskKeys = {
  all: ['tasks'] as const,
  list: (status?: string) => [...taskKeys.all, { status }] as const,
};

// Fetch all tasks
export function useTasksQuery(status?: string) {
  return useQuery({
    queryKey: taskKeys.list(status),
    queryFn: () => tasksApi.getTasks(status),
  });
}

// Create task mutation with optimistic update
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.createTask(data),
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list());

      // Optimistically add new task
      if (previousTasks) {
        const optimisticTask: Task = {
          id: `temp-${Date.now()}`,
          title: newTask.title,
          description: newTask.description,
          status: TaskStatus.TODO,
          position: MAX_POSITION, // High number to ensure it appears first optimistically
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData<Task[]>(taskKeys.list(), [
          optimisticTask,
          ...previousTasks,
        ]);
      }

      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// Update task mutation with optimistic update
export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      tasksApi.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list());

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.list(),
          previousTasks.map((task) =>
            task.id === id
              ? { ...task, ...data, updated_at: new Date().toISOString() }
              : task
          )
        );
      }

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// Delete task mutation with optimistic update
export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list());

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.list(),
          previousTasks.filter((task) => task.id !== id)
        );
      }

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
// Move task mutation with optimistic update
export function useMoveTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      above_id,
      below_id,
    }: {
      id: string;
      above_id?: string;
      below_id?: string;
    }) => tasksApi.moveTask(id, above_id, below_id),
    onMutate: async ({ id, above_id, below_id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot the previous values for all tasks queries
      const previousQueries = queryClient.getQueriesData<Task[]>({
        queryKey: taskKeys.all,
      });

      // Optimistically update every task list in the cache
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (oldTasks) => {
        if (!oldTasks) return oldTasks;

        const tasks = [...oldTasks];
        const taskIndex = tasks.findIndex((t) => t.id === id);

        // Only update if the moved task exists in this specific list
        if (taskIndex !== -1) {
          const [movedTask] = tasks.splice(taskIndex, 1);

          // Find new index using above_id or below_id
          let newIndex = -1;
          if (above_id) {
            newIndex = tasks.findIndex((t) => t.id === above_id);
            if (newIndex !== -1) newIndex++;
          } else if (below_id) {
            newIndex = tasks.findIndex((t) => t.id === below_id);
          } else {
            newIndex = tasks.length;
          }

          if (newIndex !== -1) {
            tasks.splice(newIndex, 0, movedTask);
          }
        }

        return tasks;
      });

      return { previousQueries };
    },
    onError: (_err, _variables, context) => {
      // Rollback to the previous state for all affected queries
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
