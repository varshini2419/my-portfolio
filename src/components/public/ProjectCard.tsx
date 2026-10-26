import React from 'react';
import Link from 'next/link';
import { Github, ExternalLink, ArrowRight, BarChart3, Database, FileSpreadsheet, Code2 } from 'lucide-react';
import { Project } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { isValidExternalUrl } from '@/lib/services/portfolioService';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Power BI Dashboards':
        return <BarChart3 className="w-5 h-5 text-[#3F72AF]" />;
      case 'SQL Projects':
        return <Database className="w-5 h-5 text-[#112D4E]" />;
      case 'Python Projects':
        return <Code2 className="w-5 h-5 text-[#3F72AF]" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-[#112D4E]" />;
    }
  };

  const hasGithub = isValidExternalUrl(project.github_url);
  const hasLiveDemo = isValidExternalUrl(project.live_demo_url);

  return (
    <Card hoverEffect className="flex flex-col h-full overflow-hidden border-slate-200/90 group">
      {/* Thumbnail or Placeholder Banner */}
      <div className="relative w-full h-44 bg-gradient-to-br from-[#F9F7F7] to-[#DBE2EF] border-b border-[#DBE2EF] flex items-center justify-center p-6 overflow-hidden">
        {project.thumbnail_url && project.thumbnail_url.trim() !== '' ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-subtle border border-slate-200/60 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110">
              {getCategoryIcon(project.category)}
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {project.category}
            </span>
          </div>
        )}

        {project.featured && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-[#3F72AF] text-white rounded-full shadow-xs">
              Featured Case Study
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#3F72AF] transition-colors">
          <Link href={`/projects/${project.slug}`}>
            {project.title}
          </Link>
        </h3>

        {/* Short Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
          {project.short_description}
        </p>

        {/* Technology Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="slate" size="sm">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 4 && (
            <Badge variant="outline" size="sm">
              +{project.tags.length - 4}
            </Badge>
          )}
        </div>

        {/* Action Links */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-1">
            {hasGithub && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF]"
                title="View GitHub Repository"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {hasLiveDemo && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-500 hover:text-[#3F72AF] hover:bg-[#DBE2EF]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF]"
                title="View Live Demo"
                aria-label="Live Demo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            href={`/projects/${project.slug}`}
            icon={<ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
            iconPosition="right"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};
