'use client';

import React, { useState, useEffect } from 'react';
import {
  Blocks,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Save,
  Tag,
  Code
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { AdminSearchFilter } from '@/components/admin/AdminSearchFilter';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import {
  ContentBlock,
  getCmsContentBlocks,
  saveCmsContentBlock,
  deleteCmsContentBlock
} from '@/lib/services/cmsService';

const BLOCK_TYPES = [
  { value: 'highlight', label: 'Highlight / Banner Callout' },
  { value: 'heading', label: 'Heading / Quote' },
  { value: 'paragraph', label: 'Paragraph / Narrative' },
  { value: 'button', label: 'Action Button / CTA' },
  { value: 'rich_text', label: 'Rich Markdown / Text' },
];

export default function AdminPageContentManager() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Partial<ContentBlock> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [blockToDelete, setBlockToDelete] = useState<ContentBlock | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCmsContentBlocks();
      setBlocks(data);
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
    setEditingBlock({
      key: '',
      title: '',
      block_type: 'highlight',
      content: '',
      link_url: '',
      link_label: '',
      display_order: blocks.length + 1,
      is_published: true
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (block: ContentBlock) => {
    setEditingBlock({ ...block });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock?.key?.trim() || !editingBlock?.content?.trim()) {
      setErrorMessage('Block unique key and content are required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const res = await saveCmsContentBlock({
      ...editingBlock,
      key: editingBlock.key?.trim().toLowerCase().replace(/\s+/g, '_')
    });

    setIsSaving(false);

    if (res.success && res.data) {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.key === res.data!.key);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = res.data!;
          return updated;
        }
        return [...prev, res.data!];
      });
      setIsModalOpen(false);
      setSuccessMessage(`Block "${res.data.key}" saved successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage('Failed to save content block. Please check the fields and try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!blockToDelete) return;
    setIsDeleting(true);

    const res = await deleteCmsContentBlock(blockToDelete.key);
    setIsDeleting(false);

    if (res.success) {
      setBlocks((prev) => prev.filter((b) => b.key !== blockToDelete.key));
      setSuccessMessage(`Block "${blockToDelete.key}" removed.`);
      setBlockToDelete(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      alert('Failed to delete content block.');
    }
  };

  const filteredBlocks = blocks.filter((b) => {
    const matchesSearch =
      searchTerm === '' ||
      b.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && b.is_published) ||
      (statusFilter === 'draft' && !b.is_published);

    const matchesCategory =
      categoryFilter === 'all' || b.block_type === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Page Content Manager"
        subtitle="Manage dynamic banners, homepage highlights, section narratives, and custom callout blocks."
        action={
          <Button
            size="sm"
            onClick={handleCreateNew}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Content Block
          </Button>
        }
      />

      <main className="p-6 sm:p-8 space-y-6 flex-grow max-w-7xl">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <AdminSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search content blocks by key, title, or body..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={[
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ]}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categoryOptions={BLOCK_TYPES}
          totalCount={blocks.length}
          filteredCount={filteredBlocks.length}
        />

        {/* Content Blocks List */}
        {filteredBlocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBlocks.map((block) => (
              <Card key={block.key} className="p-5 bg-white border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200/60 truncate">
                          {block.key}
                        </span>
                        <Badge variant="slate" size="sm">
                          {block.block_type}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{block.title}</h4>
                    </div>

                    <StatusBadge status={block.is_published ? 'published' : 'draft'} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 line-clamp-3 leading-relaxed">
                    {block.content}
                  </p>

                  {block.link_url && (
                    <div className="text-[11px] text-slate-400 truncate">
                      <strong>Link:</strong> <code>{block.link_url}</code> ({block.link_label || 'CTA'})
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Order: {block.display_order}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(block)}
                      icon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => setBlockToDelete(block)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      aria-label="Delete block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            icon={Blocks}
            title={searchTerm ? 'No Matching Content Blocks' : 'No Content Blocks Defined'}
            description={
              searchTerm
                ? 'Try adjusting your search query or reset the filters.'
                : 'Define dynamic announcements, hero highlights, or quote blocks to render across the portfolio.'
            }
            actionLabel="Add First Block"
            onAction={handleCreateNew}
          />
        )}
      </main>

      {/* Edit/Create Modal */}
      {isModalOpen && editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingBlock.key ? `Edit Block: ${editingBlock.key}` : 'Create New Content Block'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unique Block Key * (e.g. hero_announcement)
                </label>
                <input
                  type="text"
                  required
                  value={editingBlock.key || ''}
                  onChange={(e) => setEditingBlock({ ...editingBlock, key: e.target.value })}
                  placeholder="about_banner_quote"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Display Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBlock.title || ''}
                    onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                    placeholder="E.g. Spring 2026 Analytics Availability"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Block Type
                  </label>
                  <select
                    value={editingBlock.block_type || 'highlight'}
                    onChange={(e) => setEditingBlock({ ...editingBlock, block_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  >
                    {BLOCK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Body Content / Narrative *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingBlock.content || ''}
                  onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                  placeholder="Enter the textual body, highlight message, or quote text..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Callout Link URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingBlock.link_url || ''}
                    onChange={(e) => setEditingBlock({ ...editingBlock, link_url: e.target.value })}
                    placeholder="https://... or /projects"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Link Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingBlock.link_label || ''}
                    onChange={(e) => setEditingBlock({ ...editingBlock, link_label: e.target.value })}
                    placeholder="View Projects →"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingBlock.is_published !== false}
                    onChange={(e) => setEditingBlock({ ...editingBlock, is_published: e.target.checked })}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Published & Active on Portfolio</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSaving}
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    {isSaving ? 'Saving...' : 'Save Block'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={Boolean(blockToDelete)}
        title="Delete Content Block?"
        message={`Are you sure you want to delete the content block "${blockToDelete?.key}"? This action cannot be undone.`}
        confirmLabel="Delete Block"
        cancelLabel="Keep Block"
        variant="danger"
        isBusy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBlockToDelete(null)}
      />
    </div>
  );
}
