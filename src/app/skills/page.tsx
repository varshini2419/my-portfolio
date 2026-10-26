import React from 'react';
import {
  Database,
  BarChart2,
  Code2,
  Cloud,
  Sparkles,
  Wrench,
  CheckCircle,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getSkillCategories } from '@/lib/services/portfolioService';

export default async function SkillsPage() {
  const categories = await getSkillCategories();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Analysis':
        return <FileSpreadsheet className="w-5 h-5 text-[#3F72AF]" />;
      case 'Data Visualization':
        return <BarChart2 className="w-5 h-5 text-[#112D4E]" />;
      case 'Programming':
        return <Code2 className="w-5 h-5 text-[#3F72AF]" />;
      case 'Databases & SQL':
        return <Database className="w-5 h-5 text-[#112D4E]" />;
      case 'Cloud Technologies':
        return <Cloud className="w-5 h-5 text-[#3F72AF]" />;
      case 'AI Tools':
        return <Sparkles className="w-5 h-5 text-[#112D4E]" />;
      default:
        return <Wrench className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <>
      <Header />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <SectionHeader
            badge="Technical Competencies"
            title="Skills, Tools & Technologies"
            description="A verified overview of analytical competencies, programming languages, databases, and AI tooling. Presented with transparency and without arbitrary percentage meters."
          />

          {/* Philosophy Note */}
          <div className="bg-[#DBE2EF]/40 border border-[#DBE2EF] rounded-2xl p-5 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F72AF] shrink-0" />
            <span>
              <strong>Proficiency Philosophy:</strong> I prioritize structured SQL reasoning, clear exploratory data analysis, and readable visualizations over vanity metrics or unverified percentage sliders.
            </span>
          </div>

          {/* Skills Grid by Category or Empty State */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {categories.map((category) => (
                <Card key={category.name} className="flex flex-col h-full border-slate-200/90 shadow-subtle">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {getCategoryIcon(category.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {category.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {category.skills.length} competencies listed
                      </span>
                    </div>
                  </div>

                  {/* List of skills */}
                  <div className="space-y-3.5 flex-grow">
                    {category.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 transition-colors hover:bg-white hover:border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            {skill.name}
                          </span>
                          {skill.is_featured && (
                            <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                              Core
                            </span>
                          )}
                        </div>
                        {skill.description && (
                          <p className="text-xs text-slate-500 leading-relaxed pl-5">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Layers className="w-6 h-6" />}
              title="No skills configured yet"
              description="Technical skills and tools can be added through the Admin Console."
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
