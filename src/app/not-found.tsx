import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, FolderKanban } from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mx-auto shadow-subtle">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#112D4E] bg-[#DBE2EF] px-3 py-1 rounded-full border border-[#DBE2EF]">
              404 Error
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Page or Project Not Found
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              The requested item does not exist or has not yet been published to the public portfolio.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              href="/projects"
              icon={<FolderKanban className="w-4 h-4" />}
            >
              Back to Projects Gallery
            </Button>
            <Button
              variant="outline"
              size="md"
              href="/"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Return Home
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
