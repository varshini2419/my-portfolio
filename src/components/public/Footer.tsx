import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Mail, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#112D4E] text-[#DBE2EF] border-t border-[#3F72AF]/25 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Column 1: Info */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Maddala Varshini
            </h3>
            <p className="text-sm text-[#DBE2EF]/85 max-w-md leading-relaxed">
              3rd Year B.Tech Computer Science & IT student at SRKR Engineering College, Bhimavaram. Aspiring Data Analyst dedicated to discovering actionable business insights through quantitative rigor, SQL, Python, and Power BI.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/maddalavarshini"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#3F72AF] text-[#DBE2EF] hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF]"
                aria-label="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/maddala-varshini"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#3F72AF] text-[#DBE2EF] hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF]"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:maddalavarshini@example.com"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#3F72AF] text-[#DBE2EF] hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF]"
                aria-label="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#DBE2EF]/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Me
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Projects Gallery
                </Link>
              </li>
              <li>
                <Link href="/skills" className="hover:text-white transition-colors">
                  Skills & Tools
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-white transition-colors">
                  Certifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Professional & Experience */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Experience & Contact
            </h4>
            <ul className="space-y-2 text-sm text-[#DBE2EF]/80">
              <li>
                <Link href="/experience" className="hover:text-white transition-colors">
                  Experience & Lab Work
                </Link>
              </li>
              <li>
                <Link href="/resume" className="hover:text-white transition-colors">
                  Resume Preview
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-[#DBE2EF]/60 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#DBE2EF]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#DBE2EF]/70">
          <p>
            © {new Date().getFullYear()} Maddala Varshini. Built with Next.js, Tailwind CSS & Supabase.
          </p>
          <p className="flex items-center gap-1">
            <span>Designed for clarity, performance, and accessibility</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
