import React from 'react';
import { Award, CheckCircle, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getCertifications, isValidExternalUrl } from '@/lib/services/portfolioService';

export default async function CertificationsPage() {
  const certifications = await getCertifications();
  const completedCerts = certifications.filter((c) => c.status === 'completed');
  const inProgressCerts = certifications.filter((c) => c.status === 'in_progress');

  return (
    <>
      <Header />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <SectionHeader
            badge="Qualifications"
            title="Certifications & Continuous Learning"
            description="Verified certifications, technical credentials, and active coursework in business analytics, SQL, and data modeling."
          />

          {/* Completed Certifications */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#3F72AF]" />
              <h2 className="text-xl font-bold text-slate-900">
                Completed Certifications & Coursework
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedCerts.map((cert) => {
                const hasCredentialUrl = isValidExternalUrl(cert.credential_url);
                return (
                  <Card key={cert.id} hoverEffect className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#DBE2EF] border border-[#DBE2EF] flex items-center justify-center text-[#112D4E] shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <Badge variant="green" size="sm">
                          Verified Completed
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {cert.title}
                      </h3>
                      <p className="text-xs font-semibold text-brand-700 mb-3">
                        {cert.issuer} • Issued {cert.issue_date}
                      </p>

                      {cert.skills_covered && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {cert.skills_covered.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"
                            >
                              <CheckCircle className="w-3 h-3 text-brand-600" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-5 border-t border-slate-100 mt-6 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Official Record</span>
                      {hasCredentialUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          href={cert.credential_url}
                          external
                          icon={<ExternalLink className="w-3.5 h-3.5" />}
                        >
                          Verify Credential
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Credential ID verified locally
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* In-Progress Training */}
          <section className="space-y-6 pt-6 border-t border-slate-200/70">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Ongoing Courses & Training
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgressCerts.map((cert) => (
                <Card key={cert.id} className="border-amber-100/80 bg-amber-50/20">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <Badge variant="amber" size="sm">
                      In Progress
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {cert.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-800 mb-3">
                    {cert.issuer} • Expected Completion {cert.issue_date}
                  </p>

                  {cert.skills_covered && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {cert.skills_covered.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 text-[11px] text-amber-900 bg-amber-100/60 px-2.5 py-1 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 mt-6 border-t border-amber-200/40 text-xs text-amber-800">
                    Actively mastering syllabus and completing practical case exercises.
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
