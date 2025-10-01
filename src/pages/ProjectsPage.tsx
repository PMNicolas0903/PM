import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, AlertTriangle } from 'lucide-react';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { ProjectsKanban } from '@/components/projects/ProjectsKanban';
import { AddProjectModal } from '@/components/projects/AddProjectModal';
import { useAppStore } from '@/stores/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { Project } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
type ViewMode = 'table' | 'kanban';
const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};
export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') as ViewMode) || 'table';
  const { searchQuery } = useAppStore();
  const { data: projects, isLoading, isError } = useQuery<Project[]>({ queryKey: ['projects'], queryFn: fetchProjects });
  const setViewMode = (mode: ViewMode) => {
    setSearchParams({ view: mode });
  };
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    return projects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.case.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);
  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-96 w-full" />;
    }
    if (isError) {
      return (
        <Card className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold">Failed to Load Projects</h3>
            <p>There was an error fetching the project data. Please try again later.</p>
          </CardContent>
        </Card>
      );
    }
    return viewMode === 'table' ? (
      <ProjectsTable data={filteredProjects} />
    ) : (
      <ProjectsKanban data={filteredProjects} />
    );
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
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
          <AddProjectModal />
        </div>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}