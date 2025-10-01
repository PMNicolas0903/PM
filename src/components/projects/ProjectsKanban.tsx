import React, { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, DragEndEvent, useSensor, PointerSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Project, ProjectStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { format, parseISO } from 'date-fns';
interface ProjectsKanbanProps {
  data: Project[];
}
const updateProjectStatus = async ({ id, status }: { id: string; status: ProjectStatus }) => {
  const res = await fetch(`/api/projects/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update project status');
  return res.json();
};
function ProjectCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 touch-none">
      <CardContent className="p-4">
        <div className="font-bold">{project.name}</div>
        <p className="text-sm text-muted-foreground">{project.case}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Due: {format(parseISO(project.dueDate), 'MMM dd')}</span>
          <StatusBadge type={`status-${project.status}`}>{project.status}</StatusBadge>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={project.progress} className="h-2" />
          <span className="text-sm font-medium">{project.progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
function KanbanColumn({ title, projects }: { title: ProjectStatus; projects: Project[] }) {
  const { setNodeRef } = useSortable({ id: title, data: { type: 'container' } });
  return (
    <Card ref={setNodeRef} className="flex-1 bg-muted/50">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
export function ProjectsKanban({ data: projects }: ProjectsKanbanProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateProjectStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  const columns = useMemo(() => {
    const backlog = projects.filter(p => p.status === 'Backlog');
    const inProgress = projects.filter(p => p.status === 'In Progress');
    const done = projects.filter(p => p.status === 'Done');
    return { Backlog: backlog, 'In Progress': inProgress, Done: done };
  }, [projects]);
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
    const activeProject = projects.find(p => p.id === activeId);
    if (!activeProject) return;
    const overIsContainer = over.data.current?.type === 'container';
    const destinationColumn = overIsContainer
      ? overId as ProjectStatus
      : projects.find(p => p.id === overId)?.status;
    if (destinationColumn && activeProject.status !== destinationColumn) {
      mutation.mutate({ id: activeId as string, status: destinationColumn });
    }
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-6">
        <SortableContext items={Object.keys(columns)}>
          {(['Backlog', 'In Progress', 'Done'] as ProjectStatus[]).map(status => (
            <KanbanColumn key={status} title={status} projects={columns[status]} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}