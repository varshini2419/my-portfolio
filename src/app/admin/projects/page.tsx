'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Eye,
  EyeOff,
  Star,
  X,
  Save,
  Image as ImageIcon,
  Video,
  FileCode,
  Tag,
  ListPlus,
  MinusCircle,
  HelpCircle,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Project, ProjectVideo, ProjectScreenshot } from '@/types';
import {
  getCmsProjects,
  saveCmsProject,
  deleteCmsProject,
  toggleCmsProjectStatus,
  uploadCmsFile
} from '@/lib/services/cmsService';

const PROJECT_CATEGORIES = [
  'Data Analytics',
  'Power BI & Dashboards',
  'SQL & Data Warehousing',
  'Machine Learning & Python',
  'Academic / Capstone'
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'case_study' | 'media' | 'links'>('basic');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete confirmation dialog
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Load projects
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getCmsProjects();
      setProjects(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    const handleStorageUpdated = () => loadProjects();
    window.addEventListener('cms_storage_updated', handleStorageUpdated);
    return () => window.removeEventListener('cms_storage_updated', handleStorageUpdated);
  }, []);

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, searchQuery, categoryFilter, statusFilter]);

  // Project statistics
  const stats = useMemo(() => {
    return {
      total: projects.length,
      published: projects.filter((p) => p.status === 'published').length,
      drafts: projects.filter((p) => p.status === 'draft').length,
      featured: projects.filter((p) => p.featured).length,
    };
  }, [projects]);

  // Open modal for new project
  const handleCreateNew = () => {
    setEditingProject({
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      problem_statement: '',
      business_objective: '',
      business_questions: [''],
      dataset_description: '',
      data_cleaning_process: [''],
      methodology: [''],
      key_findings: [''],
      recommendations: [''],
      thumbnail_url: '',
      github_url: '',
      live_demo_url: '',
      demo_videos: [],
      tags: [],
      category: 'Data Analytics',
      featured: false,
      sort_order: projects.length + 1,
      status: 'draft',
      screenshots: [],
    });
    setActiveTab('basic');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing existing project
  const handleEdit = (project: Project) => {
    setEditingProject({
      ...project,
      business_questions: project.business_questions?.length ? [...project.business_questions] : [''],
      data_cleaning_process: project.data_cleaning_process?.length ? [...project.data_cleaning_process] : [''],
      methodology: project.methodology?.length ? [...project.methodology] : [''],
      key_findings: project.key_findings?.length ? [...project.key_findings] : [''],
      recommendations: project.recommendations?.length ? [...project.recommendations] : [''],
      tags: [...project.tags],
      demo_videos: project.demo_videos ? [...project.demo_videos] : [],
      screenshots: project.screenshots ? [...project.screenshots] : [],
    });
    setActiveTab('basic');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save project handler
  const handleSaveProject = async (overrideStatus?: 'draft' | 'published') => {
    if (!editingProject?.title?.trim()) {
      setFormError('Project title is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const projectToSave: Partial<Project> = {
      ...editingProject,
      status: overrideStatus || editingProject.status || 'draft',
      // Clean up empty string entries from bullet lists
      business_questions: editingProject.business_questions?.filter((s) => s.trim().length > 0) || [],
      data_cleaning_process: editingProject.data_cleaning_process?.filter((s) => s.trim().length > 0) || [],
      methodology: editingProject.methodology?.filter((s) => s.trim().length > 0) || [],
      key_findings: editingProject.key_findings?.filter((s) => s.trim().length > 0) || [],
      recommendations: editingProject.recommendations?.filter((s) => s.trim().length > 0) || [],
    };

    const res = await saveCmsProject(projectToSave);

    setIsSaving(false);
    if (!res.success) {
      setFormError(res.error || 'Failed to save project.');
      return;
    }

    setSuccessMessage(`Project "${res.data?.title}" saved successfully!`);
    setIsModalOpen(false);
    setEditingProject(null);
    loadProjects();

    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // 1-click toggle status
  const handleToggleStatus = async (project: Project) => {
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    const res = await toggleCmsProjectStatus(project.id, nextStatus);
    if (res.success) {
      setSuccessMessage(`Project "${project.title}" changed to ${nextStatus}.`);
      loadProjects();
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // Delete project
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    const res = await deleteCmsProject(projectToDelete.id);
    if (res.success) {
      setSuccessMessage(`Project "${projectToDelete.title}" deleted.`);
      setProjectToDelete(null);
      loadProjects();
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // Helper for dynamic array fields
  const handleArrayChange = (field: keyof Project, index: number, value: string) => {
    if (!editingProject) return;
    const arr = [...((editingProject[field] as string[]) || [])];
    arr[index] = value;
    setEditingProject({ ...editingProject, [field]: arr });
  };

  const handleAddArrayItem = (field: keyof Project) => {
    if (!editingProject) return;
    const arr = [...((editingProject[field] as string[]) || []), ''];
    setEditingProject({ ...editingProject, [field]: arr });
  };

  const handleRemoveArrayItem = (field: keyof Project, index: number) => {
    if (!editingProject) return;
    const arr = ((editingProject[field] as string[]) || []).filter((_, i) => i !== index);
    setEditingProject({ ...editingProject, [field]: arr });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Projects & Case Studies"
        subtitle="Create, edit, organize, and publish Data Analytics case studies, Power BI dashboards, and SQL models."
      />

      <main className="p-6 sm:p-8 max-w-7xl space-y-6 flex-grow">
        {/* Notification Toast */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-400/80 text-brand-700 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-brand-600 hover:text-brand-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Action Bar & Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="bg-white">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Projects</span>
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
          </Card>
          <Card padding="sm" className="bg-brand-50/50 border-brand-200">
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider block">Published Live</span>
            <span className="text-2xl font-bold text-slate-900">{stats.published}</span>
          </Card>
          <Card padding="sm" className="bg-amber-50/50 border-amber-100">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Drafts (Private)</span>
            <span className="text-2xl font-bold text-amber-900">{stats.drafts}</span>
          </Card>
          <Card padding="sm" className="bg-brand-50/50 border-brand-100">
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider block">Featured Case Studies</span>
            <span className="text-2xl font-bold text-brand-900">{stats.featured}</span>
          </Card>
        </div>

        {/* Filter & Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 flex-grow">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-grow sm:flex-grow-0 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects, tags, slugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Categories</option>
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1 rounded-lg transition-colors ${statusFilter === 'published' ? 'bg-brand-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
              >
                Published
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1 rounded-lg transition-colors ${statusFilter === 'draft' ? 'bg-amber-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
              >
                Drafts
              </button>
            </div>
          </div>

          {/* New Project Button */}
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Create New Project
          </Button>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading project records...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
            <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Projects Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No projects match the current filters. Adjust your search or click below to create a new project.
            </p>
            <Button variant="outline" size="sm" onClick={handleCreateNew} icon={<Plus className="w-3.5 h-3.5" />}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                padding="md"
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-slate-300 transition-all bg-white"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail / Icon */}
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {project.thumbnail_url ? (
                      <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <FolderKanban className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={project.status === 'published' ? 'green' : 'amber'} size="sm">
                        {project.status.toUpperCase()}
                      </Badge>
                      <Badge variant="slate" size="sm">{project.category}</Badge>
                      {project.featured && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          <Star className="w-3 h-3 fill-amber-500" /> Featured
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">Order: #{project.sort_order}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{project.short_description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="text-[11px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                        /projects/{project.slug}
                      </span>
                      {project.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="text-[10px] text-slate-400">+{project.tags.length - 4} more</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  {/* Status Toggle Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(project)}
                    icon={project.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    title={project.status === 'published' ? 'Unpublish to draft' : 'Publish live'}
                  >
                    {project.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>

                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit className="w-3.5 h-3.5" />}
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </Button>

                  {/* Public Link (if published) */}
                  {project.status === 'published' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      href={`/projects/${project.slug}`}
                      external
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                      title="View public live page"
                    >
                      View Live
                    </Button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => setProjectToDelete(project)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete project"
                    aria-label={`Delete ${project.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* COMPREHENSIVE CREATE / EDIT PROJECT MODAL                                */}
        {/* ========================================================================= */}
        {isModalOpen && editingProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-brand-600" />
                    <span>{editingProject.id ? `Edit: ${editingProject.title || 'Untitled'}` : 'Create New Analytics Case Study'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fill in complete project specifications, problem statements, deliverables, and media.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex items-center gap-1 px-6 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'basic' ? 'border-brand-600 text-brand-700 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  1. Basic Info & Scope
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('case_study')}
                  className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'case_study' ? 'border-brand-600 text-brand-700 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  2. Case Study & Analysis Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'media' ? 'border-brand-600 text-brand-700 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  3. Media, Dual Videos & Screenshots
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('links')}
                  className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'links' ? 'border-brand-600 text-brand-700 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  4. Stack, GitHub & Live Links
                </button>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                {formError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* TAB 1: BASIC INFO */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={editingProject.title || ''}
                        onChange={(e) => {
                          const title = e.target.value;
                          const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                          setEditingProject({
                            ...editingProject,
                            title,
                            slug: editingProject.id ? editingProject.slug : autoSlug
                          });
                        }}
                        placeholder="e.g. Bank Customer Churn & Retention Analysis"
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          URL Slug (unique) *
                        </label>
                        <div className="flex items-center">
                          <span className="px-3 py-2 text-xs bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono">
                            /projects/
                          </span>
                          <input
                            type="text"
                            value={editingProject.slug || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value.toLowerCase().trim() })}
                            placeholder="customer-churn-analytics"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={editingProject.category || 'Data Analytics'}
                          onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {PROJECT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Publication Status
                        </label>
                        <select
                          value={editingProject.status || 'draft'}
                          onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as 'draft' | 'published' })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="draft">Draft (Private)</option>
                          <option value="published">Published (Live Public)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Sort Order Index
                        </label>
                        <input
                          type="number"
                          value={editingProject.sort_order || 1}
                          onChange={(e) => setEditingProject({ ...editingProject, sort_order: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                        />
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(editingProject.featured)}
                            onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                          />
                          <span className="text-xs font-bold text-slate-800">Featured on Homepage</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Short Summary (1-2 sentences for cards) *
                      </label>
                      <textarea
                        rows={2}
                        value={editingProject.short_description || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, short_description: e.target.value })}
                        placeholder="Comprehensive churn study analyzing customer attrition patterns using SQL segmentation and Power BI..."
                        className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Case Study Overview Narrative
                      </label>
                      <textarea
                        rows={5}
                        value={editingProject.full_description || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, full_description: e.target.value })}
                        placeholder="Provide deep background context, project scope, execution environment, and business impacts..."
                        className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: CASE STUDY & ANALYSIS DETAILS */}
                {activeTab === 'case_study' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Problem Statement
                      </label>
                      <textarea
                        rows={3}
                        value={editingProject.problem_statement || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, problem_statement: e.target.value })}
                        placeholder="What exact problem was this analysis solving?"
                        className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Business Objective
                      </label>
                      <textarea
                        rows={3}
                        value={editingProject.business_objective || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, business_objective: e.target.value })}
                        placeholder="What business goals, KPI targets, or metrics was this project designed to influence?"
                        className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dataset Description (Schema, source, record count)
                      </label>
                      <textarea
                        rows={2}
                        value={editingProject.dataset_description || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, dataset_description: e.target.value })}
                        placeholder="e.g. 10,000 multi-national customer records with 14 demographic & transactional features."
                        className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Dynamic Bullet Lists */}
                    {/* 1. Methodology */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Methodology & Steps (Bullet Points)
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ListPlus className="w-3.5 h-3.5" />}
                          onClick={() => handleAddArrayItem('methodology')}
                        >
                          Add Step
                        </Button>
                      </div>
                      {editingProject.methodology?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('methodology', idx, e.target.value)}
                            placeholder={`Methodology bullet #${idx + 1}`}
                            className="flex-grow px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('methodology', idx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 2. Key Findings */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Key Findings & Analytical Insights (Bullet Points)
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ListPlus className="w-3.5 h-3.5" />}
                          onClick={() => handleAddArrayItem('key_findings')}
                        >
                          Add Finding
                        </Button>
                      </div>
                      {editingProject.key_findings?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('key_findings', idx, e.target.value)}
                            placeholder={`Finding bullet #${idx + 1}`}
                            className="flex-grow px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('key_findings', idx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 3. Business Recommendations */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Business Recommendations (Bullet Points)
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ListPlus className="w-3.5 h-3.5" />}
                          onClick={() => handleAddArrayItem('recommendations')}
                        >
                          Add Recommendation
                        </Button>
                      </div>
                      {editingProject.recommendations?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('recommendations', idx, e.target.value)}
                            placeholder={`Recommendation bullet #${idx + 1}`}
                            className="flex-grow px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('recommendations', idx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 4. Data Cleaning Process */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Data Cleaning & Preprocessing (Bullet Points)
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ListPlus className="w-3.5 h-3.5" />}
                          onClick={() => handleAddArrayItem('data_cleaning_process')}
                        >
                          Add Item
                        </Button>
                      </div>
                      {editingProject.data_cleaning_process?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('data_cleaning_process', idx, e.target.value)}
                            placeholder={`Data cleaning step #${idx + 1}`}
                            className="flex-grow px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('data_cleaning_process', idx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: MEDIA, DUAL VIDEOS & SCREENSHOTS */}
                {activeTab === 'media' && (
                  <div className="space-y-6">
                    {/* Thumbnail Image */}
                    <FileUpload
                      label="Cover / Thumbnail Image (Upload from Computer or enter URL)"
                      value={editingProject.thumbnail_url || ''}
                      accept="image/*"
                      placeholder="Drop cover image or paste URL..."
                      onChange={(url) => setEditingProject({ ...editingProject, thumbnail_url: url })}
                    />

                    {/* Dual Demo Videos Section */}
                    <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-brand-600" />
                            Dual Video Demonstrations (Prompt 3 requirement)
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            Support up to 2 video demos per project (e.g. Executive Power BI Tour + SQL Technical Walkthrough).
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() => {
                            const videos = editingProject.demo_videos || [];
                            if (videos.length >= 2) {
                              alert('Dual video demos maximum reached (2 videos).');
                              return;
                            }
                            setEditingProject({
                              ...editingProject,
                              demo_videos: [
                                ...videos,
                                {
                                  title: videos.length === 0 ? 'Executive Dashboard Walkthrough' : 'SQL Technical Deep Dive',
                                  url: '',
                                  source: 'youtube'
                                }
                              ]
                            });
                          }}
                        >
                          Add Video
                        </Button>
                      </div>

                      {editingProject.demo_videos?.map((vid, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Video Demo #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingProject.demo_videos || []).filter((_, i) => i !== idx);
                                setEditingProject({ ...editingProject, demo_videos: updated });
                              }}
                              className="text-slate-400 hover:text-rose-500 text-xs flex items-center gap-1"
                            >
                              <MinusCircle className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={vid.title}
                              onChange={(e) => {
                                const updated = [...(editingProject.demo_videos || [])];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setEditingProject({ ...editingProject, demo_videos: updated });
                              }}
                              placeholder="Video Title (e.g. Dashboard Demo)"
                              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <input
                              type="url"
                              value={vid.url}
                              onChange={(e) => {
                                const updated = [...(editingProject.demo_videos || [])];
                                updated[idx] = { ...updated[idx], url: e.target.value };
                                setEditingProject({ ...editingProject, demo_videos: updated });
                              }}
                              placeholder="YouTube or Video URL"
                              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 sm:col-span-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Screenshots Gallery Section */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-slate-600" />
                            Project Screenshots & Charts Gallery
                          </h4>
                          <span className="text-[11px] text-slate-500">Upload charts, architecture diagrams, or report screenshots directly.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 cursor-pointer transition-colors shadow-2xs">
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload Screenshot</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const res = await uploadCmsFile(file);
                                if (res.success && res.url) {
                                  const shots = editingProject.screenshots || [];
                                  setEditingProject({
                                    ...editingProject,
                                    screenshots: [...shots, { url: res.url, caption: file.name }]
                                  });
                                } else {
                                  alert(res.error || 'Failed to upload screenshot');
                                }
                              }}
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Plus className="w-3.5 h-3.5" />}
                            onClick={() => {
                              const shots = editingProject.screenshots || [];
                              setEditingProject({
                                ...editingProject,
                                screenshots: [...shots, { url: '', caption: '' }]
                              });
                            }}
                          >
                            Add URL
                          </Button>
                        </div>
                      </div>

                      {editingProject.screenshots?.map((shot, idx) => {
                        const shotUrl = typeof shot === 'string' ? shot : shot.url;
                        const shotCaption = typeof shot === 'string' ? '' : shot.caption || '';
                        return (
                          <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center gap-2">
                              {shotUrl && (
                                <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                                  <img src={shotUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <input
                                type="url"
                                value={shotUrl}
                                onChange={(e) => {
                                  const updated = [...(editingProject.screenshots || [])];
                                  updated[idx] = { url: e.target.value, caption: shotCaption };
                                  setEditingProject({ ...editingProject, screenshots: updated });
                                }}
                                placeholder="Image URL or upload below..."
                                className="flex-grow px-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                              />
                              <input
                                type="text"
                                value={shotCaption}
                                onChange={(e) => {
                                  const updated = [...(editingProject.screenshots || [])];
                                  updated[idx] = { url: shotUrl, caption: e.target.value };
                                  setEditingProject({ ...editingProject, screenshots: updated });
                                }}
                                placeholder="Caption (optional)"
                                className="w-44 px-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                              />
                              <label className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors" title="Upload and replace file">
                                <UploadCloud className="w-4 h-4" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const res = await uploadCmsFile(file);
                                    if (res.success && res.url) {
                                      const updated = [...(editingProject.screenshots || [])];
                                      updated[idx] = { url: res.url, caption: shotCaption || file.name };
                                      setEditingProject({ ...editingProject, screenshots: updated });
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingProject.screenshots || []).filter((_, i) => i !== idx);
                                  setEditingProject({ ...editingProject, screenshots: updated });
                                }}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <MinusCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 4: STACK, GITHUB & LIVE LINKS */}
                {activeTab === 'links' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Technologies & Tools (Comma-separated tags)
                      </label>
                      <input
                        type="text"
                        value={editingProject.tags?.join(', ') || ''}
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                          setEditingProject({ ...editingProject, tags });
                        }}
                        placeholder="Python, SQL, Power BI, Excel, Pandas, DAX, Seaborn"
                        className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {editingProject.tags?.map((t) => (
                          <span key={t} className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          GitHub Repository URL
                        </label>
                        <input
                          type="url"
                          value={editingProject.github_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                          placeholder="https://github.com/maddalavarshini/churn-analysis"
                          className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Live Interactive Demo / Dashboard URL
                        </label>
                        <input
                          type="url"
                          value={editingProject.live_demo_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, live_demo_url: e.target.value })}
                          placeholder="https://app.powerbi.com/view?... or Streamlit URL"
                          className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveProject('draft')}
                    disabled={isSaving}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Save className="w-3.5 h-3.5" />}
                    onClick={() => handleSaveProject('published')}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save & Publish Live'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION MODAL                                                */}
        {/* ========================================================================= */}
        {projectToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Confirm Project Deletion</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete <strong>{projectToDelete.title}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setProjectToDelete(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={confirmDelete}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
