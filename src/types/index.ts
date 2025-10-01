export type ProjectStatus = "Backlog" | "In Progress" | "Done";
export type TaskStatus = "Backlog" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";
export interface DashboardStats {
  totalProjects: { value: number; change: number };
  pendingTasks: { value: number; change: number };
  completedTasks: { value: number; change: number };
  overdueTasks: { value: number; change: number };
}
export interface RecentProject {
  id: string;
  name: string;
  case: string;
  status: ProjectStatus;
  dueDate: string;
  progress: number;
}
export interface UpcomingDeadline {
  id: string;
  taskName: string;
  projectName: string;
  dueDate: string;
  daysLeft: number;
}
export interface Project {
  id: string;
  case: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  progress: number;
  owner: string;
}
export interface Task {
  id: string;
  name:string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
}
export type TimesheetState = 'draft' | 'submitted' | 'resubmitted';
export interface PlanTask {
  id: string;
  wbs: string;
  projectCase: string;
  name: string;
  description: string;
  assignees: string[];
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  estHours: number;
  usedHours: number;
  timesheetState?: TimesheetState;
  subTasks?: PlanTask[];
}
export interface Timesheet {
  id: string;
  taskId: string;
  weekStart: string;
  hours: number;
  state: TimesheetState;
}
export interface TimeAnalysisData {
  name: string;
  est: number;
  used: number;
}
export interface OverdueTask {
  id: string;
  name: string;
  project: string;
  days: number;
}
export interface ReportSummary {
  timeAnalysis: TimeAnalysisData[];
  overdueTasks: OverdueTask[];
}