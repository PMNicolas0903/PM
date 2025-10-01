import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ReportSummary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
const fetchReportSummary = async (): Promise<ReportSummary> => {
  const res = await fetch('/api/reports/summary');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};
export function ReportsPage() {
  const { data, isLoading, isError } = useQuery<ReportSummary>({
    queryKey: ['reportSummary'],
    queryFn: fetchReportSummary,
  });
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-96 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
        </>
      );
    }
    if (isError) {
      return (
        <Card className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-96">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-semibold">Failed to Load Reports</h3>
            <p>There was an error fetching the report data. Please try again later.</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Time Analysis (EST vs. USED Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.timeAnalysis} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="est" fill="hsl(var(--chart-1))" name="Estimated Hours" />
                  <Bar dataKey="used" fill="hsl(var(--chart-2))" name="Used Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.overdueTasks && data.overdueTasks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.overdueTasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.project}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">{task.days} days</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No overdue tasks. Great job!</p>
            )}
          </CardContent>
        </Card>
      </>
    );
  };
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      {renderContent()}
    </div>
  );
}