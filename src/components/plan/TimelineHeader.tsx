import React from 'react';
import {
  format,
  isWeekend,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';

interface TimelineHeaderProps {
  months: Array<{
    key: number;
    count: number;
    start: Date;
    name: string;
  }>;
  weeks: Array<{
    key: number;
    count: number;
    start: Date;
    weekNo: number;
  }>;
  days: Date[];
  dayWidth: number;
  timelineWidthPx: string;
}

export function TimelineHeader({
  months,
  weeks,
  days,
  dayWidth,
  timelineWidthPx,
}: TimelineHeaderProps) {
  return (
    <div style={{ width: timelineWidthPx, flex: '0 0 auto' }}>
      {/* Months row - Primavera style */}
      <div className="flex bg-gray-200 border-b border-gray-300">
        {months.map((m) => (
          <div
            key={m.key}
            className="flex-none border-r border-gray-300 text-center text-xs font-bold h-6 flex items-center justify-center bg-gray-200"
            style={{ width: m.count * dayWidth, flex: '0 0 auto' }}
          >
            {m.name}
          </div>
        ))}
      </div>

      {/* Weeks row */}
      <div className="flex bg-gray-100 border-b border-gray-300">
        {weeks.map((w) => (
          <div
            key={w.key}
            className="flex-none border-r border-gray-200 text-center text-xs h-5 flex items-center justify-center bg-gray-100"
            style={{ width: w.count * dayWidth, flex: '0 0 auto' }}
          >
            W{w.weekNo}
          </div>
        ))}
      </div>

      {/* Days row */}
      <div className="flex bg-white">
        {days.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              'flex-none border-r border-gray-200 text-center text-xs h-5 flex items-center justify-center',
              isWeekend(day) && 'bg-red-50',
              isToday(day) && 'bg-blue-100'
            )}
            style={{ width: dayWidth, flex: '0 0 auto' }}
          >
            <div className={cn(
              'font-mono',
              isToday(day) && 'font-bold text-blue-600',
              isWeekend(day) && 'text-red-600'
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}