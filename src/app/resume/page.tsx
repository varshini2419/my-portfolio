import React from 'react';
import {
  FileText,
  Download,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  getProfile,
  getEducation,
  getPublishedProjects,
  getSkillCategories,
  getExperience,
  isValidExternalUrl
} from '@/lib/services/portfolioService';

export default async function ResumePage() {
  const profile = await getProfile();
  const educationList = await getEducation();
  const projectsList = await getPublishedProjects();
  const skillCategoriesList = await getSkillCategories();
  const experienceList = await getExperience();

  const hasUploadedResume = Boolean(profile.resume_url && profile.resume_url.trim() !== '');
  const isResumeUrlValid = isValidExternalUrl(profile.resume_url);

  return (
    <>
      <Header />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            badge="Curriculum Vitae"
            title="Resume & Qualifications Preview"
            description="A structured overview of education, data analytics proficiencies, academic projects, and certifications. PDF download will activate once the official document is uploaded."
          />

          {/* Download & Status Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {profile.full_name} — Resume (Data Analyst)
                </h3>
                <p className="text-xs text-slate-500">
                  Target: 2025/2026 Data Analyst Internships & Roles
                </p>
              </div>
            </div>

            <div>
              {hasUploadedResume && isResumeUrlValid ? (
                <Button
                  variant="primary"
                  size="md"
                  href={profile.resume_url}
                  external
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Official PDF
                </Button>
              ) : (
                <div className="flex flex-col sm:items-end">
                  <Button
                    variant="outline"
                    size="md"
                    disabled
                    icon={<Download className="w-4 h-4" />}
                    title="Official PDF upload is pending"
                    className="opacity-75 cursor-not-allowed"
                  >
                    PDF Upload Pending
                  </Button>
                  <span className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    Upload via Admin Portal to activate live downloads
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Structured Resume Preview Canvas */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-12 space-y-10 font-sans">
            {/* Resume Header */}
            <div className="border-b border-slate-200 pb-8 text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profile.full_name}
              </h1>
              <p className="text-sm font-semibold text-brand-700">
                {profile.headline}
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-2">
                <span>{profile.location}</span>
                <span>•</span>
                <span>{profile.email}</span>
                <span>•</span>
                {profile.github_url && (
                  <>
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      GitHub
                    </a>
                    <span>•</span>
                  </>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Resume Section 1: Objective & Summary */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Professional Summary
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Resume Section 2: Education */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                Education
              </h2>
              {educationList.map((edu) => (
                <div key={edu.id} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                    <span className="font-bold text-slate-900">{edu.institution}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {edu.start_year} – {edu.end_year}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-brand-700 font-semibold">
                    <span>{edu.degree} in {edu.field_of_study}</span>
                    <span className="text-slate-500 font-normal">{edu.grade_or_status}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 pt-1">
                    {edu.highlights?.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Resume Section 3: Technical Skills */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                Technical Competencies
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {skillCategoriesList.slice(0, 4).map((cat) => (
                  <div key={cat.name}>
                    <span className="font-bold text-slate-800 block mb-1">
                      {cat.name}:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {cat.skills.map((s) => s.name).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Section 4: Academic & Analytical Projects */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" />
                Selected Analytics Projects
              </h2>
              <div className="space-y-4">
                {projectsList.slice(0, 3).map((proj) => (
                  <div key={proj.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900">{proj.title}</span>
                      <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {proj.category}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{proj.short_description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Section 5: Experience */}
            {experienceList.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  Experience & Lab Projects
                </h2>
                <div className="space-y-3">
                  {experienceList.map((exp) => (
                    <div key={exp.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-900">{exp.role}</span>
                        <span className="text-xs text-slate-500">{exp.start_date} – {exp.end_date || 'Present'}</span>
                      </div>
                      <p className="font-semibold text-brand-700">{exp.organization}</p>
                      <p className="text-slate-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
