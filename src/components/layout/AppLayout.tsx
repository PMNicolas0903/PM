import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
export function AppLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full px-4 sm:px-6 md:px-8 py-4 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}