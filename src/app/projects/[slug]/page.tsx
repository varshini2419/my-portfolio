import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  HelpCircle,
  Database,
  BarChart,
  CheckCircle2,
  Video,
  Layers,
  ArrowRight,
  Target,
  Sparkles,
  FileSpreadsheet,
  Film
} from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getPublishedProjects,
  getProjectBySlug,
  getRelatedProjects,
  formatVideoEmbedUrl,
  isValidExternalUrl
} from '@/lib/services/portfolioService';

interface ProjectDetailPageProps {
  params: {
    slug: string;
  };
}

// Generate static routes only for published projects
export async function generateStaticParams() {
  const publishedProjects = await getPublishedProjects();
  return publishedProjects.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await getProjectBySlug(params.slug);

  // Security guard: If project does not exist OR is unpublished/draft, render not-found page
  if (!project) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(project);
  const hasGithub = isValidExternalUrl(project.github_url);
  const hasLiveDemo = isValidExternalUrl(project.live_demo_url);
  const hasDemoVideos = Boolean(project.demo_videos && project.demo_videos.length > 0);

  return (
    <>
      <Header />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Breadcrumb & Category Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#3F72AF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] rounded p-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Projects Gallery</span>
            </Link>
            <Badge variant="blue" size="md">
              {project.category}
            </Badge>
          </div>

          {/* 1. Project Title & 2. Short Summary */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {project.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl">
              {project.short_description}
            </p>

            {/* 8. Tools & Technologies Tags and Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/70">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="slate">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons: Only show when resources exist */}
              <div className="flex flex-wrap items-center gap-3">
                {hasGithub && (
                  <Button
                    variant="outline"
                    size="sm"
                    href={project.github_url}
                    external
                    icon={<Github className="w-4 h-4" />}
                  >
                    GitHub Repository
                  </Button>
                )}
                {hasLiveDemo && (
                  <Button
                    variant="primary"
                    size="sm"
                    href={project.live_demo_url}
                    external
                    icon={<ExternalLink className="w-4 h-4" />}
                  >
                    Live Demo
                  </Button>
                )}
                {hasDemoVideos && (
                  <Button
                    variant="secondary"
                    size="sm"
                    href="#project-demo-video"
                    icon={<Video className="w-4 h-4" />}
                  >
                    Watch Demo
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Hero Image / Thumbnail */}
          <div className="relative w-full aspect-[16/9] rounded-3xl bg-slate-100 border border-slate-200/90 overflow-hidden flex flex-col items-center justify-center p-8 text-center shadow-card">
            {project.thumbnail_url && project.thumbnail_url.trim() !== '' ? (
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="space-y-3 max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-subtle border border-slate-200/80 mx-auto flex items-center justify-center text-brand-600">
                  <BarChart className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Case Study Visual Artifact
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Placeholder for primary dashboard capture or data flow architecture. Official screenshot uploadable via Admin Console.
                </p>
              </div>
            )}
          </div>

          {/* Main Case Study Analysis Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Core Methodology, Objectives & Findings */}
            <div className="lg:col-span-2 space-y-8">
              {/* 4. Problem Statement */}
              {project.problem_statement && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
                    Problem Statement & Context
                  </h2>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle text-sm sm:text-base text-slate-600 leading-relaxed">
                    {project.problem_statement}
                  </div>
                </section>
              )}

              {/* 5. Business Objective */}
              {project.business_objective && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-600" />
                    Business Objective
                  </h2>
                  <div className="bg-brand-50/50 border border-brand-100 p-6 rounded-2xl text-sm sm:text-base text-slate-700 leading-relaxed">
                    {project.business_objective}
                  </div>
                </section>
              )}

              {/* 6. Questions Addressed */}
              {project.business_questions && project.business_questions.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                    Key Business Questions Addressed
                  </h2>
                  <Card className="space-y-3.5 p-6">
                    {project.business_questions.map((q, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="font-bold text-brand-600 shrink-0">0{idx + 1}.</span>
                        <span className="leading-relaxed">{q}</span>
                      </div>
                    ))}
                  </Card>
                </section>
              )}

              {/* 9. Data-Cleaning Process */}
              {project.data_cleaning_process && project.data_cleaning_process.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    Data Cleaning & Validation Process
                  </h2>
                  <div className="space-y-2.5">
                    {project.data_cleaning_process.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-xl border border-slate-200/70 text-sm text-slate-600 flex items-start gap-3 shadow-subtle"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 10. Methodology and Analysis */}
              {project.methodology && project.methodology.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-600" />
                    Methodology & Analytical Pipeline
                  </h2>
                  <div className="space-y-2.5">
                    {project.methodology.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-xl border border-slate-200/70 text-sm text-slate-600 flex items-start gap-3 shadow-subtle"
                      >
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 11. Key Findings */}
              {project.key_findings && project.key_findings.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    Key Analytical Findings
                  </h2>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 space-y-3.5">
                    {project.key_findings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-emerald-950">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0" />
                        <span className="leading-relaxed font-medium">{finding}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 12. Recommendations / Conclusions */}
              {project.recommendations && project.recommendations.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-600" />
                    Business Recommendations & Conclusions
                  </h2>
                  <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-6 space-y-3">
                    {project.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                        <span className="font-bold text-amber-700 shrink-0">→</span>
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 13. Dashboard Screenshots Gallery */}
              {project.screenshots && project.screenshots.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-brand-600" />
                    Dashboard Screenshots
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.screenshots.map((shot, idx) => {
                      const shotUrl = typeof shot === 'string' ? shot : shot.url;
                      return (
                        <div key={idx} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                          <img src={shotUrl} alt={`${project.title} screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 14. Project Demonstration Video (Supports 1 or 2 videos with separate titles & controls) */}
              <section id="project-demo-video" className="space-y-6 pt-4 border-t border-slate-200/70">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-brand-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Project Demonstration Video Walkthrough
                  </h2>
                </div>

                {project.demo_videos && project.demo_videos.length > 0 ? (
                  <div className="space-y-6">
                    {project.demo_videos.map((vid, idx) => {
                      const embedUrl = formatVideoEmbedUrl(vid.url);
                      return (
                        <Card key={idx} padding="none" className="overflow-hidden border-slate-200">
                          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800">
                              Video {idx + 1}: {vid.title}
                            </span>
                            {vid.duration && (
                              <span className="text-xs text-slate-500 font-medium">
                                Duration: {vid.duration}
                              </span>
                            )}
                          </div>

                          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                            {embedUrl ? (
                              <iframe
                                src={embedUrl}
                                title={vid.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <div className="text-center p-8 text-slate-400 space-y-2">
                                <Film className="w-10 h-10 mx-auto opacity-70 text-brand-400" />
                                <h4 className="text-sm font-semibold text-white">
                                  {vid.title} (Upload Pending)
                                </h4>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                  Demonstration recording prepared for YouTube / direct embed via Admin Console.
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-300">
                    <Video className="w-10 h-10 text-brand-400 mb-2 opacity-70" />
                    <h4 className="text-sm font-semibold text-white">Video Demonstration Area</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Ready to host demonstration walkthroughs (YouTube embed or direct video file) configured through the Admin Console.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Metadata Sidebar */}
            <div className="space-y-6">
              {/* 7. Dataset Description */}
              <Card>
                <div className="flex items-center gap-2 mb-3 text-brand-700">
                  <Database className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Dataset Details
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {project.dataset_description || 'Synthesized multi-attribute dataset formatted for relational analysis.'}
                </p>
              </Card>

              {/* Technologies Used */}
              <Card>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="slate" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Author & Student Attribution */}
              <Card className="bg-slate-50/70 border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Analyst & Author
                </span>
                <p className="text-sm font-bold text-slate-900">Maddala Varshini</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  3rd Year B.Tech Computer Science & IT, SRKR Engineering College
                </p>
              </Card>

              {/* Quick Actions Panel */}
              <Card className="p-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  href="/projects"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="w-full justify-center"
                >
                  Back to Projects Gallery
                </Button>
                {hasGithub && (
                  <Button
                    variant="ghost"
                    size="sm"
                    href={project.github_url}
                    external
                    icon={<Github className="w-4 h-4" />}
                    className="w-full justify-center text-xs"
                  >
                    View Source Code
                  </Button>
                )}
              </Card>
            </div>
          </div>

          {/* 17. Related Projects */}
          {relatedProjects.length > 0 && (
            <div className="pt-12 border-t border-slate-200/70 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  Explore Related Case Studies
                </h3>
                <Link
                  href="/projects"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View All Projects →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedProjects.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/projects/${rel.slug}`}
                    className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-card transition-all"
                  >
                    <Badge variant="slate" size="sm" className="mb-2">
                      {rel.category}
                    </Badge>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center justify-between">
                      <span>{rel.title}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {rel.short_description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
