'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  FolderKanban,
  Layers,
  Award,
  Briefcase,
  FileText,
  ExternalLink,
  LogOut,
  Shield,
  Loader2,
  Plus,
  Folder,
  FolderOpen
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CustomTabConfig } from '@/types';
import { getCmsCustomTabs } from '@/lib/services/cmsService';
import { renderTabIcon } from '@/components/admin/TabIconHelper';
import { CreateTabModal } from '@/components/admin/CreateTabModal';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [customTabs, setCustomTabs] = useState<CustomTabConfig[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 8 Required Core Sections
  const coreOverviewItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const corePortfolioItems: NavItem[] = [
    { href: '/admin/profile', label: 'Profile & About Me', icon: UserCheck },
    { href: '/admin/education', label: 'Education', icon: GraduationCap },
    { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { href: '/admin/skills', label: 'Skills & Tools', icon: Layers },
    { href: '/admin/certifications', label: 'Certifications & Achievements', icon: Award },
    { href: '/admin/experience', label: 'Experience & Internships', icon: Briefcase },
    { href: '/admin/resume', label: 'Resume Manager', icon: FileText },
    { href: '/admin/media', label: 'Media & Uploads', icon: FolderOpen },
  ];

  const loadCustomTabs = async () => {
    try {
      const tabs = await getCmsCustomTabs();
      setCustomTabs(tabs);
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    loadCustomTabs();
    const handleUpdate = () => loadCustomTabs();
    window.addEventListener('cms_storage_updated', handleUpdate);
    return () => window.removeEventListener('cms_storage_updated', handleUpdate);
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleTabCreated = (newTab: CustomTabConfig) => {
    setCustomTabs((prev) => {
      const exists = prev.some((t) => t.slug === newTab.slug);
      return exists ? prev.map((t) => (t.slug === newTab.slug ? newTab : t)) : [...prev, newTab];
    });
    if (onNavigate) onNavigate();
    router.push(`/admin/custom/${newTab.slug}`);
  };

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Clear server session cookie
      await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => null);

      // 2. Sign out of Supabase client if active
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut().catch(() => null);
      }

      if (onNavigate) onNavigate();
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 h-screen sticky top-0 shadow-xs select-none">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100/90 bg-white">
          <Link
            href="/admin/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-brand-700 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                Admin Portal
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Maddala Varshini Portfolio
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav
          className="flex-grow p-3 space-y-5 overflow-y-auto scrollbar-thin"
          aria-label="Admin Portal Navigation"
        >
          {/* Overview Group */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Overview
            </div>
            {coreOverviewItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs border border-brand-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Portfolio Management Group */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Portfolio Management</span>
            </div>

            {/* Core 7 Portfolio Management Links */}
            {corePortfolioItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs border border-brand-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}

            {/* Dynamic Custom Management Tabs */}
            {customTabs.length > 0 && (
              <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-brand-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Custom Tabs</span>
                  <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded-full font-semibold">
                    {customTabs.length}
                  </span>
                </div>
                {customTabs.map((tab) => {
                  const href = `/admin/custom/${tab.slug}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={tab.id || tab.slug}
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        active
                          ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs border border-brand-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span
                        className={`shrink-0 transition-colors ${
                          active ? 'text-brand-600' : 'text-slate-400'
                        }`}
                      >
                        {renderTabIcon(tab.icon, 'w-4 h-4')}
                      </span>
                      <span className="truncate">{tab.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* + Add New Management Tab Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50/70 hover:bg-brand-50 border border-dashed border-brand-300/80 hover:border-brand-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate font-semibold">+ Add New Management Tab</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Administration Footer: View Public Website & Sign Out */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 space-y-1">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-brand-600 hover:bg-white transition-all border border-transparent hover:border-slate-200 shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>View Public Website</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">/</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <span className="flex items-center gap-2">
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
            </span>
            <span className="text-[10px] text-rose-400 uppercase font-semibold">Exit</span>
          </button>
        </div>
      </aside>

      {/* Modal for creating a new management tab */}
      <CreateTabModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTabCreated={handleTabCreated}
      />
    </>
  );
};
