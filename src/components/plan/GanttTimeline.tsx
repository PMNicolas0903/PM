import React from 'react';
import { PlanTask } from '@/types';
import { generateDateHeaders } from '@/lib/ganttUtils';
import {
  format,
  parseISO,
  isToday,
  isWeekend,
  addDays,
  startOfWeek,
  endOfWeek,
  getISOWeek,
  startOfDay,
  differenceInCalendarDays,
} from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DAY_WIDTH = 24;
const ROW_HEIGHT = 28;

interface GanttTimelineProps {
  tasks: PlanTask[];
  startDate: Date;
  endDate: Date;
  onTaskUpdate: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  timelineRef: React.RefObject<HTMLDivElement>;
}

/* ----------------- helpers ----------------- */
const flattenTasks = (tasks: PlanTask[]): PlanTask[] => {
  const out: PlanTask[] = [];
  const walk = (t: PlanTask) => {
    out.push(t);
    t.subTasks?.forEach(walk);
  };
  tasks.forEach(walk);
  return out;
};

/* ----------------- TaskBar ----------------- */
function TaskBar({
  task,
  gridStart,
  top,
}: {
  task: PlanTask;
  gridStart: Date;
  top: number;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task, type: 'move' },
  });
  const { setNodeRef: setLeftHandleRef, listeners: leftListeners } =
    useDraggable({
      id: `${task.id}-left`,
      data: { task, type: 'resize-left' },
    });
  const { setNodeRef: setRightHandleRef, listeners: rightListeners } =
    useDraggable({
      id: `${task.id}-right`,
      data: { task, type: 'resize-right' },
    });

  const style = { transform: CSS.Translate.toString(transform) };

  const taskStart = startOfDay(parseISO(task.startDate));
  const taskEnd = startOfDay(parseISO(task.endDate));

  const left = differenceInCalendarDays(taskStart, gridStart) * DAY_WIDTH;
  const width =
    (differenceInCalendarDays(taskEnd, taskStart) + 1) * DAY_WIDTH - 2;

  // Primavera-style colors based on status
  const getTaskBarColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-500 border-green-600';
      case 'In Progress':
        return 'bg-blue-500 border-blue-600';
      case 'Backlog':
      default:
        return 'bg-gray-400 border-gray-500';
    }
  };

  const barColor = getTaskBarColor(task.status);

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, left, width, top, position: 'absolute' }}
      className={cn(
        "h-4 border rounded flex items-center px-1 text-white text-xs z-10 group shadow-sm",
        barColor
      )}
      title={`${task.name} (${task.usedHours || 0}/${task.estHours || 0}h)`}
    >
      <div
        ref={setLeftHandleRef}
        {...leftListeners}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize"
      />
      <div
        {...listeners}
        {...attributes}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-between"
      >
        <span className="truncate flex-shrink text-xs">{task.name}</span>
        {width > 60 && (
          <span className="flex-shrink-0 font-mono text-xs text-white/80 ml-1">
            {task.usedHours || 0}h
          </span>
        )}
      </div>
      <div
        ref={setRightHandleRef}
        {...rightListeners}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize"
      />
    </div>
  );
}

/* ----------------- Main ----------------- */
export function GanttTimeline({
  tasks,
  startDate,
  endDate,
  onTaskUpdate,
  timelineRef,
}: GanttTimelineProps) {
  // cố định về 00:00 local rồi mở rộng trọn tuần (Mon-Sun)
  const extendedStartDate = startOfWeek(startOfDay(startDate), {
    weekStartsOn: 1,
  });
  const extendedEndDate = endOfWeek(startOfDay(endDate), {
    weekStartsOn: 1,
  });

  const { days } = generateDateHeaders(
    extendedStartDate,
    extendedEndDate
  );

  const flatTasks = flattenTasks(tasks);

  const { setNodeRef } = useDroppable({ id: 'gantt-droppable-area' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center text-gray-500 border-l border-gray-300">
        <div className="text-center">
          <p>No tasks to display</p>
          <p className="text-sm mt-2">Tasks: {tasks?.length || 0}</p>
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const task = active.data.current?.task as PlanTask | undefined;
    const type = active.data.current?.type as string | undefined;
    if (!task || !type) return;

    const daysDragged = Math.round(delta.x / DAY_WIDTH);
    if (daysDragged === 0) return;

    const originalStart = startOfDay(parseISO(task.startDate));
    const originalEnd = startOfDay(parseISO(task.endDate));

    let newStart = originalStart;
    let newEnd = originalEnd;

    if (type === 'move') {
      const duration = differenceInCalendarDays(originalEnd, originalStart);
      newStart = startOfDay(addDays(originalStart, daysDragged));
      newEnd = startOfDay(addDays(newStart, duration));
    } else if (type === 'resize-right') {
      newEnd = startOfDay(addDays(originalEnd, daysDragged));
      if (differenceInCalendarDays(newEnd, newStart) < 0) newEnd = newStart;
    } else if (type === 'resize-left') {
      newStart = startOfDay(addDays(originalStart, daysDragged));
      if (differenceInCalendarDays(newEnd, newStart) < 0) newStart = newEnd;
    }

    onTaskUpdate(task.id, newStart, newEnd);
  };

  // width cố định cho toàn bộ header để ngăn co khi viewport nhỏ
  const timelineWidthPx = `${days.length * DAY_WIDTH}px`;

  return (
    <div ref={timelineRef} className="flex-grow overflow-x-auto bg-white">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={setNodeRef}
          className="relative bg-white"
          style={{
            height: `${Math.max(flatTasks.length * ROW_HEIGHT, 200)}px`,
            width: timelineWidthPx,
            minWidth: '400px',
            backgroundImage:
              'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
            backgroundSize: `${DAY_WIDTH}px ${ROW_HEIGHT}px`,
          }}
        >
          {/* Today line */}
          {(() => {
            const today = new Date();
            const todayIndex = differenceInCalendarDays(startOfDay(today), extendedStartDate);
            if (todayIndex >= 0 && todayIndex < days.length) {
              const todayLeft = todayIndex * DAY_WIDTH + DAY_WIDTH / 2;
              return (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                  style={{ left: `${todayLeft}px` }}
                  title="Today"
                />
              );
            }
            return null;
          })()}

          {flatTasks.map((task, index) => (
            <TaskBar
              key={task.id}
              task={task}
              gridStart={extendedStartDate}
              top={index * ROW_HEIGHT + 6}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}