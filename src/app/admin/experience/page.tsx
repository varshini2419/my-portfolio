'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  X,
  Save,
  ListPlus,
  MinusCircle
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Experience } from '@/types';
import {
  getCmsExperience,
  saveCmsExperience,
  deleteCmsExperience
} from '@/lib/services/cmsService';

export default function AdminExperiencePage() {
  const [experienceList, setExperienceList] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Partial<Experience> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expToDelete, setExpToDelete] = useState<Experience | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCmsExperience();
      setExperienceList(data);
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
    setEditingExp({
      organization: '',
      role: '',
      experience_type: 'internship',
      start_date: '2024',
      end_date: '',
      is_current: false,
      location: 'India',
      description: '',
      bullet_points: [''],
      skills_used: [],
      status: 'published',
      sort_order: experienceList.length + 1
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (exp: Experience) => {
    setEditingExp({
      ...exp,
      bullet_points: exp.bullet_points?.length ? [...exp.bullet_points] : [''],
      skills_used: exp.skills_used ? [...exp.skills_used] : []
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp?.organization?.trim() || !editingExp?.role?.trim()) {
      setErrorMessage('Organization name and Role title are required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const cleanExp: Partial<Experience> = {
      ...editingExp,
      bullet_points: editingExp.bullet_points?.filter((b) => b.trim().length > 0) || []
    };

    const res = await saveCmsExperience(cleanExp);
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage(`Experience at "${res.data?.organization}" saved successfully!`);
      setIsModalOpen(false);
      setEditingExp(null);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to save experience record.');
    }
  };

  const confirmDelete = async () => {
    if (!expToDelete) return;
    const res = await deleteCmsExperience(expToDelete.id);
    if (res.success) {
      setSuccessMessage(`Experience record deleted.`);
      setExpToDelete(null);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to delete experience record.');
    }
  };

  const handleBulletChange = (idx: number, val: string) => {
    if (!editingExp) return;
    const bullets = [...(editingExp.bullet_points || [])];
    bullets[idx] = val;
    setEditingExp({ ...editingExp, bullet_points: bullets });
  };

  const addBullet = () => {
    if (!editingExp) return;
    setEditingExp({
      ...editingExp,
      bullet_points: [...(editingExp.bullet_points || []), '']
    });
  };

  const removeBullet = (idx: number) => {
    if (!editingExp) return;
    const bullets = (editingExp.bullet_points || []).filter((_, i) => i !== idx);
    setEditingExp({ ...editingExp, bullet_points: bullets });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Experience & Internships"
        subtitle="Manage practical work experience, academic analytics research, and internship timeline."
      />

      <main className="p-6 sm:p-8 max-w-5xl space-y-6 flex-grow">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-400/80 text-brand-700 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-brand-600 hover:text-brand-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Work & Academic Experience</h3>
            <p className="text-xs text-slate-500">
              {experienceList.length} experiences registered.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Add Experience
          </Button>
        </div>

        {/* Experience List */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading experience...</div>
        ) : (
          <div className="space-y-4">
            {experienceList.map((exp) => (
              <Card key={exp.id} className="p-6 bg-white hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue" size="sm">
                        {exp.experience_type.toUpperCase()}
                      </Badge>
                      <Badge variant={exp.status === 'published' ? 'green' : 'amber'} size="sm">
                        {exp.status || 'published'}
                      </Badge>
                      {exp.is_current && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Current
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {exp.role} <span className="text-slate-400 font-normal">at</span> {exp.organization}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date || 'Present'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {exp.location}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-600 max-w-2xl pt-1">{exp.description}</p>
                    )}

                    {exp.bullet_points && exp.bullet_points.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pt-1">
                        {exp.bullet_points.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    )}

                    {exp.skills_used && exp.skills_used.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {exp.skills_used.map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-3.5 h-3.5" />}
                      onClick={() => handleEdit(exp)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => setExpToDelete(exp)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add / Edit Experience */}
        {isModalOpen && editingExp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-600" />
                  <span>{editingExp.id ? 'Edit Experience' : 'Add Experience Record'}</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Company *</label>
                    <input
                      type="text"
                      required
                      value={editingExp.organization || ''}
                      onChange={(e) => setEditingExp({ ...editingExp, organization: e.target.value })}
                      placeholder="e.g. SRKR Big Data Analytics Lab"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Role / Position *</label>
                    <input
                      type="text"
                      required
                      value={editingExp.role || ''}
                      onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                      placeholder="e.g. Student Research Lead / Data Analyst"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Experience Type</label>
                    <select
                      value={editingExp.experience_type || 'internship'}
                      onChange={(e) => setEditingExp({ ...editingExp, experience_type: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    >
                      <option value="internship">Internship</option>
                      <option value="academic">Academic / Research</option>
                      <option value="leadership">Leadership & Clubs</option>
                      <option value="project">Project Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editingExp.location || ''}
                      onChange={(e) => setEditingExp({ ...editingExp, location: e.target.value })}
                      placeholder="e.g. Bhimavaram, India or Remote"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={editingExp.start_date || ''}
                      onChange={(e) => setEditingExp({ ...editingExp, start_date: e.target.value })}
                      placeholder="e.g. July 2024"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                    <input
                      type="text"
                      disabled={Boolean(editingExp.is_current)}
                      value={editingExp.is_current ? 'Present' : editingExp.end_date || ''}
                      onChange={(e) => setEditingExp({ ...editingExp, end_date: e.target.value })}
                      placeholder="e.g. October 2024"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(editingExp.is_current)}
                      onChange={(e) => setEditingExp({ ...editingExp, is_current: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Currently in this role</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Summary Description</label>
                  <textarea
                    rows={2}
                    value={editingExp.description || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                    placeholder="Brief description of the role's mission and team scope..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Bullet Points */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Key Responsibilities & Deliverables</span>
                    <Button type="button" variant="ghost" size="sm" icon={<ListPlus className="w-3.5 h-3.5" />} onClick={addBullet}>
                      Add Item
                    </Button>
                  </div>
                  {editingExp.bullet_points?.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => handleBulletChange(i, e.target.value)}
                        placeholder="e.g. Engineered SQL aggregations to benchmark multi-table analytics workloads."
                        className="flex-grow px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button type="button" onClick={() => removeBullet(i)} className="text-slate-400 hover:text-rose-500 p-1">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skills & Tools Used (Comma-separated)</label>
                  <input
                    type="text"
                    value={editingExp.skills_used?.join(', ') || ''}
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setEditingExp({ ...editingExp, skills_used: skills });
                    }}
                    placeholder="Python, SQL, PostgreSQL, Data Cleaning"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Experience'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {expToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Delete Experience</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete experience at <strong>{expToDelete.organization}</strong>?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setExpToDelete(null)}>Cancel</Button>
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
