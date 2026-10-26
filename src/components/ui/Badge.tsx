import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'slate' | 'green' | 'amber' | 'rose' | 'outline' | 'sage';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  const variantStyles = {
    blue: 'bg-[#DBE2EF] text-[#112D4E] border border-[#DBE2EF] font-semibold',
    sage: 'bg-[#DBE2EF] text-[#112D4E] border border-[#DBE2EF] font-semibold',
    slate: 'bg-white text-[#112D4E] border border-[#DBE2EF] font-medium',
    green: 'bg-[#DBE2EF] text-[#112D4E] border border-[#3F72AF]/40 font-semibold',
    amber: 'bg-amber-50/90 text-amber-900 border border-amber-200/80 font-medium',
    rose: 'bg-rose-50 text-rose-800 border border-rose-200/60 font-medium',
    outline: 'bg-transparent text-[#3F72AF] border border-[#DBE2EF] font-normal',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
