import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
const badgeVariants = cva(
  'border-transparent font-semibold',
  {
    variants: {
      type: {
        'status-Backlog': 'bg-status-backlog text-status-backlog-foreground hover:bg-status-backlog/80',
        'status-In Progress': 'bg-status-inprogress text-status-inprogress-foreground hover:bg-status-inprogress/80',
        'status-Done': 'bg-status-done text-status-done-foreground hover:bg-status-done/80',
        'priority-Low': 'bg-priority-low text-priority-low-foreground hover:bg-priority-low/80',
        'priority-Medium': 'bg-priority-medium text-priority-medium-foreground hover:bg-priority-medium/80',
        'priority-High': 'bg-priority-high text-priority-high-foreground hover:bg-priority-high/80',
      },
    },
    defaultVariants: {},
  }
);
export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  type: 'status-Backlog' | 'status-In Progress' | 'status-Done' | 'priority-Low' | 'priority-Medium' | 'priority-High';
  children: React.ReactNode;
}
export function StatusBadge({ className, type, children, ...props }: StatusBadgeProps) {
  return (
    <Badge className={cn(badgeVariants({ type }), className)} {...props}>
      {children}
    </Badge>
  );
}