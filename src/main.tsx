import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider } from
"react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { HomePage } from '@/pages/HomePage';
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { TasksPage } from "@/pages/TasksPage";
import { PlanPage } from "@/pages/PlanPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Toaster } from "@/components/ui/sonner";
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/tasks", element: <TasksPage /> },
      { path: "/plan", element: <PlanPage /> },
      { path: "/reports", element: <ReportsPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);