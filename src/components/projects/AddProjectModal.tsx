import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { Project, ProjectStatus } from '@/types';
import { formatISO, addDays } from 'date-fns';
const projectSchema = z.object({
  case: z.string().min(1, 'Project case is required'),
  name: z.string().min(1, 'Project name is required'),
  owner: z.string().min(1, 'Owner is required'),
});
type ProjectFormData = z.infer<typeof projectSchema>;
const createProject = async (newProject: Omit<Project, 'id' | 'progress'>): Promise<Project> => {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProject),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
};
export function AddProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { case: '', name: '', owner: '' },
  });
  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success('Project created successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      reset();
      setIsOpen(false);
    },
    onError: () => {
      toast.error('Failed to create project.');
    },
  });
  const onSubmit = (data: ProjectFormData) => {
    const newProject: Omit<Project, 'id' | 'progress'> = {
      ...data,
      status: 'Backlog' as ProjectStatus,
      startDate: formatISO(new Date()),
      dueDate: formatISO(addDays(new Date(), 30)), // Default due date
    };
    mutation.mutate(newProject);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="case">Project Case</Label>
              <Controller name="case" control={control} render={({ field }) => <Input id="case" placeholder="SP-2024" {...field} />} />
              {errors.case && <p className="text-sm text-red-500">{errors.case.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" placeholder="Solar Panel Installation" {...field} />} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Controller name="owner" control={control} render={({ field }) => <Input id="owner" placeholder="Alice" {...field} />} />
              {errors.owner && <p className="text-sm text-red-500">{errors.owner.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}