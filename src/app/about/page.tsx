import React from 'react';
import {
  GraduationCap,
  Target,
  Sparkles,
  TrendingUp,
  User,
  Github,
  Linkedin,
  Mail,
  Compass,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getProfile, getEducation, isValidExternalUrl } from '@/lib/services/portfolioService';

export default async function AboutPage() {
  const profile = await getProfile();
  const educationList = await getEducation();
  const edu = educationList[0];

  const hasGithub = isValidExternalUrl(profile.github_url);
  const hasLinkedin = isValidExternalUrl(profile.linkedin_url);

  return (
    <>
      <Header />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Top Hero / Intro Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Photograph placeholder */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[4/5] rounded-3xl bg-gradient-to-b from-slate-100 to-warm-100 border-2 border-dashed border-slate-300/80 p-6 flex flex-col items-center justify-center shadow-card text-center overflow-hidden">
                {profile.avatar_url && profile.avatar_url.trim() !== '' ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-28 h-28 rounded-full bg-white border border-slate-200/90 shadow-subtle flex items-center justify-center text-slate-400">
                      <User className="w-14 h-14 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
                        Profile Photograph Space
                      </span>
                      <h3 className="text-lg font-bold text-slate-800">
                        {profile.full_name}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        Placeholder for official profile portrait. Uploadable via Admin Dashboard.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Contact & Social Cards */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {hasGithub && (
                  <Button
                    variant="outline"
                    size="sm"
                    href={profile.github_url}
                    external
                    icon={<Github className="w-4 h-4" />}
                  >
                    GitHub
                  </Button>
                )}
                {hasLinkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    href={profile.linkedin_url}
                    external
                    icon={<Linkedin className="w-4 h-4 text-blue-600" />}
                  >
                    LinkedIn
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  href="/contact"
                  icon={<Mail className="w-4 h-4" />}
                >
                  Contact
                </Button>
              </div>
            </div>

            {/* Right: Narrative Story */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-3 py-1 rounded-full">
                  About Me
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
                  I&apos;m {profile.full_name}
                </h1>
                <p className="text-lg font-medium text-brand-700 mt-1">
                  Computer Science Student & Data Analyst Aspirant
                </p>
              </div>

              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-base leading-relaxed">
                <p>
                  I am a third-year undergraduate student specializing in{' '}
                  <strong className="text-slate-900 font-semibold">
                    {profile.specialization}
                  </strong>{' '}
                  at <strong className="text-slate-900 font-semibold">{profile.college}</strong>.
                </p>
                <p>
                  From my early coursework in database architectures and software engineering, I discovered a genuine enthusiasm for how data explains human behavior and business outcomes. While software systems build workflows, data analytics answers the critical &quot;why&quot;—why customer cohorts churn, why certain products drive margin, and where operational bottlenecks hide.
                </p>
                <p>
                  My career goal is to join a forward-thinking{' '}
                  <strong className="text-slate-900 font-semibold">product-based or fintech enterprise</strong>{' '}
                  as a Data Analyst. I love working with SQL to write clean, modular relational queries, Python for exploratory analysis, and Power BI to craft intuitive visual dashboards with minimal cognitive load.
                </p>
              </div>

              {/* Career Goal Callout */}
              <div className="bg-brand-50/70 border border-brand-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Primary Career Target
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {profile.career_goal}. Prepared to contribute with rigorous data verification, clean documentation, and measurable insights.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Education Breakdown */}
          {edu && (
            <section className="pt-8 border-t border-slate-200/70">
              <SectionHeader
                badge="Academics"
                title="Formal Education"
                description="Undergraduate academic curriculum and foundational computer science coursework."
              />

              <Card className="border-slate-200 p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {edu.institution}
                      </h3>
                      <p className="text-sm font-medium text-brand-700">
                        {edu.degree} in {edu.field_of_study}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right text-xs font-semibold text-slate-500">
                    <span className="block text-slate-900 text-sm">{edu.start_year} – {edu.end_year}</span>
                    <span>{edu.grade_or_status}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Key Coursework & Highlights
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                    {edu.highlights?.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </section>
          )}

          {/* Strengths, Work Style & Development Areas */}
          <section className="pt-8 border-t border-slate-200/70">
            <SectionHeader
              badge="Professional Profile"
              title="Strengths, Work Style & Ongoing Learning"
              description="A balanced, objective view of what I bring to an analytics team and where I am actively refining my skills."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Strengths */}
              <Card>
                <div className="flex items-center gap-3 mb-4 text-amber-700">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Key Strengths</h3>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  {profile.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Work Style */}
              <Card>
                <div className="flex items-center gap-3 mb-4 text-brand-700">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Working Style</h3>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  {profile.work_style.map((style, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                      <span>{style}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Growth Areas */}
              <Card>
                <div className="flex items-center gap-3 mb-4 text-emerald-700">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Areas for Growth</h3>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  {profile.areas_for_improvement.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
