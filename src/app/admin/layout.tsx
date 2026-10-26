'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/unauthorized';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col justify-center items-center p-4">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-white border-b border-slate-200/90 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-900">Admin Console</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={mobileSidebarOpen}
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-white h-full z-10 shadow-2xl flex flex-col">
            <AdminSidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Admin Content Area */}
      <div className="flex-grow flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
