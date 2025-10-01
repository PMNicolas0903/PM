import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatISO } from 'date-fns';
import { Project, Task, TaskPriority, TaskStatus } from '@/types';
const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  projectId: z.string().min(1, 'Project is required'),
  status: z.enum(['Backlog', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  assignedTo: z.string().min(1, 'Assignee is required'),
  dueDate: z.date({
    required_error: 'Due date is required',
  }),
});
type TaskFormData = z.infer<typeof taskSchema>;
const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};
const createTask = async (newTask: Omit<Task, 'id'>): Promise<Task> => {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
};
export function AddTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: projects } = useQuery<Project[]>({ queryKey: ['projects'], queryFn: fetchProjects });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { name: '', projectId: '', status: 'Backlog', priority: 'Medium', assignedTo: '' },
  });
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset();
      setIsOpen(false);
    },
    onError: () => toast.error('Failed to create task.'),
  });
  const onSubmit = (data: TaskFormData) => {
    const newTask: Omit<Task, 'id'> = {
      ...data,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      dueDate: formatISO(data.dueDate),
    };
    mutation.mutate(newTask);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Fill in the details below to create a new task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" placeholder="Finalize design" {...field} />} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Controller name="projectId" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                  <SelectContent>{projects?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.projectId && <p className="text-sm text-red-500">{errors.projectId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Controller name="priority" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignees">Assigned To</Label>
              <Controller name="assignedTo" control={control} render={({ field }) => <Input id="assignees" placeholder="Alice, Bob" {...field} />} />
              {errors.assignedTo && <p className="text-sm text-red-500">{errors.assignedTo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Controller name="dueDate" control={control} render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
              )} />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}