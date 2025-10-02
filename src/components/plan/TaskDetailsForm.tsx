import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlanTask, TaskPriority, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskDetailsFormProps {
  task: PlanTask | null;
  onSave: (data: PlanTask) => void;
}

const taskSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['Backlog', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  assignees: z.string().min(1, 'At least one assignee is required'),
  estHours: z.number().min(0, 'Estimated hours must be positive'),
});
type TaskFormData = z.infer<typeof taskSchema>;

export function TaskDetailsForm({ task, onSave }: TaskDetailsFormProps) {
  const { control, handleSubmit, reset, formState: { isDirty, errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      description: '',
      status: 'Backlog',
      priority: 'Medium',
      assignees: '',
      estHours: 0,
    }
  });

  useEffect(() => {
    if (task) {
      reset({
        description: task.description ?? '',
        status: (task.status as TaskStatus) ?? 'Backlog',
        priority: (task.priority as TaskPriority) ?? 'Medium',
        assignees: (task.assignees ?? []).join(', '),
        estHours: task.estHours ?? 0,
      });
    } else {
      reset({
        description: '',
        status: 'Backlog',
        priority: 'Medium',
        assignees: '',
        estHours: 0,
      });
    }
  }, [task, reset]);

  const onSubmit: SubmitHandler<TaskFormData> = (data) => {
    if (!task) return;

    const updatedTask: PlanTask = {
      ...task,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      assignees: data.assignees
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      estHours: data.estHours,
    };

    onSave(updatedTask);
    // Clear dirty state nhưng giữ nguyên value hiển thị
    reset({}, { keepValues: true });
  };

  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a task from the grid above to see its details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Task Details: <span className="font-normal">{task.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea id="description" {...field} className="mt-1" />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="estHours">Est. Hours</Label>
              <Controller
                name="estHours"
                control={control}
                render={({ field }) => (
                  <Input
                    id="estHours"
                    type="number"
                    value={field.value?.toString() || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                )}
              />
              {errors.estHours && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.estHours.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="assignees">Assigned To (comma-separated)</Label>
            <Controller
              name="assignees"
              control={control}
              render={({ field }) => <Input id="assignees" {...field} className="mt-1" />}
            />
            {errors.assignees && (
              <p className="text-sm text-red-500 mt-1">
                {errors.assignees.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!isDirty}>Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}