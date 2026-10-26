'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Calendar,
  Award,
  ListPlus,
  MinusCircle
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Education } from '@/types';
import {
  getCmsEducation,
  saveCmsEducation,
  deleteCmsEducation
} from '@/lib/services/cmsService';

export default function AdminEducationPage() {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Education> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Education | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCmsEducation();
      setEducationList(data);
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
    setEditingItem({
      institution: '',
      degree: '',
      field_of_study: '',
      start_year: '2023',
      end_year: '2026',
      grade_or_status: 'Undergraduate',
      highlights: [''],
      sort_order: educationList.length + 1
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Education) => {
    setEditingItem({
      ...item,
      highlights: item.highlights?.length ? [...item.highlights] : ['']
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.institution?.trim() || !editingItem?.degree?.trim()) {
      setErrorMessage('Institution name and Degree are required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const cleanItem: Partial<Education> = {
      ...editingItem,
      highlights: editingItem.highlights?.filter((h) => h.trim().length > 0) || []
    };

    const res = await saveCmsEducation(cleanItem);
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage(`Education at "${res.data?.institution}" saved successfully!`);
      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to save education record.');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const res = await deleteCmsEducation(itemToDelete.id);
    if (res.success) {
      setSuccessMessage(`Education record deleted.`);
      setItemToDelete(null);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to delete education record.');
    }
  };

  const handleHighlightChange = (index: number, val: string) => {
    if (!editingItem) return;
    const arr = [...(editingItem.highlights || [])];
    arr[index] = val;
    setEditingItem({ ...editingItem, highlights: arr });
  };

  const addHighlight = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      highlights: [...(editingItem.highlights || []), '']
    });
  };

  const removeHighlight = (index: number) => {
    if (!editingItem) return;
    const arr = (editingItem.highlights || []).filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, highlights: arr });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Education Credentials"
        subtitle="Manage your degree programs, academic institutions, graduation timelines, and coursework honors."
      />

      <main className="p-6 sm:p-8 max-w-5xl space-y-6 flex-grow">
        {/* Feedback Alert */}
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
            <span className="text-xs font-bold text-slate-700">Academic History</span>
            <p className="text-[11px] text-slate-400">Total {educationList.length} educational qualifications registered.</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Add Education
          </Button>
        </div>

        {/* Education List */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading academic records...</div>
        ) : (
          <div className="space-y-4">
            {educationList.map((edu) => (
              <Card key={edu.id} className="p-6 bg-white hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{edu.institution}</h3>
                        <span className="text-xs text-brand-700 font-semibold">{edu.degree} — {edu.field_of_study}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {edu.start_year} – {edu.end_year}
                      </span>
                      {edu.grade_or_status && (
                        <Badge variant="blue" size="sm">
                          {edu.grade_or_status}
                        </Badge>
                      )}
                      <span className="text-[11px] text-slate-400">Sort: #{edu.sort_order}</span>
                    </div>

                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pt-2">
                        {edu.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-3.5 h-3.5" />}
                      onClick={() => handleEdit(edu)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => setItemToDelete(edu)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete education record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add / Edit Education */}
        {isModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-5 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                  <span>{editingItem.id ? 'Edit Education' : 'Add Education Record'}</span>
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

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.institution || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                    placeholder="SRKR Engineering College"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Degree *</label>
                    <input
                      type="text"
                      required
                      value={editingItem.degree || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                      placeholder="Bachelor of Technology (B.Tech)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Branch / Specialization</label>
                    <input
                      type="text"
                      value={editingItem.field_of_study || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, field_of_study: e.target.value })}
                      placeholder="Computer Science and Information Technology"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Year</label>
                    <input
                      type="text"
                      value={editingItem.start_year || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, start_year: e.target.value })}
                      placeholder="2023"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End / Expected Year</label>
                    <input
                      type="text"
                      value={editingItem.end_year || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, end_year: e.target.value })}
                      placeholder="2026"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Status</label>
                    <input
                      type="text"
                      value={editingItem.grade_or_status || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, grade_or_status: e.target.value })}
                      placeholder="Undergraduate / 8.5 CGPA"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Highlights */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Academic Highlights & Relevant Coursework</span>
                    <Button type="button" variant="ghost" size="sm" icon={<ListPlus className="w-3.5 h-3.5" />} onClick={addHighlight}>
                      Add
                    </Button>
                  </div>
                  {editingItem.highlights?.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => handleHighlightChange(i, e.target.value)}
                        placeholder="e.g. Focus on Database Management Systems, Data Structures, and Probability & Statistics."
                        className="flex-grow px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button type="button" onClick={() => removeHighlight(i)} className="text-slate-400 hover:text-rose-500 p-1">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Education'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Delete Education Record</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete education entry for <strong>{itemToDelete.institution}</strong>?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setItemToDelete(null)}>Cancel</Button>
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
