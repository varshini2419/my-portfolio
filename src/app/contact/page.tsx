'use client';

import React, { useState } from 'react';
import { Mail, Linkedin, Github, MapPin, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { initialProfile } from '@/lib/data/portfolioData';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    if (!configured) {
      setTimeout(() => {
        setStatus('error');
        setErrorMessage(
          'Direct contact form messaging requires live Supabase backend credentials in .env.local. In the meantime, please connect directly with Maddala Varshini via LinkedIn or email below!'
        );
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase client could not be loaded.');
      }

      const { error } = await supabase.from('contact_messages').insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      ]);

      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while sending your message.'
      );
    }
  };

  return (
    <>
      <Header />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <SectionHeader
            badge="Get in Touch"
            title="Contact & Connections"
            description="Whether you have an internship opportunity, a data analytics collaboration idea, or want to discuss business intelligence and SQL workflows, I'd love to hear from you."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 5 Columns: Direct Contact Channels */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Direct Contact Channels
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Verified channels to reach me directly for professional inquiries and collaborations.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-400 block">
                        Email Address
                      </span>
                      <a
                        href={`mailto:${initialProfile.email}`}
                        className="text-sm font-semibold text-slate-800 hover:text-[#3F72AF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] rounded"
                      >
                        {initialProfile.email}
                      </a>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-400 block">
                        LinkedIn Profile
                      </span>
                      <a
                        href={initialProfile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-800 hover:text-[#3F72AF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] rounded"
                      >
                        linkedin.com/in/maddala-varshini
                      </a>
                    </div>
                  </div>

                  {/* GitHub */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-400 block">
                        GitHub Repositories
                      </span>
                      <a
                        href={initialProfile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-800 hover:text-[#3F72AF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] rounded"
                      >
                        github.com/maddalavarshini
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-400 block">
                        Current Location
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {initialProfile.college}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right 7 Columns: Contact Form */}
            <div className="lg:col-span-7">
              <Card className="p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Send a Message
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Fill out the form below. Messages are saved securely to the database.
                  </p>
                </div>

                {status === 'success' ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-base font-bold text-emerald-950">
                      Message Sent Successfully!
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-800 max-w-sm mx-auto">
                      Thank you for reaching out. Maddala Varshini will review your inquiry and reply promptly.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatus('idle')}
                      className="mt-2"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {status === 'error' && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Priya Sharma"
                          className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Subject / Topic *
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Data Analyst Internship Opportunity"
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Share project details, role description, or questions..."
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={status === 'submitting'}
                        icon={<Send className="w-4 h-4" />}
                        className="w-full sm:w-auto"
                      >
                        {status === 'submitting' ? 'Submitting...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
