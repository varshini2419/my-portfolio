'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { uploadCmsFile } from '@/lib/services/cmsService';
import { Button } from '@/components/ui/Button';

export interface FileUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  helperText?: string;
  placeholder?: string;
  compact?: boolean;
  autoRegisterInMedia?: boolean;
  onUploadedInfo?: (info: { name: string; size: string; type: string; url: string }) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value = '',
  onChange,
  accept = 'image/*,application/pdf,video/*',
  helperText,
  placeholder = 'Paste URL or browse / drop a file to upload...',
  compact = false,
  autoRegisterInMedia = true,
  onUploadedInfo
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = value && (
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value) ||
    value.includes('images.unsplash.com') ||
    value.startsWith('data:image/')
  );

  const isPdf = value && (
    /\.pdf(\?.*)?$/i.test(value) ||
    value.includes('pdf') ||
    value.startsWith('data:application/pdf')
  );

  const isVideo = value && (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(value) ||
    value.includes('youtube') ||
    value.includes('vimeo')
  );

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const res = await uploadCmsFile(file, autoRegisterInMedia);

    setIsUploading(false);

    if (res.success && res.url) {
      onChange(res.url);
      setUploadSuccess(`Uploaded "${file.name}" successfully!`);
      if (onUploadedInfo) {
        onUploadedInfo({
          name: file.name,
          size: res.size || 'Unknown',
          type: res.type || 'image',
          url: res.url
        });
      }
      setTimeout(() => setUploadSuccess(null), 4000);
    } else {
      setUploadError(res.error || 'Failed to upload file.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">{label}</label>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-rose-500 hover:text-rose-700 font-medium"
            >
              Clear file
            </button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Drop / Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl transition-all ${
          isDragOver
            ? 'border-brand-500 bg-brand-50/50 scale-[1.005]'
            : 'border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 hover:border-brand-300'
        } ${compact ? 'p-3' : 'p-4'}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 text-brand-600">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <div className="text-left flex-grow">
              <div className="text-xs font-bold text-slate-800">
                {isUploading ? 'Uploading file...' : 'Choose a file or drag & drop here'}
              </div>
              <div className="text-[11px] text-slate-400">
                {accept.includes('pdf') && !accept.includes('image')
                  ? 'Accepts PDF documents up to 25MB'
                  : accept.includes('image') && !accept.includes('pdf')
                  ? 'Accepts PNG, JPG, WebP, SVG screenshots & graphics'
                  : 'Accepts Images, PDFs, and Video files'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                  <span>Browse File</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Feedback alerts */}
        {uploadSuccess && (
          <div className="mt-2.5 p-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-2.5 p-2 px-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Manual URL input fallback */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <LinkIcon className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-slate-700"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}

      {/* Preview Section if a file URL is populated */}
      {value && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {isImage ? (
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : isPdf ? (
              <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                <FileText className="w-6 h-6" />
              </div>
            ) : isVideo ? (
              <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 text-purple-600">
                <Video className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}

            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-800 block truncate" title={value}>
                {value.split('/').pop() || 'Uploaded Resource'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate block">
                {value}
              </span>
            </div>
          </div>

          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
