'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  X,
  Save,
  Play
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VlogItem } from '@/types';
import {
  getCmsVlogs,
  saveCmsVlog,
  deleteCmsVlog
} from '@/lib/services/cmsService';
import { formatVideoEmbedUrl } from '@/lib/services/portfolioService';

const VLOG_CATEGORIES = [
  'College Days',
  'Tech Journey',
  'Hackathons & Events',
  'Campus Life',
  'Productivity & Study'
];

export default function AdminVlogsPage() {
  const [vlogs, setVlogs] = useState<VlogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVlog, setEditingVlog] = useState<Partial<VlogItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vlogToDelete, setVlogToDelete] = useState<VlogItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCmsVlogs();
      setVlogs(data);
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

  const handleCreateNew = () => {
    setEditingVlog({
      title: '',
      description: '',
      thumbnail_url: '',
      video_url: '',
      video_source: 'youtube',
      category: 'College Days',
      published_date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'draft',
      duration: '3:30',
      sort_order: vlogs.length + 1
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vlog: VlogItem) => {
    setEditingVlog({ ...vlog });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVlog?.title?.trim() || !editingVlog?.video_url?.trim()) {
      setErrorMessage('Vlog title and Video URL are required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const cleanVlog: Partial<VlogItem> = {
      ...editingVlog,
      video_url: formatVideoEmbedUrl(editingVlog.video_url)
    };

    const res = await saveCmsVlog(cleanVlog);
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage(`Vlog "${res.data?.title}" saved successfully!`);
      setIsModalOpen(false);
      setEditingVlog(null);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage('Failed to save vlog.');
    }
  };

  const handleToggleStatus = async (vlog: VlogItem) => {
    const nextStatus = vlog.status === 'published' ? 'draft' : 'published';
    await saveCmsVlog({ ...vlog, status: nextStatus });
    setSuccessMessage(`Vlog "${vlog.title}" is now ${nextStatus}.`);
    loadData();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const confirmDelete = async () => {
    if (!vlogToDelete) return;
    await deleteCmsVlog(vlogToDelete.id);
    setSuccessMessage(`Vlog deleted.`);
    setVlogToDelete(null);
    loadData();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Personal Vlogs & Lifestyle"
        subtitle="Manage student lifestyle videos, campus moments, and tech study sessions."
      />

      <main className="p-6 sm:p-8 max-w-5xl space-y-6 flex-grow">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Registered Video Vlogs</h3>
            <p className="text-xs text-slate-500">
              {vlogs.length} vlogs ({vlogs.filter((v) => v.status === 'published').length} published, {vlogs.filter((v) => v.status === 'draft').length} drafts)
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Add New Vlog
          </Button>
        </div>

        {/* Vlogs List */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading vlogs...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vlogs.map((vlog) => (
              <Card key={vlog.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white hover:border-slate-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {vlog.thumbnail_url ? (
                      <img src={vlog.thumbnail_url} alt={vlog.title} className="w-full h-full object-cover" />
                    ) : (
                      <Video className="w-6 h-6 text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white/90 fill-white/80" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={vlog.status === 'published' ? 'green' : 'amber'} size="sm">
                        {vlog.status.toUpperCase()}
                      </Badge>
                      <Badge variant="blue" size="sm">{vlog.category}</Badge>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {vlog.duration || '3:00'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{vlog.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">{vlog.description}</p>
                    <span className="text-[11px] text-slate-400 font-mono block">Published: {vlog.published_date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(vlog)}
                    icon={vlog.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  >
                    {vlog.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit className="w-3.5 h-3.5" />}
                    onClick={() => handleEdit(vlog)}
                  >
                    Edit
                  </Button>

                  {vlog.status === 'published' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      href="/vlogs"
                      external
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      View Live
                    </Button>
                  )}

                  <button
                    onClick={() => setVlogToDelete(vlog)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete vlog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add / Edit Vlog */}
        {isModalOpen && editingVlog && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-brand-600" />
                  <span>{editingVlog.id ? 'Edit Vlog Video' : 'Add New Vlog Video'}</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vlog Title *</label>
                  <input
                    type="text"
                    required
                    value={editingVlog.title || ''}
                    onChange={(e) => setEditingVlog({ ...editingVlog, title: e.target.value })}
                    placeholder="e.g. Day in My Life at SRKR: Tech Labs & Coffee"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Video URL (YouTube Watch or Embed URL) *</label>
                  <input
                    type="url"
                    required
                    value={editingVlog.video_url || ''}
                    onChange={(e) => setEditingVlog({ ...editingVlog, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or embed URL"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={editingVlog.category || 'College Days'}
                      onChange={(e) => setEditingVlog({ ...editingVlog, category: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    >
                      {VLOG_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={editingVlog.duration || '3:30'}
                      onChange={(e) => setEditingVlog({ ...editingVlog, duration: e.target.value })}
                      placeholder="e.g. 4:15"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail Cover URL</label>
                  <input
                    type="url"
                    value={editingVlog.thumbnail_url || ''}
                    onChange={(e) => setEditingVlog({ ...editingVlog, thumbnail_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Caption</label>
                  <textarea
                    rows={3}
                    value={editingVlog.description || ''}
                    onChange={(e) => setEditingVlog({ ...editingVlog, description: e.target.value })}
                    placeholder="Brief caption describing this vlog..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editingVlog.status || 'draft'}
                      onChange={(e) => setEditingVlog({ ...editingVlog, status: e.target.value as 'draft' | 'published' })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="published">Published (Live Public)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={editingVlog.sort_order || 1}
                      onChange={(e) => setEditingVlog({ ...editingVlog, sort_order: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Vlog'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {vlogToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Delete Vlog</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong>{vlogToDelete.title}</strong>?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setVlogToDelete(null)}>Cancel</Button>
                <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={confirmDelete}>
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
