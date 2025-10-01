import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/StatusBadge';
interface TaskWithProjectName extends Task {
  projectName: string;
}
export const columns: ColumnDef<TaskWithProjectName>[] = [
  {
    accessorKey: 'name',
    header: 'Task Name',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'projectName',
    header: 'Project',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge type={`status-${row.original.status}`}>{row.original.status}</StatusBadge>,
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => <StatusBadge type={`priority-${row.original.priority}`}>{row.original.priority}</StatusBadge>,
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => format(parseISO(row.original.dueDate), 'MMM dd, yyyy'),
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