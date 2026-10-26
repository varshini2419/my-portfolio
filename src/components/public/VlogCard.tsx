'use client';

import React from 'react';
import { Play, Calendar, Clock, Film } from 'lucide-react';
import { VlogItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface VlogCardProps {
  vlog: VlogItem;
  onWatch?: (vlog: VlogItem) => void;
}

export const VlogCard: React.FC<VlogCardProps> = ({ vlog, onWatch }) => {
  return (
    <Card hoverEffect className="flex flex-col h-full overflow-hidden border-slate-200/90 group">
      {/* Video Thumbnail Container */}
      <div className="relative w-full aspect-video bg-slate-900 rounded-t-2xl overflow-hidden flex items-center justify-center">
        {vlog.thumbnail_url ? (
          <img
            src={vlog.thumbnail_url}
            alt={vlog.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-300 p-6 text-center">
            <Film className="w-8 h-8 text-brand-300 mb-2 opacity-80" />
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
              {vlog.category}
            </span>
          </div>
        )}

        {/* Play Button Overlay */}
        <button
          type="button"
          onClick={() => onWatch?.(vlog)}
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/95 hover:bg-white text-[#3F72AF] shadow-card flex items-center justify-center transition-all duration-200 group-hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] cursor-pointer"
          aria-label={`Watch ${vlog.title}`}
        >
          <Play className="w-5 h-5 fill-[#3F72AF] ml-0.5" />
        </button>

        {/* Duration pill */}
        {vlog.duration && (
          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-medium bg-black/75 text-white flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {vlog.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge variant="blue" size="sm">
            {vlog.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{vlog.published_date}</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#3F72AF] transition-colors">
          {vlog.title}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
          {vlog.description}
        </p>

        <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 capitalize">
            Source: {vlog.video_source}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWatch?.(vlog)}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            Watch Video
          </Button>
        </div>
      </div>
    </Card>
  );
};
