import { useMoveTaskMutation } from '@/hooks/useTasks';
import type { Task } from '@/lib/types';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  isLoading: boolean;
}

export function TaskList({ tasks, onView, onEdit, isLoading }: TaskListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const moveMutation = useMoveTaskMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      
      const aboveTask = reorderedTasks[newIndex - 1];
      const belowTask = reorderedTasks[newIndex + 1];

      moveMutation.mutate({
        id: active.id as string,
        above_id: aboveTask?.id,
        below_id: belowTask?.id,
      });
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <div className="min-h-[100px]">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onView={onView} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskItem 
            task={activeTask} 
            onView={onView}
            onEdit={onEdit} 
            isOverlay 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
