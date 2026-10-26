'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Tag,
  Plus,
  MinusCircle,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileUpload } from '@/components/admin/FileUpload';
import { Profile, emptyProfile } from '@/types';
import { getCmsProfile, saveCmsProfile } from '@/lib/services/cmsService';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New item inputs for strengths and growth areas
  const [newStrength, setNewStrength] = useState('');
  const [newGrowth, setNewGrowth] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const data = await getCmsProfile();
        setProfile(data);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const res = await saveCmsProfile(profile);
    setIsSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      if (res.data) setProfile(res.data);
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to save profile changes.');
    }
  };

  const addStrength = () => {
    if (!newStrength.trim()) return;
    const current = profile.strengths || [];
    setProfile({ ...profile, strengths: [...current, newStrength.trim()] });
    setNewStrength('');
  };

  const removeStrength = (index: number) => {
    const current = profile.strengths || [];
    setProfile({ ...profile, strengths: current.filter((_, i) => i !== index) });
  };

  const addGrowth = () => {
    if (!newGrowth.trim()) return;
    const current = profile.growth_areas || profile.areas_for_improvement || [];
    const updated = [...current, newGrowth.trim()];
    setProfile({ ...profile, growth_areas: updated, areas_for_improvement: updated });
    setNewGrowth('');
  };

  const removeGrowth = (index: number) => {
    const current = profile.growth_areas || profile.areas_for_improvement || [];
    const updated = current.filter((_, i) => i !== index);
    setProfile({ ...profile, growth_areas: updated, areas_for_improvement: updated });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title="Profile & About Management"
        subtitle="Manage your personal background, education credentials, career targets, and profile portrait."
      />

      <main className="p-6 sm:p-8 max-w-5xl space-y-8 flex-grow">
        {/* Status Alerts */}
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-400/80 text-brand-700 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Profile and biography updated successfully! Changes are live across public pages.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Portrait & Profile Photo */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Dedicated Portrait Photograph</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-36 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 shadow-inner">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-3">
                    <User className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                    <span className="text-[10px] text-slate-400 block mt-1">Placeholder</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-center sm:text-left flex-grow">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Profile Portrait Photo (Upload or Link)
                  </h4>
                  <p className="text-xs text-slate-500 max-w-lg leading-relaxed mt-0.5">
                    Upload your professional headshot portrait directly from your device (recommended 800×1000px, PNG/JPG/WebP).
                  </p>
                </div>

                <FileUpload
                  value={profile.avatar_url || ''}
                  accept="image/*"
                  compact
                  placeholder="Drop headshot image or paste URL..."
                  onChange={(url) => setProfile({ ...profile, avatar_url: url })}
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Personal & Academic Credentials */}
          <Card className="p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-600" />
              <span>Identity & Academic Background</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Preferred / Display Name
                </label>
                <input
                  type="text"
                  value={profile.preferred_name || ''}
                  onChange={(e) => setProfile({ ...profile, preferred_name: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hero Headline (Tagline) *
              </label>
              <input
                type="text"
                required
                value={profile.headline || ''}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  College / University *
                </label>
                <input
                  type="text"
                  required
                  value={profile.college || ''}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Degree
                </label>
                <input
                  type="text"
                  value={profile.degree || ''}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Branch / Specialization
                </label>
                <input
                  type="text"
                  value={profile.specialization || ''}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                Target Career Goal *
              </label>
              <input
                type="text"
                required
                value={profile.career_goal || ''}
                onChange={(e) => setProfile({ ...profile, career_goal: e.target.value })}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Professional Biography Narrative
              </label>
              <textarea
                rows={5}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>
          </Card>

          {/* Section 3: Core Strengths & Growth Areas */}
          <Card className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Core Strengths & Continuous Growth</span>
            </h3>

            {/* Strengths */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Core Strengths (Badges on About Page)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.strengths?.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => removeStrength(idx)}
                      className="text-emerald-500 hover:text-rose-600"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addStrength();
                    }
                  }}
                  placeholder="e.g. Statistical Analysis & Hypothesis Testing"
                  className="flex-grow px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button type="button" variant="outline" size="sm" onClick={addStrength} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add
                </Button>
              </div>
            </div>

            {/* Growth Areas */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Current Growth & Learning Areas
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(profile.growth_areas || profile.areas_for_improvement || []).map((g, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-800 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => removeGrowth(idx)}
                      className="text-brand-500 hover:text-rose-600"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newGrowth}
                  onChange={(e) => setNewGrowth(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addGrowth();
                    }
                  }}
                  placeholder="e.g. Advanced DAX & Dimensional Data Modeling"
                  className="flex-grow px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button type="button" variant="outline" size="sm" onClick={addGrowth} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add
                </Button>
              </div>
            </div>
          </Card>

          {/* Section 4: Contact & Social Handles */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-brand-600" />
              <span>Social & Contact Profile Links</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-700" />
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={profile.github_url || ''}
                  onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={profile.linkedin_url || ''}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </Card>

          {/* Sticky Save Button */}
          <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-lg">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
