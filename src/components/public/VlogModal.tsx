'use client';

import React, { useEffect, useRef } from 'react';
import { X, Calendar, Clock, Film } from 'lucide-react';
import { VlogItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatVideoEmbedUrl } from '@/lib/services/portfolioService';

interface VlogModalProps {
  vlog: VlogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VlogModal: React.FC<VlogModalProps> = ({ vlog, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      // Auto-focus close button for keyboard accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !vlog) return null;

  const embedUrl = formatVideoEmbedUrl(vlog.video_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vlog-modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">
              {vlog.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{vlog.published_date}</span>
              {vlog.duration && (
                <>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{vlog.duration}</span>
                </>
              )}
            </div>
          </div>

          {/* Visible, Accessible Close Button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF]"
            aria-label="Close video player modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Canvas (No autoplay with sound!) */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={vlog.title}
              className="w-full h-full border-0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8 text-slate-400 space-y-3">
              <Film className="w-12 h-12 mx-auto opacity-60 text-[#3F72AF]" />
              <h4 className="text-base font-semibold text-white">Video Ready for Upload</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The video URL for &quot;{vlog.title}&quot; is ready to be linked in the Admin Console. Sound autoplay is strictly disabled.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Description */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          <h3
            id="vlog-modal-title"
            className="text-lg font-bold text-slate-900 mb-2 leading-snug"
          >
            {vlog.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {vlog.description}
          </p>
        </div>
      </div>
    </div>
  );
};
