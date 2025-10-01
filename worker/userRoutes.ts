import { Hono } from "hono";
import { Env } from './core-utils';
import { mockDashboardStats, mockRecentProjects, mockUpcomingDeadlines, mockProjects, mockTasks, mockPlanTasks } from "../src/lib/mockData";
import { PlanTask, Project, Task, ReportSummary, TimeAnalysisData, OverdueTask } from "../src/types";
import { differenceInDays, isBefore, parseISO } from "date-fns";
// Helper to find and manipulate tasks recursively
const findTask = (tasks: PlanTask[], taskId: string): PlanTask | null => {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    if (task.subTasks) {
      const found = findTask(task.subTasks, taskId);
      if (found) return found;
    }
  }
  return null;
};
const deleteTaskRecursive = (tasks: PlanTask[], taskId: string): PlanTask[] => {
  return tasks.filter(task => {
    if (task.id === taskId) {
      return false;
    }
    if (task.subTasks) {
      task.subTasks = deleteTaskRecursive(task.subTasks, taskId);
    }
    return true;
  });
};
export function userRoutes(app: Hono<{Bindings: Env;}>) {
  // Dashboard Routes
  app.get('/api/dashboard/stats', (c) => c.json(mockDashboardStats));
  app.get('/api/dashboard/recent-projects', (c) => c.json(mockRecentProjects));
  app.get('/api/dashboard/upcoming-deadlines', (c) => c.json(mockUpcomingDeadlines));
  // Project Routes
  app.get('/api/projects', (c) => c.json(mockProjects));
  app.post('/api/projects', async (c) => {
    const newProjectData = await c.req.json<Omit<Project, 'id' | 'progress'>>();
    const newProject: Project = { ...newProjectData, id: `proj-${Date.now()}`, progress: 0 };
    mockProjects.push(newProject);
    return c.json(newProject, 201);
  });
  // Task Routes
  app.get('/api/tasks', (c) => {
    const tasksWithProjectNames = mockTasks.map(task => {
      const project = mockProjects.find(p => p.id === task.projectId);
      return { ...task, projectName: project ? project.name : 'Unknown Project' };
    });
    return c.json(tasksWithProjectNames);
  });
  app.post('/api/tasks', async (c) => {
    const newTaskData = await c.req.json<Omit<Task, 'id'>>();
    const newTask: Task = { ...newTaskData, id: `task-${Date.now()}` };
    mockTasks.push(newTask);
    return c.json(newTask, 201);
  });
  app.put('/api/tasks/:id/status', async (c) => {
    const { id } = c.req.param();
    const { status } = await c.req.json();
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      mockTasks[taskIndex].status = status;
      return c.json(mockTasks[taskIndex]);
    }
    return c.json({ error: 'Task not found' }, 404);
  });
  app.put('/api/projects/:id/status', async (c) => {
    const { id } = c.req.param();
    const { status } = await c.req.json();
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex !== -1) {
      mockProjects[projectIndex].status = status;
      return c.json(mockProjects[projectIndex]);
    }
    return c.json({ error: 'Project not found' }, 404);
  });
  // Project Plan (Gantt) Routes
  app.get('/api/plan/:projectId', (c) => c.json(mockPlanTasks));
  app.put('/api/plan/tasks/:taskId', async (c) => {
    const { taskId } = c.req.param();
    const updatedTaskData = await c.req.json<Partial<PlanTask>>();
    const task = findTask(mockPlanTasks, taskId);
    if (task) {
      Object.assign(task, updatedTaskData);
      return c.json(task);
    }
    return c.json({ error: 'Task not found' }, 404);
  });
  app.post('/api/plan/tasks', async (c) => {
    const newTaskData = await c.req.json<{ parentId?: string; task: Omit<PlanTask, 'id'> }>();
    const newTask: PlanTask = { ...newTaskData.task, id: `gantt-${Date.now()}`, timesheetState: 'draft' };
    if (newTaskData.parentId) {
      const parent = findTask(mockPlanTasks, newTaskData.parentId);
      if (parent) {
        if (!parent.subTasks) parent.subTasks = [];
        parent.subTasks.push(newTask);
      } else {
         mockPlanTasks.push(newTask);
      }
    } else {
      mockPlanTasks.push(newTask);
    }
    return c.json({ message: 'Task created successfully', task: newTask }, 201);
  });
  app.delete('/api/plan/tasks/:taskId', (c) => {
    const { taskId } = c.req.param();
    const initialLength = JSON.stringify(mockPlanTasks).length;
    const updatedTasks = deleteTaskRecursive(mockPlanTasks, taskId);
    // This is a hack for in-memory update since we can't reassign mockPlanTasks
    mockPlanTasks.length = 0;
    Array.prototype.push.apply(mockPlanTasks, updatedTasks);
    if (JSON.stringify(mockPlanTasks).length < initialLength) {
      return c.json({ message: `Task ${taskId} deleted successfully` });
    }
    return c.json({ error: 'Task not found' }, 404);
  });
  // Timesheet Routes
  app.post('/api/timesheet/submit', async (c) => {
    const { taskId } = await c.req.json<{ taskId: string }>();
    const task = findTask(mockPlanTasks, taskId);
    if (task) {
      task.timesheetState = 'submitted';
      return c.json({ message: 'Timesheet submitted', task });
    }
    return c.json({ error: 'Task not found' }, 404);
  });
  app.post('/api/timesheet/resubmit', async (c) => {
    const { taskId } = await c.req.json<{ taskId: string }>();
    const task = findTask(mockPlanTasks, taskId);
    if (task) {
      task.timesheetState = 'resubmitted';
      return c.json({ message: 'Timesheet resubmitted', task });
    }
    return c.json({ error: 'Task not found' }, 404);
  });
  // Reports Route
  app.get('/api/reports/summary', (c) => {
    const timeAnalysis: TimeAnalysisData[] = mockProjects.map(p => {
      const projectTasks = mockPlanTasks.filter(t => t.projectCase === p.case);
      const totalEst = projectTasks.reduce((sum, task) => sum + task.estHours, 0);
      const totalUsed = projectTasks.reduce((sum, task) => sum + task.usedHours, 0);
      return { name: p.name, est: totalEst, used: totalUsed };
    }).filter(d => d.est > 0 || d.used > 0);
    const overdueTasks: OverdueTask[] = mockTasks
      .filter(t => t.status !== 'Done' && isBefore(parseISO(t.dueDate), new Date()))
      .map(t => {
        const project = mockProjects.find(p => p.id === t.projectId);
        return {
          id: t.id,
          name: t.name,
          project: project ? project.name : 'Unknown',
          days: differenceInDays(new Date(), parseISO(t.dueDate)),
        };
      })
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);
    const summary: ReportSummary = { timeAnalysis, overdueTasks };
    return c.json(summary);
  });
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' } }));
}