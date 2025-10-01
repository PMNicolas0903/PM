import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}
export function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <Card className="transition-all hover:shadow-md hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          <span
            className={cn(
              'flex items-center gap-1 mr-1',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {Math.abs(change)}%
          </span>
          from last month
        </p>
      </CardContent>
    </Card>
  );
}