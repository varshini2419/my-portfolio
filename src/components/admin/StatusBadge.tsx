'use client';

import React from 'react';
import { CheckCircle2, Clock, EyeOff, Archive, AlertCircle } from 'lucide-react';

export type ContentStatus =
  | 'published'
  | 'draft'
  | 'archived'
  | 'in_progress'
  | 'completed'
  | 'active'
  | 'inactive';

interface StatusBadgeProps {
  status: ContentStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const normalized = (status || '').toLowerCase().replace(/-/g, '_');

  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    published: {
      label: 'Published',
      bg: 'bg-brand-50',
      text: 'text-brand-700',
      border: 'border-brand-400/80',
      icon: CheckCircle2,
    },
    draft: {
      label: 'Draft',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200/80',
      icon: Clock,
    },
    archived: {
      label: 'Archived',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: Archive,
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-brand-50/70',
      text: 'text-slate-800',
      border: 'border-brand-200',
      icon: Clock,
    },
    completed: {
      label: 'Completed',
      bg: 'bg-brand-50',
      text: 'text-brand-700',
      border: 'border-brand-400/80',
      icon: CheckCircle2,
    },
    active: {
      label: 'Active',
      bg: 'bg-brand-50',
      text: 'text-brand-700',
      border: 'border-brand-400/80',
      icon: CheckCircle2,
    },
    inactive: {
      label: 'Inactive',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: EyeOff,
    },
  };

  const config = configs[normalized] || {
    label: status,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: AlertCircle,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </span>
  );
};
