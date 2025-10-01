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

const DAY_WIDTH = 32;
const ROW_HEIGHT = 41;

interface GanttTimelineProps {
  tasks: PlanTask[];
  startDate: Date;
  endDate: Date;
  onTaskUpdate: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  timelineRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLDivElement>;
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
    (differenceInCalendarDays(taskEnd, taskStart) + 1) * DAY_WIDTH - 4;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, left, width, top, position: 'absolute' }}
      className="h-6 bg-blue-500 border border-blue-600 rounded-md flex items-center px-2 text-white text-xs z-10 group shadow-sm"
      title={`${task.name} (${task.usedHours}/${task.estHours}h)`}
    >
      <div
        ref={setLeftHandleRef}
        {...leftListeners}
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
      />
      <div
        {...listeners}
        {...attributes}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-between gap-2"
      >
        <span className="truncate flex-shrink">{task.name}</span>
        <span className="flex-shrink-0 font-mono text-white/80">
          ({task.usedHours}/{task.estHours}h)
        </span>
      </div>
      <div
        ref={setRightHandleRef}
        {...rightListeners}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
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
  headerRef,
}: GanttTimelineProps) {
  // cố định về 00:00 local rồi mở rộng trọn tuần (Mon-Sun)
  const extendedStartDate = startOfWeek(startOfDay(startDate), {
    weekStartsOn: 1,
  });
  const extendedEndDate = endOfWeek(startOfDay(endDate), {
    weekStartsOn: 1,
  });

  const { days /*, months*/ } = generateDateHeaders(
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
      <div className="flex-1 bg-muted/20 flex items-center justify-center text-muted-foreground border-l">
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
    <div ref={timelineRef} className="flex-grow overflow-x-auto bg-background">
      <div ref={headerRef} className="sticky top-0 z-20 bg-muted">
        {/* wrapper giữ nguyên width & ngăn shrink */}
        <div style={{ width: timelineWidthPx, flex: '0 0 auto' }}>
          {/* Weeks row */}
          <div className="flex">
            {(() => {
              const weeks: {
                key: number;
                count: number;
                start: Date;
                weekNo: number;
              }[] = [];
              days.forEach((day) => {
                const start = startOfWeek(day, { weekStartsOn: 1 });
                const key = start.getTime();
                const last = weeks[weeks.length - 1];
                if (!last || last.key !== key) {
                  weeks.push({
                    key,
                    count: 1,
                    start,
                    weekNo: getISOWeek(day),
                  });
                } else {
                  last.count += 1;
                }
              });

              return weeks.map((w) => (
                <div
                  key={w.key}
                  className="flex-none border-b border-r text-center text-xs leading-tight h-10 flex flex-col items-center justify-center whitespace-nowrap overflow-hidden"
                  style={{ width: w.count * DAY_WIDTH, flex: '0 0 auto' }}
                >
                  <div className="font-medium text-ellipsis overflow-hidden">
                    Week {w.weekNo}
                  </div>
                  <div className="text-[10px] opacity-70 text-ellipsis overflow-hidden">
                    {format(w.start, 'd MMM yyyy')}
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Days row */}
          <div className="flex">
            {days.map((day) => (
              <div
                key={day.toString()}
                className={cn(
                  'flex-none border-b border-r text-center text-xs h-8 flex items-center justify-center',
                  isWeekend(day) && 'bg-muted-foreground/10'
                )}
                style={{ width: DAY_WIDTH, flex: '0 0 auto' }}
              >
                <div
                  className={cn(
                    '',
                    isToday(day) &&
                      'bg-blue-500 text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center'
                  )}
                >
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Weekday letters row */}
          <div className="flex">
            {days.map((day) => (
              <div
                key={`dow-${day.toString()}`}
                className={cn(
                  'flex-none border-b border-r text-center text-xs h-8 flex items-center justify-center',
                  isWeekend(day) && 'bg-muted-foreground/10'
                )}
                style={{ width: DAY_WIDTH, flex: '0 0 auto' }}
              >
                <div className="uppercase">{format(day, 'EEEEE')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={setNodeRef}
          className="relative bg-background"
          style={{
            height: `${Math.max(flatTasks.length * ROW_HEIGHT, 200)}px`,
            width: timelineWidthPx, // body khớp tuyệt đối với header
            minWidth: '400px',
            backgroundImage:
              'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: `${DAY_WIDTH}px ${ROW_HEIGHT}px`,
          }}
        >
          {flatTasks.map((task, index) => (
            <TaskBar
              key={task.id}
              task={task}
              gridStart={extendedStartDate}
              top={index * ROW_HEIGHT + 8}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
