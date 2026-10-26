import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  actionLink?: {
    href: string;
    label: string;
  };
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  description,
  actionLink,
  align = 'left',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12 ${
        align === 'center' ? 'text-center md:text-center items-center' : ''
      } ${className}`}
    >
      <div className={align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}>
        {badge && (
          <div className="mb-2.5">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#112D4E] bg-[#DBE2EF] border border-[#DBE2EF] rounded-full">
              {badge}
            </span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLink && (
        <div className="shrink-0 pt-2 md:pt-0">
          <Link
            href={actionLink.href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3F72AF] hover:text-[#112D4E] group transition-colors"
          >
            <span>{actionLink.label}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};
