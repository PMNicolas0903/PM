import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, ListChecks, ListTodo, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { TaskProgressChart } from '@/components/dashboard/TaskProgressChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStats, RecentProject, UpcomingDeadline } from '@/types';
import { cn } from '@/lib/utils';
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};
const fetchRecentProjects = async (): Promise<RecentProject[]> => {
  const res = await fetch('/api/dashboard/recent-projects');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};
const fetchUpcomingDeadlines = async (): Promise<UpcomingDeadline[]> => {
  const res = await fetch('/api/dashboard/upcoming-deadlines');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};
const getStatusBadgeClass = (status: RecentProject['status']) => {
  switch (status) {
    case 'In Progress': return 'bg-status-inprogress text-status-inprogress-foreground hover:bg-status-inprogress';
    case 'Done': return 'bg-status-done text-status-done-foreground hover:bg-status-done';
    case 'Backlog': return 'bg-status-backlog text-status-backlog-foreground hover:bg-status-backlog';
    default: return 'bg-secondary text-secondary-foreground';
  }
};
export function HomePage() {
  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useQuery({ queryKey: ['dashboardStats'], queryFn: fetchDashboardStats });
  const { data: recentProjects, isLoading: isLoadingProjects, isError: isErrorProjects } = useQuery({ queryKey: ['recentProjects'], queryFn: fetchRecentProjects });
  const { data: upcomingDeadlines, isLoading: isLoadingDeadlines, isError: isErrorDeadlines } = useQuery({ queryKey: ['upcomingDeadlines'], queryFn: fetchUpcomingDeadlines });
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : isErrorStats ? (
          <div className="col-span-full rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive-foreground">
            Could not load dashboard stats.
          </div>
        ) : stats ? (
          <>
            <StatCard title="Total Projects" value={stats.totalProjects.value.toString()} change={stats.totalProjects.change} icon={<FolderKanban className="h-5 w-5 text-muted-foreground" />} />
            <StatCard title="Pending Tasks" value={stats.pendingTasks.value.toString()} change={stats.pendingTasks.change} icon={<ListTodo className="h-5 w-5 text-muted-foreground" />} />
            <StatCard title="Completed Tasks" value={stats.completedTasks.value.toString()} change={stats.completedTasks.change} icon={<ListChecks className="h-5 w-5 text-muted-foreground" />} />
            <StatCard title="Overdue Tasks" value={stats.overdueTasks.value.toString()} change={stats.overdueTasks.change} icon={<Clock className="h-5 w-5 text-muted-foreground" />} />
          </>
        ) : null}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <ProjectStatusChart />
        <TaskProgressChart />
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDeadlines ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : isErrorDeadlines ? (
              <p className="text-center text-destructive">Could not load deadlines.</p>
            ) : upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <ul className="space-y-4">
                {upcomingDeadlines.map(d => (
                  <li key={d.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{d.taskName}</p>
                      <p className="text-sm text-muted-foreground">{d.projectName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{format(parseISO(d.dueDate), 'MMM dd')}</p>
                      <p className="text-sm text-red-500">{d.daysLeft} days left</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">No upcoming deadlines.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProjects ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : isErrorProjects ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-destructive">
                    Could not load recent projects.
                  </TableCell>
                </TableRow>
              ) : (
                recentProjects?.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-muted-foreground">{p.case}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('border-transparent font-semibold', getStatusBadgeClass(p.status))}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>{format(parseISO(p.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={p.progress} className="h-2" />
                        <span className="text-sm font-medium">{p.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}