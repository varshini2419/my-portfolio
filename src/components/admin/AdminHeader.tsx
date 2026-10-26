'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Database, User, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

let cachedUserEmail: string | null = null;
let cachedDbTelemetry: { status: string; database?: string } | null = null;
let lastHeaderCheck = 0;

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(cachedUserEmail);
  const [dbStatus, setDbStatus] = useState<{ status: string; database?: string } | null>(cachedDbTelemetry);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Only fetch if 60 seconds have elapsed or not yet loaded
    if (cachedUserEmail && cachedDbTelemetry && Date.now() - lastHeaderCheck < 60000) {
      return;
    }

    async function loadIdentity() {
      // 1. Check local session API
      try {
        const meRes = await fetch('/api/admin/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.email) {
            cachedUserEmail = meData.email;
            setCurrentUserEmail(meData.email);
          }
        }
      } catch {
        // Ignore network errors
      }

      // 2. Check Supabase user if configured
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          cachedUserEmail = user.email;
          setCurrentUserEmail(user.email);
        }
      }

      // 3. Check MongoDB Atlas telemetry
      try {
        const healthRes = await fetch('/api/cms/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          cachedDbTelemetry = healthData;
          setDbStatus(healthData);
        }
      } catch {
        // Fallback state
      }

      lastHeaderCheck = Date.now();
    }

    loadIdentity();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => null);
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut().catch(() => null);
      }
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isMongoLive = dbStatus?.status === 'connected';

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-subtle">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
          <Link href="/admin/dashboard" className="hover:text-brand-600 transition-colors">
            Admin Portal
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{title}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {/* Custom page action if provided */}
        {action && <div className="shrink-0">{action}</div>}

        {/* Database status pill */}
        <Link
          href="/admin/settings"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            isMongoLive
              ? 'bg-brand-50 text-brand-700 border-brand-400/80 hover:bg-brand-100'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-brand-50'
          }`}
          title={isMongoLive ? 'MongoDB Atlas Primary DB Connected' : 'Local Persistence Sync Active'}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isMongoLive ? 'Atlas Live' : 'Atlas Sync'}</span>
        </Link>

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
        >
          <span>View Website</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        {/* Authenticated Owner Profile Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-slate-800 leading-tight">
              Maddala Varshini
            </span>
            <span className="block text-[10px] text-slate-400 leading-tight truncate max-w-[130px]">
              {currentUserEmail || 'Portfolio Owner'}
            </span>
          </div>
        </div>

        {/* Functional Sign Out */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          icon={isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
          className="text-xs text-rose-600 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50"
        >
          {isLoggingOut ? 'Exiting...' : 'Sign Out'}
        </Button>
      </div>
    </header>
  );
};
