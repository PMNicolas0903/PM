import { DashboardStats, RecentProject, UpcomingDeadline, Project, Task, ProjectStatus, TaskStatus, TaskPriority, PlanTask } from '../types';
import { subDays, addDays, formatISO } from 'date-fns';
export const mockDashboardStats: DashboardStats = {
  totalProjects: { value: 12, change: 2 },
  pendingTasks: { value: 68, change: -5 },
  completedTasks: { value: 230, change: 12 },
  overdueTasks: { value: 4, change: 1 },
};
export const mockRecentProjects: RecentProject[] = [
  { id: '1', name: 'Solar Panel Installation', case: 'SP-2024', status: 'In Progress', dueDate: formatISO(addDays(new Date(), 30)), progress: 45 },
  { id: '2', name: 'E-commerce Platform', case: 'EP-2024', status: 'In Progress', dueDate: formatISO(addDays(new Date(), 60)), progress: 75 },
  { id: '3', name: 'Mobile App Redesign', case: 'MAR-2023', status: 'Done', dueDate: formatISO(subDays(new Date(), 10)), progress: 100 },
  { id: '4', name: 'Data Center Migration', case: 'DCM-2024', status: 'Backlog', dueDate: formatISO(addDays(new Date(), 90)), progress: 10 },
  { id: '5', name: 'Marketing Campaign', case: 'MC-2024', status: 'In Progress', dueDate: formatISO(addDays(new Date(), 15)), progress: 60 },
];
export const mockUpcomingDeadlines: UpcomingDeadline[] = [
  { id: '1', taskName: 'Finalize Solar Panel Design', projectName: 'Solar Panel Installation', dueDate: formatISO(addDays(new Date(), 5)), daysLeft: 5 },
  { id: '2', taskName: 'Develop Checkout Flow', projectName: 'E-commerce Platform', dueDate: formatISO(addDays(new Date(), 8)), daysLeft: 8 },
  { id: '3', taskName: 'Launch Social Media Ads', projectName: 'Marketing Campaign', dueDate: formatISO(addDays(new Date(), 10)), daysLeft: 10 },
  { id: '4', taskName: 'Order Inverter Components', projectName: 'Solar Panel Installation', dueDate: formatISO(addDays(new Date(), 12)), daysLeft: 12 },
];
export const mockProjectStatusData = [
  { name: 'In Progress', value: 8, fill: '#F4A100' },
  { name: 'Done', value: 3, fill: '#14A369' },
  { name: 'Backlog', value: 1, fill: '#5B7FFF' },
];
export const mockTaskProgressData = [
    { name: 'In Progress', value: 40, fill: '#F4A100' },
    { name: 'Backlog', value: 60, fill: '#5B7FFF' },
];
export const mockProjects: Project[] = [
  { id: '1', name: 'Solar Panel Installation', case: 'SP-2024', status: 'In Progress', startDate: formatISO(new Date()), dueDate: formatISO(addDays(new Date(), 30)), progress: 45, owner: 'Alice' },
  { id: '2', name: 'E-commerce Platform', case: 'EP-2024', status: 'In Progress', startDate: formatISO(subDays(new Date(), 15)), dueDate: formatISO(addDays(new Date(), 60)), progress: 75, owner: 'Bob' },
  { id: '3', name: 'Mobile App Redesign', case: 'MAR-2023', status: 'Done', startDate: formatISO(subDays(new Date(), 90)), dueDate: formatISO(subDays(new Date(), 10)), progress: 100, owner: 'Charlie' },
  { id: '4', name: 'Data Center Migration', case: 'DCM-2024', status: 'Backlog', startDate: formatISO(addDays(new Date(), 10)), dueDate: formatISO(addDays(new Date(), 90)), progress: 10, owner: 'David' },
  { id: '5', name: 'Marketing Campaign', case: 'MC-2024', status: 'In Progress', startDate: formatISO(subDays(new Date(), 5)), dueDate: formatISO(addDays(new Date(), 15)), progress: 60, owner: 'Eve' },
  { id: '6', name: 'New Office Setup', case: 'NOS-2024', status: 'Done', startDate: formatISO(subDays(new Date(), 120)), dueDate: formatISO(subDays(new Date(), 60)), progress: 100, owner: 'Frank' },
];
export const mockTasks: Task[] = [
  { id: 'task-1', name: 'Finalize Solar Panel Design', projectId: '1', status: 'In Progress', priority: 'High', assignedTo: 'Alice', dueDate: formatISO(addDays(new Date(), 5)) },
  { id: 'task-2', name: 'Order Inverter Components', projectId: '1', status: 'Backlog', priority: 'Medium', assignedTo: 'Bob, Charlie', dueDate: formatISO(addDays(new Date(), 12)) },
  { id: 'task-3', name: 'Develop Checkout Flow', projectId: '2', status: 'In Progress', priority: 'High', assignedTo: 'Grace', dueDate: formatISO(addDays(new Date(), 8)) },
  { id: 'task-4', name: 'Design Product Pages', projectId: '2', status: 'Done', priority: 'Medium', assignedTo: 'Heidi', dueDate: formatISO(subDays(new Date(), 2)) },
  { id: 'task-5', name: 'User Persona Research', projectId: '3', status: 'Done', priority: 'Low', assignedTo: 'Ivan', dueDate: formatISO(subDays(new Date(), 40)) },
  { id: 'task-6', name: 'Plan Server Rack Layout', projectId: '4', status: 'Backlog', priority: 'High', assignedTo: 'Judy', dueDate: formatISO(addDays(new Date(), 20)) },
  { id: 'task-7', name: 'Launch Social Media Ads', projectId: '5', status: 'In Progress', priority: 'Medium', assignedTo: 'Mallory', dueDate: formatISO(addDays(new Date(), 10)) },
];
export const mockPlanTasks: PlanTask[] = [
  {
    id: 'gantt-1',
    wbs: '1',
    projectCase: 'SP-2024',
    name: 'Project Kick-off',
    description: 'Initial planning and setup phase.',
    assignees: ['Alice'],
    priority: 'High',
    status: 'Done',
    startDate: formatISO(subDays(new Date(), 10)),
    endDate: formatISO(subDays(new Date(), 8)),
    estHours: 24,
    usedHours: 24,
    timesheetState: 'submitted',
  },
  {
    id: 'gantt-2',
    wbs: '2',
    projectCase: 'SP-2024',
    name: 'Design Phase',
    description: 'Finalize all design mockups and specifications.',
    assignees: ['Bob', 'Charlie'],
    priority: 'High',
    status: 'In Progress',
    startDate: formatISO(subDays(new Date(), 7)),
    endDate: formatISO(addDays(new Date(), 5)),
    estHours: 80,
    usedHours: 30,
    timesheetState: 'draft',
    subTasks: [
      {
        id: 'gantt-2.1',
        wbs: '2.1',
        projectCase: 'SP-2024',
        name: 'Finalize Solar Panel Design',
        description: 'Detailed electrical and structural design.',
        assignees: ['Alice'],
        priority: 'High',
        status: 'In Progress',
        startDate: formatISO(subDays(new Date(), 7)),
        endDate: formatISO(addDays(new Date(), 1)),
        estHours: 40,
        usedHours: 10,
        timesheetState: 'draft',
      },
      {
        id: 'gantt-2.2',
        wbs: '2.2',
        projectCase: 'SP-2024',
        name: 'Order Inverter Components',
        description: 'Procurement of all necessary inverter parts.',
        assignees: ['Bob', 'Charlie'],
        priority: 'Medium',
        status: 'Backlog',
        startDate: formatISO(addDays(new Date(), 2)),
        endDate: formatISO(addDays(new Date(), 5)),
        estHours: 16,
        usedHours: 0,
        timesheetState: 'draft',
      }
    ]
  },
  {
    id: 'gantt-3',
    wbs: '3',
    projectCase: 'SP-2024',
    name: 'Installation',
    description: 'Physical installation of panels and components.',
    assignees: ['David', 'Eve'],
    priority: 'Medium',
    status: 'Backlog',
    startDate: formatISO(addDays(new Date(), 6)),
    endDate: formatISO(addDays(new Date(), 20)),
    estHours: 120,
    usedHours: 0,
    timesheetState: 'draft',
  }
];