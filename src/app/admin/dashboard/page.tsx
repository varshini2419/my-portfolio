'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Video,
  Layers,
  Award,
  FileText,
  User,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Blocks,
  Settings,
  Briefcase,
  UploadCloud,
  ArrowRight,
  Clock,
  Activity,
  Database
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import {
  Project,
  Profile,
  Certification,
  Experience,
  SkillCategory,
  ActivityLog,
  CustomTabConfig,
  emptyProfile
} from '@/types';
import {
  getCmsProfile,
  getCmsProjects,
  getCmsSkills,
  getCmsCertifications,
  getCmsExperience,
  getCmsCustomTabs
} from '@/lib/services/cmsService';

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [customTabs, setCustomTabs] = useState<CustomTabConfig[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ status: string; database?: string; latencyMs?: number } | null>(null);

  const loadData = async () => {
    try {
      const [pProfile, pProjects, pSkills, pCerts, pExp, pTabs, healthRes, actRes] = await Promise.all([
        getCmsProfile(),
        getCmsProjects(),
        getCmsSkills(),
        getCmsCertifications(),
        getCmsExperience(),
        getCmsCustomTabs(),
        fetch('/api/cms/health').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/activity?limit=6').then((r) => r.json()).catch(() => ({ data: [] }))
      ]);

      setProfile(pProfile);
      setProjects(pProjects);
      setSkills(pSkills);
      setCerts(pCerts);
      setExperience(pExp);
      setCustomTabs(pTabs);
      if (healthRes) setDbStatus(healthRes);
      if (actRes && Array.isArray(actRes.data)) setActivities(actRes.data);
    } catch (err) {
      console.warn('Dashboard data fetch note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('cms_storage_updated', handleUpdate);
    return () => window.removeEventListener('cms_storage_updated', handleUpdate);
  }, []);

  // Real Database Metrics
  const totalProjectsCount = projects.length;
  const publishedProjectsCount = projects.filter((p) => p.status === 'published').length;
  const draftProjectsCount = projects.filter((p) => p.status === 'draft').length;
  const certificationsCount = certs.length;
  const experienceCount = experience.length;

  const summaryCards = [
    {
      title: 'Total Projects',
      count: totalProjectsCount,
      detail: `${publishedProjectsCount} published, ${draftProjectsCount} staged`,
      icon: FolderKanban,
      href: '/admin/projects',
      badge: 'All Case Studies',
      badgeVariant: 'blue' as const,
      color: 'text-brand-600 bg-brand-50 border-brand-200/60',
    },
    {
      title: 'Published Projects',
      count: publishedProjectsCount,
      detail: `${publishedProjectsCount} visible to public visitors`,
      icon: FolderKanban,
      href: '/admin/projects?status=published',
      badge: 'Public Live',
      badgeVariant: 'green' as const,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
    },
    {
      title: 'Draft Projects',
      count: draftProjectsCount,
      detail: `${draftProjectsCount} private staging records`,
      icon: FolderKanban,
      href: '/admin/projects?status=draft',
      badge: 'Private Staged',
      badgeVariant: 'amber' as const,
      color: 'text-amber-600 bg-amber-50 border-amber-200/60',
    },
    {
      title: 'Certifications',
      count: certificationsCount,
      detail: `${certs.filter((c) => c.status === 'completed').length} completed, ${certs.filter((c) => c.status === 'in_progress').length} in-progress`,
      icon: Award,
      href: '/admin/certifications',
      badge: 'Credentials',
      badgeVariant: 'blue' as const,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/60',
    },
    {
      title: 'Experience Entries',
      count: experienceCount,
      detail: `${experience.length} career & academic milestones`,
      icon: Briefcase,
      href: '/admin/experience',
      badge: 'Career Roles',
      badgeVariant: 'slate' as const,
      color: 'text-purple-600 bg-purple-50 border-purple-200/60',
    },
  ];

  const quickActions = [
    {
      title: 'Add Project',
      description: 'Stage a new data analytics case study with business impact and SQL/Power BI details.',
      href: '/admin/projects',
      icon: Plus,
      color: 'bg-brand-50 text-brand-700 border-brand-200/80',
    },
    {
      title: 'Edit Profile',
      description: 'Update headline, career goals, bio, strengths, and official photograph.',
      href: '/admin/profile',
      icon: User,
      color: 'bg-brand-50 text-brand-700 border-brand-200/80',
    },
    {
      title: 'Skills & Tools',
      description: 'Add and organize competencies across Python, SQL, Power BI, and analytics tools.',
      href: '/admin/skills',
      icon: Layers,
      color: 'bg-brand-50 text-brand-700 border-brand-200/80',
    },
    {
      title: 'Manage Resume',
      description: 'Configure active resume PDF link, upload date, and recruiter summary notes.',
      href: '/admin/resume',
      icon: FileText,
      color: 'bg-brand-50 text-brand-700 border-brand-200/80',
    },
    {
      title: 'Media & File Uploads',
      description: 'Upload screenshots, chart diagrams, resume documents, and manage media assets.',
      href: '/admin/media',
      icon: UploadCloud,
      color: 'bg-brand-50 text-brand-700 border-brand-200/80',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle="Operational overview of portfolio records, publication statuses, and media assets."
        action={
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors shadow-2xs"
          >
            <span>Open Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <main className="p-6 sm:p-8 space-y-8 flex-grow max-w-7xl">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
                Portfolio Owner
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">B.Tech CS & IT, SRKR Engineering College</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, Maddala Varshini
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Manage your personal data analytics portfolio, publication workflows, credentials, and media from this centralized portal.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              href="/admin/projects"
              icon={<FolderKanban className="w-3.5 h-3.5" />}
            >
              All Projects ({totalProjectsCount})
            </Button>
            <Button
              size="sm"
              href="/admin/projects"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Project
            </Button>
          </div>
        </div>

        {/* Database Engine Status Banner */}
        {dbStatus?.status === 'connected' ? (
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-400/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>MongoDB Atlas Primary Database: Live & Synchronized</span>
                  <Badge variant="green" size="sm">Connected</Badge>
                </h4>
                <p className="text-[11px] text-brand-700 font-mono mt-0.5">
                  Cluster: {dbStatus.database || 'maddala_portfolio'} • Latency: {dbStatus.latencyMs}ms • Real-time CRUD active
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              href="/admin/settings"
              className="bg-white border-brand-200 text-brand-700 shrink-0 text-xs hover:bg-brand-50"
            >
              Database Telemetry
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>MongoDB Atlas Configuration & Local Persistence</span>
                  <Badge variant="slate" size="sm">Local Store Sync</Badge>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  The admin portal is running in resilient preview mode with local store fallback. Verify cluster credentials in Settings to synchronize live with MongoDB Atlas.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              href="/admin/settings"
              className="bg-white border-slate-200 text-slate-800 shrink-0 text-xs"
            >
              Verify Atlas Setup
            </Button>
          </div>
        )}

        {/* Summary Metric Cards */}
        <section aria-labelledby="summary-metrics-heading">
          <h3 id="summary-metrics-heading" className="sr-only">Summary Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} padding="md" hoverEffect className="flex flex-col justify-between bg-white border-slate-200/90 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={card.badgeVariant} size="sm">
                        {card.badge}
                      </Badge>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      {card.title}
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                      {card.count}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{card.detail}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 mt-4">
                    <Link
                      href={card.href}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-between"
                    >
                      <span>Manage Section</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section aria-labelledby="quick-actions-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 id="quick-actions-heading" className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Quick Actions
            </h3>
            <span className="text-xs text-slate-400">Common administrative workflows</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-card transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${action.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                    <span>Open Workflow</span>
                    <ArrowRight className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Content Status & Recent Activity Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Content Publication Status Table */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Portfolio Content Publication Status
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time breakdown of draft, published, and staged entries.
                  </p>
                </div>
                <Link
                  href="/admin/projects"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <span>All Projects</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No Projects Added Yet</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Your portfolio starts completely empty. Add your real data analytics case studies to populate this overview.
                  </p>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      href="/admin/projects"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Add Project
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {projects.slice(0, 5).map((p) => (
                    <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800 truncate">{p.title}</h4>
                          {p.featured && (
                            <Badge variant="blue" size="sm">Featured</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{p.category}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] truncate">/{p.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={p.status} size="sm" />
                        {p.status === 'published' ? (
                          <Link
                            href={`/projects/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                            title="View on public site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unpublished</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Status Overview Across Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Certifications</span>
                <div className="text-xl font-bold text-slate-900">{certs.length} Active</div>
                <p className="text-xs text-slate-500">
                  {certs.filter(c => c.status === 'completed').length} completed verification
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dynamic Custom Tabs</span>
                <div className="text-xl font-bold text-slate-900">{customTabs.length} Tabs</div>
                <p className="text-xs text-slate-500">
                  Custom schemas & records
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Skills & Tools</span>
                <div className="text-xl font-bold text-slate-900">
                  {skills.reduce((acc, cat) => acc + cat.skills.length, 0)} Items
                </div>
                <p className="text-xs text-slate-500">
                  Across {skills.length} categories
                </p>
              </div>
            </div>
          </div>

          {/* Right Col: Recent Activity & Security Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-white border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900">
                  <Activity className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold">Recent System Activity</h3>
                </div>
                <Link
                  href="/admin/activity"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View All →
                </Link>
              </div>

              {/* Real Activity List or Honest Empty State */}
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((act) => (
                    <div key={act.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{act.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{act.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                        <span>Actor: {act.actor}</span>
                        <span>•</span>
                        <span className="capitalize">{act.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AdminEmptyState
                  icon={Clock}
                  title="No Audit Activities Yet"
                  description="Real security and content change events will be recorded here as you create, publish, or edit items."
                />
              )}
            </Card>

            {/* Public Website Preview Shortcut Card */}
            <Card className="p-6 bg-gradient-to-br from-brand-50/40 to-slate-50 border-brand-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-brand-700">
                <ExternalLink className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Public Portfolio Link</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review your published case studies, profile, and credentials as public recruiters see them.
              </p>
              <div className="pt-1">
                <Button
                  size="sm"
                  href="/"
                  external
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="w-full justify-center"
                >
                  Open Live Portfolio
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
