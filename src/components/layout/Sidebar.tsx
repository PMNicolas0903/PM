import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  GanttChartSquare,
  AreaChart,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/plan', icon: GanttChartSquare, label: 'Project Plan' },
  { to: '/reports', icon: AreaChart, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];
export function Sidebar() {
  const { isDark, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <div
          className={cn(
            'flex items-center gap-2 font-display text-xl font-bold transition-opacity',
            isCollapsed ? 'opacity-0' : 'opacity-100'
          )}
        >
          <GanttChartSquare className="h-6 w-6 text-primary" />
          <span>SAR PM</span>
        </div>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary/10 text-primary',
                isCollapsed && 'justify-center'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className={cn(isCollapsed ? 'sr-only' : 'block')}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t p-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-start gap-3 px-4"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          <span className={cn(isCollapsed ? 'sr-only' : 'block')}>Collapse</span>
        </Button>
      </div>
    </aside>
  );
}