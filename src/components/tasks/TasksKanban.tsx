import React, { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, DragEndEvent, useSensor, PointerSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { format, parseISO } from 'date-fns';
interface TaskWithProjectName extends Task {
  projectName: string;
}
interface TasksKanbanProps {
  data: TaskWithProjectName[];
}
const updateTaskStatus = async ({ id, status }: { id: string; status: TaskStatus }) => {
  const res = await fetch(`/api/tasks/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update task status');
  return res.json();
};
function TaskCard({ task }: { task: TaskWithProjectName }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 touch-none">
      <CardContent className="p-4">
        <div className="font-bold">{task.name}</div>
        <p className="text-sm text-muted-foreground">{task.projectName}</p>
        <div className="mt-2 flex items-center justify-between">
          <StatusBadge type={`priority-${task.priority}`}>{task.priority}</StatusBadge>
          <span className="text-sm text-muted-foreground">Due: {format(parseISO(task.dueDate), 'MMM dd')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
function KanbanColumn({ title, tasks }: { title: TaskStatus; tasks: TaskWithProjectName[] }) {
  const { setNodeRef } = useSortable({ id: title, data: { type: 'container' } });
  return (
    <Card ref={setNodeRef} className="flex-1 bg-muted/50">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
export function TasksKanban({ data: tasks }: TasksKanbanProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
  const columns = useMemo(() => {
    const backlog = tasks.filter(t => t.status === 'Backlog');
    const inProgress = tasks.filter(t => t.status === 'In Progress');
    const done = tasks.filter(t => t.status === 'Done');
    return { Backlog: backlog, 'In Progress': inProgress, Done: done };
  }, [tasks]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    const overIsContainer = over.data.current?.type === 'container';
    const destinationColumn = overIsContainer
      ? overId as TaskStatus
      : tasks.find(t => t.id === overId)?.status;
    if (destinationColumn && activeTask.status !== destinationColumn) {
      mutation.mutate({ id: activeId as string, status: destinationColumn });
    }
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-6">
        <SortableContext items={Object.keys(columns)}>
          {(['Backlog', 'In Progress', 'Done'] as TaskStatus[]).map(status => (
            <KanbanColumn key={status} title={status} tasks={columns[status]} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}