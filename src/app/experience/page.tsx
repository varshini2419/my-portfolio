import React from 'react';
import { Calendar, MapPin, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getExperience } from '@/lib/services/portfolioService';

export default async function ExperiencePage() {
  const experienceList = await getExperience();

  return (
    <>
      <Header />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <SectionHeader
            badge="Career Journey"
            title="Experience & Practical Work"
            description="A timeline of academic research, analytics coursework, hands-on lab projects, and internship preparedness. Presented transparently without misrepresenting student work as formal full-time employment."
          />

          {/* Timeline Container */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-10">
            {experienceList.map((exp) => {
              const isAcademic = exp.experience_type === 'academic';
              const isPlaceholder = exp.id === 'exp-placeholder';

              return (
                <div key={exp.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 bg-white transition-colors ${
                      isPlaceholder
                        ? 'border-dashed border-amber-500'
                        : 'border-brand-600 group-hover:bg-brand-600'
                    }`}
                  />

                  <Card
                    className={`border-slate-200/90 shadow-subtle ${
                      isPlaceholder ? 'bg-amber-50/20 border-dashed border-amber-200' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={isPlaceholder ? 'amber' : isAcademic ? 'blue' : 'green'}
                            size="sm"
                          >
                            {exp.experience_type.toUpperCase()}
                          </Badge>
                          {exp.is_current && (
                            <Badge variant="green" size="sm">
                              Active
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {exp.role}
                        </h3>
                        <p className="text-sm font-semibold text-brand-700 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>{exp.organization}</span>
                        </p>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 sm:text-right shrink-0">
                        <div className="flex items-center sm:justify-end gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{exp.start_date} – {exp.end_date || 'Present'}</span>
                        </div>
                        {exp.location && (
                          <div className="flex items-center sm:justify-end gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {exp.description}
                    </p>

                    {exp.bullet_points && exp.bullet_points.length > 0 && (
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-600 mb-4">
                        {exp.bullet_points.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {exp.skills_used && exp.skills_used.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 mr-1">Skills:</span>
                        {exp.skills_used.map((skill) => (
                          <span key={skill} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Availability Notice */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-white shadow-subtle border border-slate-200/80 flex items-center justify-center text-brand-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Internship & Role Availability
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                As a 3rd year B.Tech student at SRKR Engineering College graduating in 2026, I am actively seeking summer internships and pre-placement opportunities where I can apply SQL, Python, data modeling, and business problem-solving in a real product environment.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
