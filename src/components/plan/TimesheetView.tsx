import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlanTask, TimesheetState } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Send, Redo } from 'lucide-react';
interface TimesheetViewProps {
  tasks: PlanTask[];
}
const flattenTasks = (tasks: PlanTask[]): PlanTask[] => {
  const allTasks: PlanTask[] = [];
  const recurse = (task: PlanTask) => {
    allTasks.push(task);
    if (task.subTasks) {
      task.subTasks.forEach(recurse);
    }
  };
  tasks.forEach(recurse);
  return allTasks;
};
const updateTimesheet = async ({ taskId, state }: { taskId: string; state: 'submitted' | 'resubmitted' }) => {
  const endpoint = state === 'submitted' ? '/api/timesheet/submit' : '/api/timesheet/resubmit';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId }),
  });
  if (!res.ok) throw new Error(`Failed to ${state} timesheet`);
  return res.json();
};
const getStatusBadgeClass = (status: TimesheetState) => {
  switch (status) {
    case 'submitted': return 'bg-green-100 text-green-800';
    case 'resubmitted': return 'bg-blue-100 text-blue-800';
    case 'draft':
    default: return 'bg-gray-100 text-gray-800';
  }
};
export function TimesheetView({ tasks }: TimesheetViewProps) {
  const queryClient = useQueryClient();
  const flatTasks = flattenTasks(tasks);
  const mutation = useMutation({
    mutationFn: updateTimesheet,
    onSuccess: (data, variables) => {
      toast.success(`Timesheet for "${data.task.name}" has been ${variables.state}.`);
      queryClient.invalidateQueries({ queryKey: ['planTasks'] });
    },
    onError: (error, variables) => {
      toast.error(`Failed to ${variables.state} timesheet: ${error.message}`);
    },
  });
  const handleAction = (taskId: string, state: 'submitted' | 'resubmitted') => {
    mutation.mutate({ taskId, state });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet Submission</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <div className="flex bg-muted font-semibold text-sm border-b">
            <div className="w-16 p-2 text-center">WBS</div>
            <div className="flex-1 p-2">Task Name</div>
            <div className="w-32 p-2 text-center">USED Hours</div>
            <div className="w-40 p-2 text-center">Status</div>
          </div>
          <div className="max-h-[calc(100vh-28rem)] overflow-y-auto">
            {flatTasks.map(task => (
              <ContextMenu key={task.id}>
                <ContextMenuTrigger>
                  <div className="flex border-b text-sm items-center hover:bg-muted/50">
                    <div className="w-16 p-2 text-center text-muted-foreground">{task.wbs}</div>
                    <div className="flex-1 p-2">{task.name}</div>
                    <div className="w-32 p-2 text-center font-medium">{task.usedHours}</div>
                    <div className="w-40 p-2 text-center">
                      <Badge className={cn('capitalize', getStatusBadgeClass(task.timesheetState || 'draft'))}>
                        {task.timesheetState || 'draft'}
                      </Badge>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    disabled={task.usedHours === 0 || task.timesheetState === 'submitted' || task.timesheetState === 'resubmitted'}
                    onClick={() => handleAction(task.id, 'submitted')}
                  >
                    <Send className="mr-2 h-4 w-4" /> Submit
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={task.usedHours === 0 || task.timesheetState === 'draft'}
                    onClick={() => handleAction(task.id, 'resubmitted')}
                  >
                    <Redo className="mr-2 h-4 w-4" /> Resubmit
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}