'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeAdminRedirect } from '@/lib/auth/adminAuth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const safeRedirectTarget = sanitizeAdminRedirect(rawRedirect);

  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // 1. Attempt primary server authentication
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Also sync with Supabase client if configured
        if (configured) {
          try {
            const supabase = createClient();
            if (supabase) {
              await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
              });
            }
          } catch {
            // Server session already established
          }
        }

        setStatus('success');
        router.push(safeRedirectTarget);
        router.refresh();
        return;
      }

      // If server auth failed, try Supabase if configured
      if (configured) {
        const supabase = createClient();
        if (supabase) {
          const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (!supaErr && supaData.user) {
            setStatus('success');
            router.push(safeRedirectTarget);
            router.refresh();
            return;
          }
        }
      }

      throw new Error(data.error || 'Authentication failed. Please check your admin email and password.');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify your credentials.'
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Return link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Portfolio</span>
        </Link>
      </div>

      <Card className="p-8 sm:p-10 shadow-card border-slate-200/90 bg-white">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 mx-auto flex items-center justify-center text-brand-600 mb-3 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
            Maddala Varshini Portfolio
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to manage portfolio content, case studies, and media.
          </p>
        </div>

        {/* Owner authentication info */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Lock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>Authorized Owner Access</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Private management portal for Maddala Varshini. Write operations require verified owner credentials.
          </p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn" role="alert">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn" role="status">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Authentication successful. Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maddalavarshini@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              {/* Show / Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={status === 'loading'}
              icon={
                status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
              iconPosition="right"
              className="w-full"
            >
              {status === 'loading' ? 'Authenticating...' : 'Sign In to Dashboard'}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Public registrations are strictly prohibited. Single-owner allowlist security is enforced by Row Level Security and server authorization.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-subtle text-slate-500 text-xs">
          Loading authentication gateway...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
