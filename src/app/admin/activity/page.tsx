'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  Activity,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Clock,
  User,
  Globe,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { AdminSearchFilter } from '@/components/admin/AdminSearchFilter';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { ActivityLog } from '@/types';

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // System security info
  const [securityStatus, setSecurityStatus] = useState<{
    databaseConnected: boolean;
    databaseName: string;
    authConfigured: boolean;
  }>({
    databaseConnected: false,
    databaseName: 'maddala_portfolio',
    authConfigured: true,
  });

  const loadActivities = async () => {
    setIsRefreshing(true);
    try {
      const [actRes, healthRes] = await Promise.all([
        fetch('/api/admin/activity?limit=100').then((r) => r.json()),
        fetch('/api/cms/health').then((r) => r.json()).catch(() => null)
      ]);

      if (actRes && Array.isArray(actRes.data)) {
        setActivities(actRes.data);
      }
      if (healthRes) {
        setSecurityStatus({
          databaseConnected: healthRes.status === 'connected',
          databaseName: healthRes.database || 'maddala_portfolio',
          authConfigured: true,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch activity logs:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/activity', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActivities([]);
        setIsConfirmClearOpen(false);
        setSuccessMessage('Activity audit trail cleared.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      alert('Failed to clear activity trail.');
    } finally {
      setIsClearing(false);
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      searchTerm === '' ||
      act.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.actor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || act.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categoryOptions = [
    { value: 'auth', label: 'Authentication' },
    { value: 'project', label: 'Projects' },
    { value: 'profile', label: 'Profile' },
    { value: 'media', label: 'Media' },
    { value: 'settings', label: 'Settings' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Security and Activity"
        subtitle="Audit logs, authentication events, and server-side security posture."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
              onClick={loadActivities}
              disabled={isRefreshing}
            >
              Refresh
            </Button>
            {activities.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                onClick={() => setIsConfirmClearOpen(true)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                Clear Log
              </Button>
            )}
          </div>
        }
      />

      <main className="p-6 sm:p-8 space-y-8 flex-grow max-w-7xl">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Security Posture Cards */}
        <section aria-labelledby="security-posture-heading" className="space-y-3">
          <h3 id="security-posture-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Security Controls & Posture
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="md" className="bg-white border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Database Engine</span>
                <Badge variant={securityStatus.databaseConnected ? 'green' : 'amber'} size="sm">
                  {securityStatus.databaseConnected ? 'Connected' : 'Sync Fallback'}
                </Badge>
              </div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-600" />
                <span>MongoDB Atlas</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                DB: {securityStatus.databaseName}
              </p>
            </Card>

            <Card padding="md" className="bg-white border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Owner Allowlist</span>
                <Badge variant="blue" size="sm">Enforced</Badge>
              </div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>ADMIN_EMAIL</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Server-side authorization guard
              </p>
            </Card>

            <Card padding="md" className="bg-white border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Session Protection</span>
                <Badge variant="green" size="sm">HTTP-Only</Badge>
              </div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>SameSite=Lax</span>
              </div>
              <p className="text-[11px] text-slate-400">
                XSS & CSRF hardened cookies
              </p>
            </Card>

            <Card padding="md" className="bg-white border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Public Isolation</span>
                <Badge variant="green" size="sm">Protected</Badge>
              </div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                <span>Draft Filtering</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Unpublished items excluded from public
              </p>
            </Card>
          </div>
        </section>

        {/* Audit Trail Section */}
        <section aria-labelledby="audit-trail-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 id="audit-trail-heading" className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Audit Trail & Activity Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed record of administrative actions, authentication attempts, and data updates.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <AdminSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by action, description, or actor..."
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categoryOptions={categoryOptions}
            totalCount={activities.length}
            filteredCount={filteredActivities.length}
          />

          {/* Activity Table or Empty State */}
          {filteredActivities.length > 0 ? (
            <Card className="bg-white border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold">Event & Action</th>
                      <th className="py-3 px-4 font-bold">Description</th>
                      <th className="py-3 px-4 font-bold">Actor</th>
                      <th className="py-3 px-4 font-bold">IP / Client</th>
                      <th className="py-3 px-4 font-bold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] border ${
                              act.status === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : act.status === 'warning'
                                ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                                : 'bg-rose-50 text-rose-700 border-rose-200/80'
                            }`}
                          >
                            {act.status === 'success' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : act.status === 'warning' ? (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                            )}
                            <span className="capitalize">{act.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{act.action}</div>
                          <span className="text-[10px] text-slate-400 capitalize">{act.category}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-slate-600 truncate">
                          {act.description}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                          {act.actor}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                          {act.ip_address || '127.0.0.1'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right text-slate-400 font-mono text-[11px]">
                          {act.timestamp
                            ? new Date(act.timestamp).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <AdminEmptyState
              icon={Clock}
              title={searchTerm || categoryFilter !== 'all' ? 'No Matching Activity' : 'No Activity Events Recorded Yet'}
              description={
                searchTerm || categoryFilter !== 'all'
                  ? 'No audit entries match the current search or category filter. Try clearing the filters.'
                  : 'System security events, logins, and portfolio modifications will appear here automatically.'
              }
            />
          )}
        </section>
      </main>

      {/* Confirmation Dialog for Clearing Logs */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        title="Clear Security Audit Trail?"
        message="Are you sure you want to clear all activity and audit log records? This action cannot be undone."
        confirmLabel="Clear Trail"
        cancelLabel="Keep Records"
        variant="danger"
        isBusy={isClearing}
        onConfirm={handleClearLogs}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
}
