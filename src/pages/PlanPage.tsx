import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlanTask } from '@/types';
import { GanttGrid } from '@/components/plan/GanttGrid';
import { GanttTimeline } from '@/components/plan/GanttTimeline';
import { getGanttTimelineDates } from '@/lib/ganttUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDetailsForm } from '@/components/plan/TaskDetailsForm';
import { toast } from 'sonner';
import { formatISO, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { TimesheetView } from '@/components/plan/TimesheetView';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
const fetchPlanTasks = async (): Promise<PlanTask[]> => {
  const res = await fetch('/api/plan/1'); // Using a dummy project ID
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};
const updatePlanTask = async (task: Partial<PlanTask> & { id: string }): Promise<PlanTask> => {
  const res = await fetch(`/api/plan/tasks/${task.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};
const addPlanTask = async (data: { parentId?: string; task: Omit<PlanTask, 'id'> }): Promise<PlanTask> => {
  const res = await fetch('/api/plan/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
};
const deleteTask = async (taskId: string) => {
  const res = await fetch(`/api/plan/tasks/${taskId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
};
export function PlanPage() {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading, isError } = useQuery<PlanTask[]>({ queryKey: ['planTasks'], queryFn: fetchPlanTasks });
  const [selectedTask, setSelectedTask] = useState<PlanTask | null>(null);
  const [viewFilter, setViewFilter] = useState<'weekly' | 'monthly' | 'all'>('all');
  const gridRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState<number>(560); // ~35rem default
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(gridWidth);
  const onResizerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = gridWidth;
    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = ev.clientX - startXRef.current;
      const next = Math.min(Math.max(startWidthRef.current + delta, 360), 1000);
      setGridWidth(next);
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  useEffect(() => {
    const gridEl = gridRef.current;
    const timelineEl = timelineRef.current;
    const headerEl = headerRef.current;
    let isSyncing = false;
    const handleGridScroll = () => {
      if (timelineEl && !isSyncing) {
        isSyncing = true;
        timelineEl.scrollTop = gridEl!.scrollTop;
        requestAnimationFrame(() => { isSyncing = false; });
      }
    };
    const handleTimelineScroll = () => {
      if (gridEl && headerEl && !isSyncing) {
        isSyncing = true;
        gridEl.scrollTop = timelineEl!.scrollTop;
        headerEl.scrollLeft = timelineEl!.scrollLeft;
        requestAnimationFrame(() => { isSyncing = false; });
      }
    };
    gridEl?.addEventListener('scroll', handleGridScroll);
    timelineEl?.addEventListener('scroll', handleTimelineScroll);
    return () => {
      gridEl?.removeEventListener('scroll', handleGridScroll);
      timelineEl?.removeEventListener('scroll', handleTimelineScroll);
    };
  }, [isLoading]);
  const updateMutation = useMutation({
    mutationFn: updatePlanTask,
    onSuccess: () => {
      toast.success('Task updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['planTasks'] });
    },
    onError: () => toast.error('Failed to update task.'),
  });
  const addMutation = useMutation({
    mutationFn: addPlanTask,
    onSuccess: () => {
      toast.success('Task added successfully!');
      queryClient.invalidateQueries({ queryKey: ['planTasks'] });
    },
    onError: () => toast.error('Failed to add task.'),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully!');
      setSelectedTask(null);
      queryClient.invalidateQueries({ queryKey: ['planTasks'] });
    },
    onError: () => toast.error('Failed to delete task.'),
  });
  const handleSaveTask = (updatedTask: PlanTask) => updateMutation.mutate(updatedTask);
  const handleTaskTimelineUpdate = (taskId: string, newStartDate: Date, newEndDate: Date) => {
    const taskToUpdate = tasks?.find(t => t.id === taskId);
    if (taskToUpdate) {
      updateMutation.mutate({ id: taskId, startDate: formatISO(newStartDate), endDate: formatISO(newEndDate) });
    }
  };
  const handleAddTask = (parentId?: string) => {
    const newWbs = parentId ? `${tasks?.find(t => t.id === parentId)?.wbs}.${(tasks?.find(t => t.id === parentId)?.subTasks?.length || 0) + 1}` : `${(tasks?.length || 0) + 1}`;
    const newTask: Omit<PlanTask, 'id'> = {
      wbs: newWbs,
      projectCase: 'SP-2024',
      name: 'New Task',
      description: 'A new task description.',
      assignees: ['Unassigned'],
      priority: 'Medium',
      status: 'Backlog',
      startDate: formatISO(new Date()),
      endDate: formatISO(addDays(new Date(), 1)),
      estHours: 8,
      usedHours: 0,
    };
    addMutation.mutate({ parentId, task: newTask });
  };
  const handleDeleteTask = (taskId: string) => deleteMutation.mutate(taskId);
  const { displayStartDate, displayEndDate } = useMemo(() => {
    if (!tasks) return { displayStartDate: new Date(), displayEndDate: new Date() };
    const today = new Date();
    switch (viewFilter) {
      case 'weekly': {
        return { displayStartDate: startOfWeek(today, { weekStartsOn: 1 }), displayEndDate: endOfWeek(today, { weekStartsOn: 1 }) };
      }
      case 'monthly': {
        return { displayStartDate: startOfMonth(today), displayEndDate: endOfMonth(today) };
      }
      case 'all':
      default: {
        const { startDate, endDate } = getGanttTimelineDates(tasks);
        // Extend to complete week boundaries for proper week display
        const extendedStartDate = startOfWeek(startDate, { weekStartsOn: 1 });
        const extendedEndDate = endOfWeek(endDate, { weekStartsOn: 1 });
        return { displayStartDate: extendedStartDate, displayEndDate: extendedEndDate };
      }
    }
  }, [tasks, viewFilter]);
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <div className="flex h-[600px] overflow-hidden rounded-lg border">
          <Skeleton className="w-[89rem]" />
          <div className="flex-grow"><Skeleton className="h-16 w-full" /><Skeleton className="h-full w-full" /></div>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Project Plan</h1>
        <Card className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-96">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold">Failed to Load Project Plan</h3>
            <p>There was an error fetching the plan data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Project Plan</h1>
        <ToggleGroup type="single" value={viewFilter} onValueChange={(value) => value && setViewFilter(value as any)} size="sm">
          <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
          <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
          <ToggleGroupItem value="all">All</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Tabs defaultValue="task" className="flex-grow flex flex-col">
        <TabsList className="flex-shrink-0">
          <TabsTrigger value="task">Task</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="view" disabled>View</TabsTrigger>
        </TabsList>
        <TabsContent value="task" className="flex-grow flex flex-col space-y-4 mt-4">
          <div className="flex-grow flex overflow-hidden rounded-lg border h-full">
            <GanttGrid tasks={tasks} selectedTask={selectedTask} onSelectTask={setSelectedTask} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask} gridRef={gridRef} widthPx={gridWidth} />
            <div
              id="gantt-resizer-handle"
              className="flex-shrink-0 h-full w-2 cursor-col-resize bg-border hover:bg-primary/40 active:bg-primary/60"
              style={{ userSelect: 'none' }}
              title="Drag to resize"
              onMouseDown={onResizerMouseDown}
            />
            <div className="flex-1 min-w-0">
              <GanttTimeline tasks={tasks} startDate={displayStartDate} endDate={displayEndDate} onTaskUpdate={handleTaskTimelineUpdate} timelineRef={timelineRef} headerRef={headerRef} />
            </div>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              Debug: Tasks: {tasks?.length || 0}, Start: {displayStartDate?.toISOString()}, End: {displayEndDate?.toISOString()}
            </div>
          )}
          <div className="flex-shrink-0">
            <TaskDetailsForm task={selectedTask} onSave={handleSaveTask} />
          </div>
        </TabsContent>
        <TabsContent value="timesheet" className="flex-grow mt-4">
          <TimesheetView tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}