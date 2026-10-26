'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Mail,
  Phone,
  Linkedin,
  Github,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ContactLinkSettings,
  getCmsContactLinks,
  saveCmsContactLinks
} from '@/lib/services/cmsService';

export default function AdminContactLinksPage() {
  const [links, setLinks] = useState<ContactLinkSettings>({
    email: '',
    email_visible: true,
    phone: '',
    phone_visible: false,
    linkedin_url: '',
    linkedin_visible: true,
    github_url: '',
    github_visible: true,
    twitter_url: '',
    location: '',
    location_visible: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getCmsContactLinks();
        setLinks(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await saveCmsContactLinks(links);
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage('Contact details and visibility rules saved successfully!');
      if (res.data) setLinks(res.data);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Contact & Social Channels"
        subtitle="Manage professional email, social profiles, and public visibility controls."
      />

      <main className="p-6 sm:p-8 max-w-4xl space-y-6 flex-grow">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 bg-white">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-brand-600" />
                  <span>Public Contact Channels & Privacy</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toggle individual visibility switches to control what appears in the footer and contact page.
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-600" />
                  <span>Professional Email Address</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={links.email_visible}
                    onChange={(e) => setLinks({ ...links, email_visible: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span>Show on public site</span>
                </label>
              </div>
              <input
                type="email"
                required
                value={links.email}
                onChange={(e) => setLinks({ ...links, email: e.target.value })}
                placeholder="maddalavarshini@example.com"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            {/* Phone */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Phone Number (Optional)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={links.phone_visible}
                    onChange={(e) => setLinks({ ...links, phone_visible: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span>Show on public site</span>
                </label>
              </div>
              <input
                type="tel"
                value={links.phone || ''}
                onChange={(e) => setLinks({ ...links, phone: e.target.value })}
                placeholder="+91 (Optional)"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            {/* LinkedIn */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  <span>LinkedIn Profile URL</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={links.linkedin_visible}
                    onChange={(e) => setLinks({ ...links, linkedin_visible: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span>Show on public site</span>
                </label>
              </div>
              <input
                type="url"
                value={links.linkedin_url}
                onChange={(e) => setLinks({ ...links, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/maddala-varshini"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            {/* GitHub */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-800" />
                  <span>GitHub Profile URL</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={links.github_visible}
                    onChange={(e) => setLinks({ ...links, github_visible: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span>Show on public site</span>
                </label>
              </div>
              <input
                type="url"
                value={links.github_url}
                onChange={(e) => setLinks({ ...links, github_url: e.target.value })}
                placeholder="https://github.com/maddalavarshini"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            {/* Location */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>College Campus / Location</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={links.location_visible}
                    onChange={(e) => setLinks({ ...links, location_visible: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span>Show on public site</span>
                </label>
              </div>
              <input
                type="text"
                value={links.location}
                onChange={(e) => setLinks({ ...links, location: e.target.value })}
                placeholder="SRKR Engineering College, Bhimavaram, India"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </Card>

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Contact Settings'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
