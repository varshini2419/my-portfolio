import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Award,
  Briefcase,
  Database,
  BarChart2,
  Code
} from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCard } from '@/components/public/ProjectCard';
import {
  getProfile,
  getPublishedProjects,
  getSkillCategories,
  getCertifications,
  getExperience,
  isValidExternalUrl
} from '@/lib/services/portfolioService';

export default async function HomePage() {
  const profile = await getProfile();
  const allProjects = await getPublishedProjects();
  const featuredProjects = allProjects.filter((p) => p.featured);
  const categories = await getSkillCategories();
  const coreSkillBuckets = categories.slice(0, 4);
  const certifications = await getCertifications();
  const experienceList = await getExperience();

  const hasGithub = isValidExternalUrl(profile.github_url);
  const hasLinkedin = isValidExternalUrl(profile.linkedin_url);

  return (
    <>
      <Header />

      <main className="flex-grow">
        {/* =========================================================================
            1. HERO SECTION
        ========================================================================= */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Subtle soft blue and navy ambient blur */}
          <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-[#DBE2EF]/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 -z-10 w-72 h-72 bg-[#DBE2EF]/25 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Introduction & Call to Action */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                  <span>3rd Year B.Tech Student & Data Analyst Aspirant</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                    Hi, I&apos;m{' '}
                    <span className="text-brand-600 underline decoration-brand-200 underline-offset-8">
                      {profile.full_name}
                    </span>
                  </h1>
                  <p className="text-xl sm:text-2xl font-medium text-slate-700">
                    Transforming raw data into clear business narratives.
                  </p>
                </div>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Specializing in Computer Science &amp; Information Technology at SRKR Engineering College, I’m building hands-on expertise in SQL, Python-based exploratory data analysis, and Power BI dashboards. I focus on real-time problem-solving, transforming raw data into actionable insights to identify business trends and support data-driven decisions in product-based and fintech companies. worked i worked in real time projects{' '}
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    href="/projects"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    View My Projects
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    href="/resume"
                    icon={<FileText className="w-4 h-4" />}
                  >
                    View Resume
                  </Button>
                </div>

                {/* Quick Social & Contact Bar */}
                <div className="pt-4 flex items-center gap-4 text-sm text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Connect:
                  </span>
                  {hasGithub && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-subtle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      aria-label="GitHub Profile"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {hasLinkedin && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-white hover:shadow-subtle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      aria-label="LinkedIn Profile"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  <Link
                    href="/contact"
                    className="p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-white hover:shadow-subtle transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    aria-label="Contact Page"
                  >
                    <Mail className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Dedicated Profile Photograph Container */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl bg-gradient-to-b from-slate-100 to-warm-100 border-2 border-dashed border-slate-300/80 p-4 flex flex-col items-center justify-center shadow-card text-center overflow-hidden">
                  {profile.avatar_url && profile.avatar_url.trim() !== '' ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center p-6 space-y-4">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border border-slate-200/90 shadow-subtle flex items-center justify-center text-slate-400">
                        <User className="w-12 h-12 stroke-[1.5]" />
                      </div>
                      <div className="space-y-1">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
                          Dedicated Portrait Placeholder
                        </span>
                        <h4 className="text-base font-bold text-slate-800">
                          {profile.full_name}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                          Official photograph space. Uploadable securely via Admin Dashboard.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Corner Accent Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-3 shadow-sm text-left flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 border border-brand-200/60 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900 block">
                        Targeting 2025/2026 Opportunities
                      </span>
                      <span className="text-slate-500">
                        Product & Fintech Analytics Internships
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. ABOUT PREVIEW SECTION
        ========================================================================= */}
        <section className="py-16 sm:py-20 bg-white border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="About Me"
              title="Academic Foundation & Career Ambition"
              description="A clear, honest snapshot of my engineering education, core strengths, and ongoing learning path."
              actionLink={{ href: '/about', label: 'Read Full Story' }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Card 1: Academic Background */}
              <Card className="flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {profile.college}
                  </h3>
                  <p className="text-sm font-semibold text-brand-700 mb-3">
                    {profile.degree} in {profile.specialization}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Currently in {profile.year_of_study}. Grounded in relational database architectures, data structures, algorithms, and applied data analytics.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-6 text-xs text-slate-500">
                  Location: {profile.location}
                </div>
              </Card>

              {/* Card 2: Core Strengths */}
              <Card className="flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Core Strengths
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {profile.strengths.slice(0, 3).map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-6 text-xs text-slate-500">
                  Focus: Accuracy & Business Impact
                </div>
              </Card>

              {/* Card 3: Growth & Improving Areas */}
              <Card className="flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 mb-4">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Active Growth Goals
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {profile.areas_for_improvement.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-6 text-xs text-slate-500">
                  Target: Continuous Practical Skill Building
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. FEATURED PROJECTS SECTION
        ========================================================================= */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="Portfolio Work"
              title="Featured Analytical Projects"
              description="Real-world simulated case studies examining customer retention, retail margin trends, and warehouse supply chain bottlenecks."
              actionLink={{ href: '/projects', label: 'View All Projects' }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. SKILLS & TECHNOLOGIES PREVIEW
        ========================================================================= */}
        <section className="py-16 sm:py-20 bg-white border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="Competencies"
              title="Skills, Tools & Technologies"
              description="A clear inventory of verified tools and analytics competencies without arbitrary percentage bars."
              actionLink={{ href: '/skills', label: 'Explore Full Skill Matrix' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreSkillBuckets.map((bucket) => (
                <Card key={bucket.name} className="flex flex-col h-full">
                  <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    {bucket.name === 'Data Analysis' && <Database className="w-4 h-4 text-brand-600" />}
                    {bucket.name === 'Data Visualization' && <BarChart2 className="w-4 h-4 text-amber-600" />}
                    {bucket.name === 'Programming' && <Code className="w-4 h-4 text-emerald-600" />}
                    {bucket.name === 'Databases & SQL' && <Database className="w-4 h-4 text-blue-600" />}
                    <span>{bucket.name}</span>
                  </h3>
                  <ul className="space-y-3 flex-grow">
                    {bucket.skills.map((skill) => (
                      <li key={skill.name} className="text-xs">
                        <span className="font-semibold text-slate-800 block">
                          {skill.name}
                        </span>
                        {skill.description && (
                          <span className="text-slate-500 block text-[11px] mt-0.5">
                            {skill.description}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. COMPACT SNAPSHOTS: CERTIFICATIONS & EXPERIENCE
        ========================================================================= */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Certifications Snapshot */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900">Certifications</h3>
                  </div>
                  <Link
                    href="/certifications"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {certifications.slice(0, 2).map((cert) => (
                    <Card key={cert.id} padding="sm" className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{cert.issuer}</span>
                        <span>{cert.issue_date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {cert.title}
                      </h4>
                      <Badge
                        variant={cert.status === 'completed' ? 'green' : 'amber'}
                        size="sm"
                      >
                        {cert.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Experience Snapshot */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900">Experience</h3>
                  </div>
                  <Link
                    href="/experience"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Timeline →
                  </Link>
                </div>
                <div className="space-y-3">
                  {experienceList.slice(0, 2).map((exp) => (
                    <Card key={exp.id} padding="sm" className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-brand-700">{exp.role}</span>
                        <span>{exp.start_date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {exp.organization}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {exp.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. CALL TO ACTION & CONTACT CTA
        ========================================================================= */}
        <section className="py-16 sm:py-20 bg-[#DBE2EF]/30 border-t border-[#DBE2EF]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#112D4E] bg-white border border-[#DBE2EF] rounded-full shadow-xs">
              Let&apos;s Connect
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Open to Data Analytics Internships & Roles
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Looking for a dedicated analyst who loves digging into numbers and translating them into clear business actions? I&apos;d love to connect.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                href="/contact"
                icon={<Mail className="w-4 h-4" />}
              >
                Get in Touch
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="/resume"
                icon={<FileText className="w-4 h-4" />}
              >
                Review Resume
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
