'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  Search,
  CheckCircle2,
  X,
  Save,
  UploadCloud
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/admin/FileUpload';
import {
  MediaAsset,
  getCmsMediaAssets,
  saveCmsMediaAsset,
  deleteCmsMediaAsset
} from '@/lib/services/cmsService';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'pdf' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Asset Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetType, setNewAssetType] = useState<'image' | 'pdf' | 'video'>('image');
  const [newAssetSize, setNewAssetSize] = useState('350 KB');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete modal
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCmsMediaAssets();
      setAssets(data);
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

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        !searchQuery.trim() ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [assets, searchQuery, typeFilter]);

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetUrl.trim()) return;

    setIsSaving(true);
    await saveCmsMediaAsset({
      name: newAssetName.trim(),
      url: newAssetUrl.trim(),
      type: newAssetType,
      size: newAssetSize.trim() || '200 KB'
    });

    setIsSaving(false);
    setSuccessMessage(`Asset "${newAssetName}" registered in media library.`);
    setIsAddModalOpen(false);
    setNewAssetName('');
    setNewAssetUrl('');
    loadData();
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    await deleteCmsMediaAsset(assetToDelete.id);
    setSuccessMessage(`Asset deleted.`);
    setAssetToDelete(null);
    loadData();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Media Library & Uploads"
        subtitle="Upload and manage image screenshots, dashboards, PDFs, and video references."
      />

      <main className="p-6 sm:p-8 max-w-6xl space-y-6 flex-grow">
        {/* Feedback Alert */}
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

        {/* Quick Upload Dropzone Banner */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">Direct File Upload</h3>
            </div>
            <span className="text-xs text-slate-400">Uploads are saved directly to server and indexed in media library</span>
          </div>

          <FileUpload
            placeholder="Select or drop any image, chart, PDF, or video file to upload directly..."
            onChange={() => loadData()}
            onUploadedInfo={(info) => {
              setSuccessMessage(`File "${info.name}" uploaded and saved to Media Library.`);
              loadData();
              setTimeout(() => setSuccessMessage(null), 4000);
            }}
          />
        </div>

        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 flex-grow">
            {/* Search */}
            <div className="relative min-w-[220px] flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search file name or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Type Filter Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                All ({assets.length})
              </button>
              <button
                onClick={() => setTypeFilter('image')}
                className={`px-3 py-1 rounded-lg transition-colors ${typeFilter === 'image' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Images
              </button>
              <button
                onClick={() => setTypeFilter('pdf')}
                className={`px-3 py-1 rounded-lg transition-colors ${typeFilter === 'pdf' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                PDFs
              </button>
              <button
                onClick={() => setTypeFilter('video')}
                className={`px-3 py-1 rounded-lg transition-colors ${typeFilter === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Videos
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add / Link Asset
          </Button>
        </div>

        {/* Assets Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading media assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Media Assets Found</h4>
            <p className="text-xs text-slate-500">Upload or add an image, document, or screenshot URL to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} padding="none" className="overflow-hidden bg-white flex flex-col justify-between group hover:border-brand-200 transition-all">
                {/* Media Preview Box */}
                <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : asset.type === 'pdf' ? (
                    <div className="flex flex-col items-center justify-center text-rose-500 space-y-1">
                      <FileText className="w-12 h-12" />
                      <span className="text-xs font-bold text-slate-700">PDF Document</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-purple-600 space-y-1">
                      <Video className="w-12 h-12" />
                      <span className="text-xs font-bold text-slate-700">Video Asset</span>
                    </div>
                  )}

                  <Badge variant="slate" size="sm" className="absolute top-3 left-3 shadow-xs">
                    {asset.type.toUpperCase()}
                  </Badge>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                      {asset.name}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{asset.size || '350 KB'}</span>
                      <span>{asset.uploaded_at}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                        copiedId === asset.id
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-brand-600 hover:bg-brand-50'
                      }`}
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                        title="Open asset"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setAssetToDelete(asset)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add / Link Media Asset */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-brand-600" />
                  <span>Upload or Link Media Asset</span>
                </h4>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAsset} className="space-y-4">
                {/* File Upload Component */}
                <FileUpload
                  label="Upload from Computer or Paste URL *"
                  value={newAssetUrl}
                  onChange={(url) => {
                    setNewAssetUrl(url);
                    if (!newAssetName) {
                      setNewAssetName(url.split('/').pop() || 'uploaded-file');
                    }
                  }}
                  onUploadedInfo={(info) => {
                    setNewAssetName(info.name);
                    setNewAssetSize(info.size);
                    setNewAssetType(info.type as any);
                  }}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display File Name *</label>
                  <input
                    type="text"
                    required
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    placeholder="e.g. powerbi-retail-churn-kpis.png"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Asset Type</label>
                    <select
                      value={newAssetType}
                      onChange={(e) => setNewAssetType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    >
                      <option value="image">Image (PNG, JPG, WebP)</option>
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Size</label>
                    <input
                      type="text"
                      value={newAssetSize}
                      onChange={(e) => setNewAssetSize(e.target.value)}
                      placeholder="e.g. 450 KB"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} disabled={isSaving || !newAssetUrl}>
                    {isSaving ? 'Registering...' : 'Save Asset'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {assetToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Delete Asset</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{assetToDelete.name}</strong> from your media library?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setAssetToDelete(null)}>Cancel</Button>
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
