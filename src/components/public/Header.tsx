'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/skills', label: 'Skills' },
    { href: '/certifications', label: 'Certifications' },
    { href: '/experience', label: 'Experience' },
    { href: '/resume', label: 'Resume' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#112D4E] border-b border-[#3F72AF]/25 shadow-subtle transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo / Name */}
          <Link
            href="/"
            className="flex flex-col group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] rounded-lg p-1"
          >
            <span className="text-base sm:text-lg font-bold text-white group-hover:text-[#DBE2EF] transition-colors tracking-tight">
              Maddala Varshini
            </span>
            <span className="text-[11px] font-medium text-[#DBE2EF]/80 tracking-wide">
              Data Analyst Aspirant
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] ${
                    active
                      ? 'text-white bg-[#3F72AF] font-semibold shadow-xs'
                      : 'text-[#DBE2EF] hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Resume Action & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <Button
                variant="primary"
                size="sm"
                href="/resume"
                icon={<FileText className="w-3.5 h-3.5" />}
              >
                Resume
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#DBE2EF] hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#112D4E] border-b border-[#3F72AF]/30 px-4 pt-3 pb-6 shadow-card animate-fadeIn">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF] ${
                    active
                      ? 'text-white bg-[#3F72AF] font-semibold'
                      : 'text-[#DBE2EF] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </Link>
              );
            })}
            <div className="pt-3">
              <Button
                variant="primary"
                size="md"
                href="/resume"
                className="w-full justify-center"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                View Resume
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
