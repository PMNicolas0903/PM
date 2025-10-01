import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, AlertTriangle } from 'lucide-react';
import { TasksTable } from '@/components/tasks/TasksTable';
import { TasksKanban } from '@/components/tasks/TasksKanban';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { useAppStore } from '@/stores/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { Task } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
type ViewMode = 'table' | 'kanban';
interface TaskWithProjectName extends Task {
  projectName: string;
}
const fetchTasks = async (): Promise<TaskWithProjectName[]> => {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};
export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') as ViewMode) || 'table';
  const { searchQuery } = useAppStore();
  const { data: tasks, isLoading, isError } = useQuery<TaskWithProjectName[]>({ queryKey: ['tasks'], queryFn: fetchTasks });
  const setViewMode = (mode: ViewMode) => {
    setSearchParams({ view: mode });
  };
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);
  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-96 w-full" />;
    }
    if (isError) {
      return (
        <Card className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold">Failed to Load Tasks</h3>
            <p>There was an error fetching the task data. Please try again later.</p>
          </CardContent>
        </Card>
      );
    }
    return viewMode === 'table' ? (
      <TasksTable data={filteredTasks} />
    ) : (
      <TasksKanban data={filteredTasks} />
    );
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-md bg-muted p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="mr-2 h-4 w-4" />
              Table
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Kanban
            </Button>
          </div>
          <AddTaskModal />
        </div>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}