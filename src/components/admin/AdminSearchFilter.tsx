'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface AdminSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  statusOptions?: FilterOption[];
  categoryFilter?: string;
  onCategoryFilterChange?: (category: string) => void;
  categoryOptions?: FilterOption[];
  totalCount: number;
  filteredCount: number;
  className?: string;
}

export const AdminSearchFilter: React.FC<AdminSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  totalCount,
  filteredCount,
  className = '',
}) => {
  const hasActiveFilters = Boolean(
    searchTerm.trim() !== '' ||
    (statusFilter && statusFilter !== 'all') ||
    (categoryFilter && categoryFilter !== 'all')
  );

  const handleClear = () => {
    onSearchChange('');
    if (onStatusFilterChange) onStatusFilterChange('all');
    if (onCategoryFilterChange) onCategoryFilterChange('all');
  };

  return (
    <div className={`p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {statusOptions && onStatusFilterChange && (
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={statusFilter || 'all'}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {categoryOptions && onCategoryFilterChange && (
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={categoryFilter || 'all'}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>
          Showing <strong className="text-slate-800">{filteredCount}</strong> of{' '}
          <strong className="text-slate-800">{totalCount}</strong> entries
        </span>
        {hasActiveFilters && (
          <span className="text-brand-600 font-medium">Filtered results</span>
        )}
      </div>
    </div>
  );
};
