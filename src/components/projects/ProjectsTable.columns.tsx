import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/StatusBadge';
export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: 'Project Name',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-muted-foreground">{row.original.case}</div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge type={`status-${row.original.status}`}>{row.original.status}</StatusBadge>,
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => format(parseISO(row.original.startDate), 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => format(parseISO(row.original.dueDate), 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Progress value={row.original.progress} className="h-2 w-24" />
        <span className="text-sm font-medium">{row.original.progress}%</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];