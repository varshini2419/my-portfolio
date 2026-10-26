'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, FolderKanban, X, ArrowUpDown } from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCard } from '@/components/public/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPublishedProjects } from '@/lib/services/portfolioService';
import { Project } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'recommended' | 'title-asc' | 'title-desc'>('recommended');

  useEffect(() => {
    async function loadProjects() {
      const data = await getPublishedProjects();
      setProjects(data);
    }
    loadProjects();
  }, []);

  // Compute actual dynamic categories based on published projects
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((p) => cats.add(p.category));
    return ['All Categories', ...Array.from(cats)];
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const result = projects.filter((project) => {
      // Security guard: ensure strictly published
      if (project.status !== 'published') return false;

      // Category filter
      const matchesCategory =
        selectedCategory === 'All Categories' || project.category === selectedCategory;

      // Search query filter across title, summary, and tags
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        project.title.toLowerCase().includes(query) ||
        project.short_description.toLowerCase().includes(query) ||
        project.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });

    // Sort order
    if (sortOption === 'title-asc') {
      return result.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortOption === 'title-desc') {
      return result.sort((a, b) => b.title.localeCompare(a.title));
    }
    // Default: recommended order by sort_order
    return result.sort((a, b) => a.sort_order - b.sort_order);
  }, [projects, selectedCategory, searchQuery, sortOption]);

  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setSearchQuery('');
    setSortOption('recommended');
  };

  const isFiltered = selectedCategory !== 'All Categories' || searchQuery.trim() !== '';

  return (
    <>
      <Header />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            badge="Case Studies & Work"
            title="Projects Gallery"
            description="Explore my data analytics projects, executive business intelligence dashboards, and SQL relational models designed to resolve business questions."
          />

          {/* Search, Filter & Sort Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                aria-label="Search projects by title, tool, or keyword"
                placeholder="Search by title, tool, or keyword (e.g. SQL, Power BI)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills & Sort Selector */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none" role="tablist" aria-label="Project categories">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline-block" aria-hidden="true" />
                {availableCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] ${
                        isActive
                          ? 'bg-[#3F72AF] text-white shadow-xs font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" aria-hidden="true" />
                <label htmlFor="project-sort-select" className="sr-only">Sort projects</label>
                <select
                  id="project-sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as 'recommended' | 'title-asc' | 'title-desc')}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                >
                  <option value="recommended">Recommended Order</option>
                  <option value="title-asc">Title: A to Z</option>
                  <option value="title-desc">Title: Z to A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Indicator */}
          {isFiltered && (
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing {filteredProjects.length} matching {filteredProjects.length === 1 ? 'project' : 'projects'}
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-[#3F72AF] hover:text-[#112D4E] underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderKanban className="w-6 h-6" />}
              title="No matching projects found"
              description={`We couldn't find any published projects matching "${searchQuery || selectedCategory}". Try selecting another category or resetting your search query.`}
              actionText="Reset Filters"
              onAction={resetFilters}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
