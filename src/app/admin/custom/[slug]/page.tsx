'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Eye,
  Settings,
  X,
  Save,
  Loader2,
  Calendar,
  Layers,
  ArrowUpDown,
  Tag,
  FileText
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CreateTabModal } from '@/components/admin/CreateTabModal';
import { renderTabIcon } from '@/components/admin/TabIconHelper';
import { FileUpload } from '@/components/admin/FileUpload';
import { CustomTabConfig, CustomTabRecord, CustomFieldDefinition } from '@/types';
import {
  getCmsCustomTabBySlug,
  getCmsCustomRecords,
  saveCmsCustomRecord,
  deleteCmsCustomRecord,
  deleteCmsCustomTab
} from '@/lib/services/cmsService';

export default function DynamicCustomTabPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : '';

  const [tabConfig, setTabConfig] = useState<CustomTabConfig | null>(null);
  const [records, setRecords] = useState<CustomTabRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Record Modal (Create / Edit)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CustomTabRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [recordFormError, setRecordFormError] = useState<string | null>(null);

  // Detail View Modal
  const [viewingRecord, setViewingRecord] = useState<CustomTabRecord | null>(null);

  // Delete Record Dialog
  const [recordToDelete, setRecordToDelete] = useState<CustomTabRecord | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);

  // Tab Settings Modal (CreateTabModal in edit mode)
  const [isTabSettingsOpen, setIsTabSettingsOpen] = useState(false);

  // Delete Tab Dialog
  const [isDeleteTabDialogOpen, setIsDeleteTabDialogOpen] = useState(false);
  const [isDeletingTab, setIsDeletingTab] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = React.useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const config = await getCmsCustomTabBySlug(slug);
      if (!config) {
        setTabConfig(null);
        return;
      }
      setTabConfig(config);
      const recs = await getCmsCustomRecords(slug);
      setRecords(recs);
    } catch (err) {
      console.warn('Failed to load custom tab data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('cms_storage_updated', handleUpdate);
    return () => window.removeEventListener('cms_storage_updated', handleUpdate);
  }, [loadData]);

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        return Object.values(r.data || {}).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [records, searchQuery, sortOrder]);

  // Handle open Record Create
  const handleOpenCreateRecord = () => {
    if (!tabConfig) return;
    const initial: Record<string, any> = {};
    tabConfig.fields.forEach((f) => {
      if (f.type === 'boolean') initial[f.key] = false;
      else if (f.type === 'select' && f.options && f.options.length > 0) initial[f.key] = f.options[0];
      else initial[f.key] = '';
    });
    setFormData(initial);
    setEditingRecord(null);
    setRecordFormError(null);
    setIsRecordModalOpen(true);
  };

  // Handle open Record Edit
  const handleOpenEditRecord = (record: CustomTabRecord) => {
    setFormData({ ...(record.data || {}) });
    setEditingRecord(record);
    setRecordFormError(null);
    setIsRecordModalOpen(true);
  };

  // Save Record
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabConfig) return;
    setRecordFormError(null);

    // Validate required fields
    for (const f of tabConfig.fields) {
      if (f.required) {
        const val = formData[f.key];
        if (val === undefined || val === null || String(val).trim() === '') {
          setRecordFormError(`"${f.label}" is required.`);
          return;
        }
      }
    }

    setIsSavingRecord(true);
    try {
      const payload: Partial<CustomTabRecord> = {
        data: formData,
      };
      if (editingRecord) {
        payload.id = editingRecord.id;
      }

      const res = await saveCmsCustomRecord(tabConfig.slug, payload);
      if (res.success && res.data) {
        showToast(
          editingRecord
            ? `${tabConfig.singular_name} updated successfully!`
            : `${tabConfig.singular_name} added successfully!`
        );
        setIsRecordModalOpen(false);
        loadData();
      } else {
        setRecordFormError(res.error || 'Failed to save record.');
      }
    } catch (err: unknown) {
      setRecordFormError(err instanceof Error ? err.message : 'Error saving record');
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Delete Record
  const handleConfirmDeleteRecord = async () => {
    if (!tabConfig || !recordToDelete) return;
    setIsDeletingRecord(true);
    try {
      const res = await deleteCmsCustomRecord(tabConfig.slug, recordToDelete.id);
      if (res.success) {
        showToast(`${tabConfig.singular_name} deleted.`);
        setRecordToDelete(null);
        loadData();
      } else {
        showToast(res.error || 'Failed to delete record.');
      }
    } catch {
      showToast('Failed to delete record.');
    } finally {
      setIsDeletingRecord(false);
    }
  };

  // Delete Entire Tab
  const handleConfirmDeleteTab = async () => {
    if (!tabConfig) return;
    setIsDeletingTab(true);
    try {
      const res = await deleteCmsCustomTab(tabConfig.slug);
      if (res.success) {
        router.push('/admin/dashboard');
      } else {
        showToast(res.error || 'Failed to delete tab.');
      }
    } catch {
      showToast('Failed to delete tab.');
    } finally {
      setIsDeletingTab(false);
      setIsDeleteTabDialogOpen(false);
    }
  };

  // Format cell display
  const renderCellContent = (field: CustomFieldDefinition, value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-300 font-mono text-[11px]">—</span>;
    }

    if (field.type === 'boolean') {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            value ? 'bg-brand-50 text-brand-700 border border-brand-400/80' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (field.type === 'url') {
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 hover:underline max-w-[200px] truncate"
        >
          <span className="truncate">{String(value).replace(/^https?:\/\//i, '')}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
    }

    if (field.type === 'date') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{String(value)}</span>
        </span>
      );
    }

    if (field.type === 'select') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {String(value)}
        </span>
      );
    }

    return (
      <span className="text-xs text-slate-800 line-clamp-1 max-w-[280px]">
        {String(value)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AdminHeader title="Loading Management Tab..." />
        <main className="flex-grow p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <span className="text-xs font-medium">Loading tab records...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!tabConfig) {
    return (
      <div className="flex flex-col min-h-screen">
        <AdminHeader title="Tab Not Found" />
        <main className="flex-grow p-6">
          <div className="max-w-xl mx-auto py-12">
            <AdminEmptyState
              title="Management Tab Not Found"
              description={`No custom management tab exists with slug "${slug}". It may have been renamed or deleted.`}
              actionLabel="Return to Dashboard"
              onAction={() => router.push('/admin/dashboard')}
            />
          </div>
        </main>
      </div>
    );
  }

  const primaryFields = tabConfig.fields.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title={tabConfig.name}
        subtitle={tabConfig.description || `Manage custom ${tabConfig.plural_name.toLowerCase()} for your portfolio`}
      />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3.5 bg-brand-50 border border-brand-400/80 text-brand-700 rounded-xl flex items-center gap-2.5 text-xs animate-fade-in shadow-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200/70 text-brand-600 flex items-center justify-center shrink-0 shadow-xs">
              {renderTabIcon(tabConfig.icon, 'w-6 h-6')}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  {tabConfig.name}
                </h1>
                <Badge variant="blue" size="sm">
                  {records.length} {records.length === 1 ? tabConfig.singular_name : tabConfig.plural_name}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {tabConfig.description || `Custom dynamic records schema with ${tabConfig.fields.length} configured fields.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTabSettingsOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Tab Settings</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenCreateRecord}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add {tabConfig.singular_name}</span>
            </Button>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-grow max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${tabConfig.plural_name.toLowerCase()} across all fields...`}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <span className="text-[11px] text-slate-400 font-medium">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Records Content */}
        {records.length === 0 ? (
          <div className="py-8">
            <AdminEmptyState
              title={`No ${tabConfig.plural_name.toLowerCase()} added yet`}
              description={`Start building your ${tabConfig.name.toLowerCase()} catalog. All records you add here will be stored in your portfolio database.`}
              actionLabel={`+ Add First ${tabConfig.singular_name}`}
              onAction={handleOpenCreateRecord}
            />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-8 bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
            <p className="text-xs text-slate-500">
              No {tabConfig.plural_name.toLowerCase()} match &quot;{searchQuery}&quot;.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <Card className="overflow-hidden border border-slate-200/90 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {primaryFields.map((f) => (
                      <th key={f.id} className="py-3 px-4">
                        {f.label}
                      </th>
                    ))}
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {primaryFields.map((field) => (
                        <td key={field.id} className="py-3 px-4 font-medium text-slate-800">
                          {renderCellContent(field, record.data?.[field.key])}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(record.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingRecord(record)}
                            title="View Full Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditRecord(record)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(record)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Record Add / Edit Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200/60">
                  {renderTabIcon(tabConfig.icon, 'w-4 h-4')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {editingRecord ? `Edit ${tabConfig.singular_name}` : `Add New ${tabConfig.singular_name}`}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {tabConfig.name} Record Form
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {recordFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{recordFormError}</span>
                </div>
              )}

              {/* Dynamic Inputs according to Tab Schema */}
              {tabConfig.fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {/* Input Rendering per field.type */}
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                      required={field.required}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                    />
                  )}

                  {field.type === 'long_text' && (
                    <textarea
                      rows={3}
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder || `Enter detailed ${field.label.toLowerCase()}...`}
                      required={field.required}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white scrollbar-thin"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      step="any"
                      value={formData[field.key] !== undefined ? formData[field.key] : ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder || '0'}
                      required={field.required}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                    />
                  )}

                  {field.type === 'date' && (
                    <input
                      type="date"
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                    />
                  )}

                  {field.type === 'url' && (
                    <FileUpload
                      compact
                      value={formData[field.key] || ''}
                      onChange={(url) => setFormData({ ...formData, [field.key]: url })}
                      placeholder={field.placeholder || 'https://example.com or upload file...'}
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                    >
                      <option value="">Select an option...</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'boolean' && (
                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(formData[field.key])}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        Enable / Mark as Yes
                      </span>
                    </label>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRecordModalOpen(false)}
                  disabled={isSavingRecord}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingRecord}
                  className="gap-2"
                >
                  {isSavingRecord ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingRecord ? 'Update Record' : 'Save Record'}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Detail View Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200/60">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {tabConfig.singular_name} Details
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {viewingRecord.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {tabConfig.fields.map((field) => (
                <div key={field.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {field.label}
                  </span>
                  <div className="text-xs text-slate-800 break-words font-medium">
                    {renderCellContent(field, viewingRecord.data?.[field.key])}
                  </div>
                </div>
              ))}

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Created: {new Date(viewingRecord.created_at).toLocaleString()}</span>
                <span>Updated: {new Date(viewingRecord.updated_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/40 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewingRecord(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        title={`Delete ${tabConfig.singular_name}?`}
        message={`Are you sure you want to permanently delete this ${tabConfig.singular_name.toLowerCase()} record? This action cannot be undone.`}
        confirmLabel="Delete Record"
        variant="danger"
        isBusy={isDeletingRecord}
        onConfirm={handleConfirmDeleteRecord}
        onCancel={() => setRecordToDelete(null)}
      />

      {/* Edit Tab Config Modal */}
      <CreateTabModal
        isOpen={isTabSettingsOpen}
        onClose={() => setIsTabSettingsOpen(false)}
        initialData={tabConfig}
        onTabCreated={(updated) => {
          setTabConfig(updated);
          showToast('Tab configuration updated successfully!');
          window.dispatchEvent(new Event('cms_storage_updated'));
        }}
      />

      {/* Delete Entire Tab Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteTabDialogOpen}
        title={`Delete Entire "${tabConfig.name}" Tab?`}
        message={`Warning: Deleting this tab will permanently remove the tab configuration and all ${records.length} stored record(s). Are you sure?`}
        confirmLabel="Delete Entire Tab"
        variant="danger"
        isBusy={isDeletingTab}
        onConfirm={handleConfirmDeleteTab}
        onCancel={() => setIsDeleteTabDialogOpen(false)}
      />
    </div>
  );
}
