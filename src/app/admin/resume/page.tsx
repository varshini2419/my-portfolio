'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Save,
  Clock,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Profile, emptyProfile } from '@/types';
import { getCmsProfile, saveCmsProfile } from '@/lib/services/cmsService';

export default function AdminResumePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeNote, setResumeNote] = useState('');
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const p = await getCmsProfile();
      setProfile(p);
      setResumeUrl(p.resume_url || '');
    }
    loadData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const res = await saveCmsProfile({
      resume_url: resumeUrl.trim()
    });

    setIsSaving(false);
    if (res.success) {
      setSuccessMessage('Resume configuration updated successfully! Public /resume page updated.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to update resume configuration.');
    }
  };

  const hasResume = Boolean(resumeUrl && resumeUrl.trim() !== '');

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Resume Document Management"
        subtitle="Manage, upload, or replace your official consolidated resume PDF."
      />

      <main className="p-6 sm:p-8 max-w-4xl space-y-6 flex-grow">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-400/80 text-brand-700 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Current Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="sm" className="bg-white">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Document Status</span>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={hasResume ? 'green' : 'amber'} size="sm">
                {hasResume ? 'Active Live PDF' : 'Honest Placeholder Active'}
              </Badge>
            </div>
          </Card>

          <Card padding="sm" className="bg-white">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Role</span>
            <span className="text-sm font-bold text-slate-800 block mt-1 truncate">
              {profile.career_goal || 'Data Analyst'}
            </span>
          </Card>

          <Card padding="sm" className="bg-white">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Owner</span>
            <span className="text-sm font-bold text-slate-800 block mt-1 truncate">
              {profile.full_name}
            </span>
          </Card>
        </div>

        {/* Configuration Form */}
        <Card className="p-6 sm:p-8 space-y-6 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">Resume PDF Document & Upload</h3>
            </div>
            {hasResume && (
              <Button
                variant="outline"
                size="sm"
                href={resumeUrl}
                external
                icon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                View PDF in New Tab
              </Button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Direct Upload Component */}
            <FileUpload
              label="Official Resume PDF (Upload from your Computer or enter URL) *"
              value={resumeUrl}
              accept=".pdf,application/pdf"
              onChange={(url) => setResumeUrl(url)}
              helperText="Upload your official resume PDF directly. It will be immediately available on the public /resume page for recruiters to view and download."
              onUploadedInfo={(info) => {
                setSuccessMessage(`Resume "${info.name}" uploaded successfully! Don't forget to click Save below.`);
                setTimeout(() => setSuccessMessage(null), 4000);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Revision / Last Updated Label</label>
                <input
                  type="text"
                  value={lastUpdatedDate}
                  onChange={(e) => setLastUpdatedDate(e.target.value)}
                  placeholder="e.g. Spring 2026 / Updated Q1"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Recruiter Note / Summary</label>
                <input
                  type="text"
                  value={resumeNote}
                  onChange={(e) => setResumeNote(e.target.value)}
                  placeholder="Consolidated Data Analyst Resume..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                {isSaving ? 'Saving...' : 'Save Resume Settings'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
