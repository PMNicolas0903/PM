import React from 'react';
import { PlanTask } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';

interface GanttGridProps {
  tasks: PlanTask[];
  selectedTask: PlanTask | null;
  onSelectTask: (task: PlanTask) => void;
  onAddTask: (parentId?: string) => void;
  onDeleteTask: (taskId: string) => void;
  gridRef: React.RefObject<HTMLDivElement>;
  widthPx?: number;
}

/** màu nền theo cấp WBS */
const getWbsBandClass = (wbs?: string) => {
  if (!wbs) return 'bg-blue-50';
  const level = Math.max(0, wbs.split('.').length - 1);
  if (level === 0) return 'bg-blue-50';
  if (level === 1) return 'bg-green-50';
  return 'bg-white';
};

type GridRowProps = {
  task: PlanTask;
  level: number;
  /** WBS số: "1", "1.1", "1.1.1", ... */
  wbs: string;
  selectedTask: PlanTask | null;
  onSelectTask: (task: PlanTask) => void;
  onAddTask: (parentId?: string) => void;
  onDeleteTask: (taskId: string) => void;
};

const GridRow: React.FC<GridRowProps> = ({
  task,
  level,
  wbs,
  selectedTask,
  onSelectTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasSubtasks = !!(task.subTasks && task.subTasks.length > 0);

  // vẫn cho phép kéo nhưng không hiển thị icon ở WBS
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `grid-${task.id}`,
    data: { task, type: 'grid-to-timeline' },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const bandClass = getWbsBandClass(wbs);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={{ ...style, height: '41px' }}
          className={cn(
            "flex border-b border-border text-xs hover:bg-muted/50 cursor-pointer relative",
            bandClass,
            selectedTask?.id === task.id && "bg-blue-100 dark:bg-blue-900/50",
            isDragging && "opacity-50 z-50"
          )}
          onClick={() => onSelectTask(task)}
        >
          {/* WBS: chỉ số, KHÔNG icon; vẫn nhận drag */}
          <div
            className="w-12 flex-shrink-0 border-r p-1 text-center flex items-center justify-center cursor-grab active:cursor-grabbing"
            {...(listeners as any)}
            {...(attributes as any)}
            onClick={(e) => e.stopPropagation()}
            title="Drag from here"
          >
            <span className="truncate">{wbs}</span>
          </div>

          <div className="w-20 flex-shrink-0 border-r p-1 truncate">{task.projectCase}</div>

          {/* Task name + toggle chevron */}
          <div
            className="w-32 flex-shrink-0 border-r p-1 flex items-center"
            style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          >
            {hasSubtasks && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="mr-1 p-0.5 rounded-sm hover:bg-muted"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
            <span className="truncate">{task.name}</span>
          </div>

          <div className="w-28 flex-shrink-0 border-r p-1 truncate">{task.description}</div>
          <div className="w-24 flex-shrink-0 border-r p-1 truncate">{task.assignees?.join(', ')}</div>

          <div className="w-20 flex-shrink-0 border-r p-1">
            <StatusBadge type={`priority-${task.priority}`}>{task.priority}</StatusBadge>
          </div>
          <div className="w-24 flex-shrink-0 border-r p-1">
            <StatusBadge type={`status-${task.status}`}>{task.status}</StatusBadge>
          </div>

          <div className="w-20 flex-shrink-0 border-r p-1 text-center">
            {task.startDate ? format(parseISO(task.startDate), 'dd-MMM-yy') : ''}
          </div>
          <div className="w-20 flex-shrink-0 border-r p-1 text-center">
            {task.endDate ? format(parseISO(task.endDate), 'dd-MMM-yy') : ''}
          </div>

          <div className="w-16 flex-shrink-0 border-r p-1 text-right">{task.estHours}</div>
          <div className="w-16 flex-shrink-0 border-r p-1 text-right">{task.usedHours}</div>
          <div className="w-16 flex-shrink-0 p-1 text-right font-medium">
            {(task.estHours ?? 0) - (task.usedHours ?? 0)}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => onAddTask()}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAddTask(task.id)}>
          <Plus className="mr-2 h-4 w-4" /> Add Subtask
        </ContextMenuItem>
        <ContextMenuItem className="text-red-600" onClick={() => onDeleteTask(task.id)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete Task
        </ContextMenuItem>
      </ContextMenuContent>

      {isExpanded && hasSubtasks && task.subTasks?.map((subTask, i) => (
        <GridRow
          key={subTask.id}
          task={subTask}
          level={level + 1}
          wbs={`${wbs}.${i + 1}`}
          selectedTask={selectedTask}
          onSelectTask={onSelectTask}
          onAddTask={onAddTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ContextMenu>
  );
};

export const GanttGrid: React.FC<GanttGridProps> = ({
  tasks,
  selectedTask,
  onSelectTask,
  onAddTask,
  onDeleteTask,
  gridRef,
  widthPx,
}) => {
  const SPACER_BEFORE_HEADER_PX = 40 + 32;

  return (
    <div
      ref={gridRef}
      className="flex-shrink-0 border-r bg-card overflow-x-hidden"
      style={{ width: widthPx ? `${widthPx}px` : undefined }}
    >
      <div style={{ height: SPACER_BEFORE_HEADER_PX }} />

      <div className="flex bg-muted font-semibold text-xs h-8 select-none">
        <div className="w-12 flex-shrink-0 border-b border-r px-2 h-full flex items-center justify-center">WBS</div>
        <div className="w-20 flex-shrink-0 border-b border-r px-2 h-full flex items-center">Project Case</div>
        <div className="w-32 flex-shrink-0 border-b border-r px-2 h-full flex items-center">Task Name</div>
        <div className="w-28 flex-shrink-0 border-b border-r px-2 h-full flex items-center">Description</div>
        <div className="w-24 flex-shrink-0 border-b border-r px-2 h-full flex items-center">Assigned To</div>
        <div className="w-20 flex-shrink-0 border-b border-r px-2 h-full flex items-center">Priority</div>
        <div className="w-24 flex-shrink-0 border-b border-r px-2 h-full flex items-center">Status</div>
        <div className="w-20 flex-shrink-0 border-b border-r px-2 h-full flex items-center justify-center">Start</div>
        <div className="w-20 flex-shrink-0 border-b border-r px-2 h-full flex items-center justify-center">End</div>
        <div className="w-16 flex-shrink-0 border-b border-r px-2 h-full flex items-center justify-center">Est. Hours</div>
        <div className="w-16 flex-shrink-0 border-b border-r px-2 h-full flex items-center justify-center">Used Hours</div>
        <div className="w-16 flex-shrink-0 border-b px-2 h-full flex items-center justify-center">Remaining Hours</div>
      </div>

      <div>
        {tasks.map((task, idx) => (
          <GridRow
            key={task.id}
            task={task}
            level={0}
            wbs={`${idx + 1}`} // hoặc task.wbs ?? String(idx+1)
            selectedTask={selectedTask}
            onSelectTask={onSelectTask}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};
