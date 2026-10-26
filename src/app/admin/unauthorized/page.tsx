'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

export default function AdminUnauthorizedPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || 'Authenticated User');
        }
      }
    }
    checkUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="p-8 sm:p-10 shadow-card border-red-200 text-center space-y-6 bg-white">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 mx-auto flex items-center justify-center text-red-600 shadow-subtle">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 rounded-full">
            403 Forbidden
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Unauthorized Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            You are signed in as <strong className="text-slate-900 font-semibold">{userEmail || 'an authenticated user'}</strong>. This account is not authorized as the portfolio administrator.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Owner Authorization Policy</span>
          </div>
          <p>
            Only the portfolio owner account configured in the server allowlist has administrative privileges.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleSignOut}
            icon={<LogOut className="w-4 h-4 text-red-600" />}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
          >
            Sign Out & Switch Account
          </Button>

          <Button
            variant="ghost"
            size="sm"
            href="/"
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-full text-slate-600"
          >
            Return to Public Portfolio
          </Button>
        </div>
      </Card>
    </div>
  );
}
