'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  X,
  Save,
  Tag,
  Clock
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Certification } from '@/types';
import {
  getCmsCertifications,
  saveCmsCertification,
  deleteCmsCertification
} from '@/lib/services/cmsService';

export default function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Partial<Certification> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [certToDelete, setCertToDelete] = useState<Certification | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCmsCertifications();
      setCertifications(data);
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
    setEditingCert({
      title: '',
      issuer: '',
      issue_date: '2024',
      credential_url: '',
      certificate_image_url: '',
      is_ongoing: false,
      status: 'completed',
      skills_covered: [],
      sort_order: certifications.length + 1
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cert: Certification) => {
    setEditingCert({
      ...cert,
      skills_covered: cert.skills_covered ? [...cert.skills_covered] : []
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert?.title?.trim() || !editingCert?.issuer?.trim()) {
      setErrorMessage('Certification title and Issuer are required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const res = await saveCmsCertification(editingCert);
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage(`Certification "${res.data?.title}" saved successfully!`);
      setIsModalOpen(false);
      setEditingCert(null);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to save certification record.');
    }
  };

  const confirmDelete = async () => {
    if (!certToDelete) return;
    const res = await deleteCmsCertification(certToDelete.id);
    if (res.success) {
      setSuccessMessage(`Certification "${certToDelete.title}" deleted.`);
      setCertToDelete(null);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to delete certification record.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Certifications & Credentials"
        subtitle="Manage professional data analytics credentials, course completions, and ongoing certifications."
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
            <h3 className="text-sm font-bold text-slate-900">Registered Credentials</h3>
            <p className="text-xs text-slate-500">
              {certifications.length} certificates (
              {certifications.filter((c) => c.status === 'completed').length} completed,{' '}
              {certifications.filter((c) => c.status === 'in_progress').length} in progress)
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateNew}
          >
            Add Certification
          </Button>
        </div>

        {/* Certification Cards */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading certifications...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id} className="p-5 bg-white hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={cert.status === 'completed' ? 'green' : 'amber'} size="sm">
                        {cert.status === 'completed' ? 'Verified / Completed' : 'In Progress'}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">Order: #{cert.sort_order}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{cert.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{cert.issuer}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {cert.issue_date}
                      </span>
                    </div>

                    {cert.skills_covered && cert.skills_covered.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cert.skills_covered.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cert.credential_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        href={cert.credential_url}
                        external
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        title="Verify credential"
                      >
                        Verify
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-3.5 h-3.5" />}
                      onClick={() => handleEdit(cert)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => setCertToDelete(cert)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete certification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add / Edit Certification */}
        {isModalOpen && editingCert && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-600" />
                  <span>{editingCert.id ? 'Edit Certification' : 'Add Certification'}</span>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Certification Title *</label>
                  <input
                    type="text"
                    required
                    value={editingCert.title || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                    placeholder="e.g. Google Data Analytics Professional Certificate"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Issuer / Platform *</label>
                    <input
                      type="text"
                      required
                      value={editingCert.issuer || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                      placeholder="Google / Coursera / Microsoft"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date / Year</label>
                    <input
                      type="text"
                      value={editingCert.issue_date || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, issue_date: e.target.value })}
                      placeholder="2024 or In Progress"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editingCert.status || 'completed'}
                      onChange={(e) => {
                        const status = e.target.value as 'completed' | 'in_progress';
                        setEditingCert({
                          ...editingCert,
                          status,
                          is_ongoing: status === 'in_progress'
                        });
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    >
                      <option value="completed">Completed / Verified</option>
                      <option value="in_progress">Currently In Progress</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={editingCert.sort_order || 1}
                      onChange={(e) => setEditingCert({ ...editingCert, sort_order: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                </div>

                <FileUpload
                  label="Credential URL or Certificate Document / Badge (Upload or Link)"
                  value={editingCert.credential_url || ''}
                  accept="image/*,application/pdf"
                  compact
                  placeholder="Drop certificate image/PDF or paste verification URL..."
                  onChange={(url) => setEditingCert({ ...editingCert, credential_url: url })}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skills Covered (Comma-separated)</label>
                  <input
                    type="text"
                    value={editingCert.skills_covered?.join(', ') || ''}
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setEditingCert({ ...editingCert, skills_covered: skills });
                    }}
                    placeholder="SQL, Tableau, R, Data Cleaning, Metadata"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Certification'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {certToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Delete Certification</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong>{certToDelete.title}</strong>?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setCertToDelete(null)}>Cancel</Button>
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
