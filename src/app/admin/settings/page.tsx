'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Save,
  Check,
  Server,
  Activity,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SiteSettings } from '@/types';
import { initialSiteSettings } from '@/lib/data/portfolioData';
import { getCmsSiteSettings, saveCmsSiteSettings } from '@/lib/services/cmsService';

interface HealthReport {
  success: boolean;
  status: 'connected' | 'pending_configuration' | 'connection_failed' | 'error';
  engine?: string;
  database?: string | null;
  latencyMs?: number;
  message?: string;
  collections?: Record<string, number>;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // MongoDB Atlas Health State
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/cms/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({
        success: false,
        status: 'connection_failed',
        message: 'Could not connect to health endpoint.',
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getCmsSiteSettings();
        setSettings(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    checkHealth();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await saveCmsSiteSettings(settings);
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage('Site preferences and security settings saved successfully!');
      if (res.data) setSettings(res.data);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleTriggerSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/cms/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Initial authentic portfolio records seeded to MongoDB Atlas!');
        checkHealth();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        alert(data.error || 'Seeding failed. Ensure MONGODB_URI is configured.');
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const isConnected = health?.status === 'connected';

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Settings & Database Architecture"
        subtitle="Manage MongoDB Atlas database connection, environment credentials, and site configurations."
      />

      <main className="p-6 sm:p-8 max-w-4xl space-y-8 flex-grow">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Primary Database: MongoDB Atlas Status Card */}
        <Card className="p-6 sm:p-8 space-y-6 bg-white border-brand-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Primary Database: MongoDB Atlas
                  </h3>
                  <Badge variant={isConnected ? 'green' : health?.status === 'pending_configuration' ? 'amber' : 'rose'} size="sm">
                    {isConnected ? 'Atlas Connected' : health?.status === 'pending_configuration' ? 'Setup Pending' : 'Connection Error'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official MongoDB Node.js driver with serverless connection pooling & index enforcement.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />}
                onClick={checkHealth}
                disabled={isCheckingHealth}
              >
                Ping Atlas
              </Button>
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTriggerSeed}
                  disabled={isSeeding}
                >
                  {isSeeding ? 'Seeding...' : 'Seed Data'}
                </Button>
              )}
            </div>
          </div>

          {/* Telemetry info */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Database Name</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">{health?.database || 'maddala_portfolio'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ping Latency</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">{health?.latencyMs !== undefined ? `${health.latencyMs}ms` : '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Collections Tracked</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">{health?.collections ? Object.keys(health.collections).length : '11'}</span>
              </div>
            </div>

            {/* Collection counts badges if connected */}
            {isConnected && health?.collections && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Collection Document Counts</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(health.collections).map(([col, count]) => (
                    <span key={col} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]">
                      <strong>{col}:</strong> {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {health?.message && !isConnected && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                {health.message}
              </div>
            )}
          </div>

          {/* Environment Variables Reference */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 block">
              Required Environment Variables (Server Only)
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                <span className="font-bold text-slate-800">MONGODB_URI</span>
                <span className="text-slate-500 text-[11px]">mongodb+srv://... (Server Only)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                <span className="font-bold text-slate-800">MONGODB_DB</span>
                <span className="text-slate-500 text-[11px]">maddala_portfolio</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                <span className="font-bold text-slate-800">ADMIN_EMAIL</span>
                <span className="text-slate-500 text-[11px]">Allowlist owner verification</span>
              </div>
            </div>
          </div>
        </Card>

        {/* General Site Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 sm:p-8 space-y-5 bg-white">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Globe className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">
                General Website Preferences & Section Toggles
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Site Browser Title
              </label>
              <input
                type="text"
                required
                value={settings.site_title || ''}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                placeholder="Maddala Varshini | Aspiring Data Analyst Portfolio"
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Meta SEO Description
              </label>
              <textarea
                rows={3}
                value={settings.meta_description || ''}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                placeholder="Personal portfolio of Maddala Varshini, 3rd year B.Tech student specializing in Data Analytics..."
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>

            {/* Section Visibility Switches */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Public Portfolio Section Visibility
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">Personal Vlogs & Lifestyle</span>
                  <input
                    type="checkbox"
                    checked={settings.public_vlogs_enabled !== false}
                    onChange={(e) => setSettings({ ...settings, public_vlogs_enabled: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">Certifications Section</span>
                  <input
                    type="checkbox"
                    checked={settings.certifications_section_enabled !== false}
                    onChange={(e) => setSettings({ ...settings, certifications_section_enabled: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">Experience & Internships</span>
                  <input
                    type="checkbox"
                    checked={settings.experience_section_enabled !== false}
                    onChange={(e) => setSettings({ ...settings, experience_section_enabled: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">Maintenance Mode (Private)</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.maintenance_mode)}
                    onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                {isSaving ? 'Saving...' : 'Save Site Settings'}
              </Button>
            </div>
          </Card>
        </form>

        {/* Security & Access Overview */}
        <Card className="p-6 sm:p-8 space-y-4 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Security & Data Access Controls
              </h3>
            </div>
            <Badge variant="green" size="sm">
              Server Guarded
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Server-Only Database Credentials:</strong> <code>MONGODB_URI</code> is never bundled or exposed in client JavaScript.</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Protected Mutation Endpoints:</strong> All write requests to <code>/api/cms/*</code> verify administrator authorization on the server.</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Media Decoupling:</strong> MongoDB Atlas stores image and document metadata/references, while binary files stay in cloud storage.</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
