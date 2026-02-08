import { Link } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import { Shield, Store } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'admin' | 'vendor';
}

export function Logo({ variant = 'default' }: LogoProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  let redirectPath = '/';

  if (user?.role === 'admin') {
    redirectPath = '/admin/dashboard';
  } else if (user?.role === 'vendor' && user?.vendorStatus === 'approved') {
    redirectPath = '/vendor/dashboard';
  } else if (user?.vendorStatus === 'pending') {
    redirectPath = '/vendor/application-pending';
  } else if (user?.vendorStatus === 'rejected') {
    redirectPath = '/vendor/application-rejected';
  }

  // Admin branding
  if (variant === 'admin') {
    return (
      <Link to={redirectPath} className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">Admin Panel</span>
          <span className="text-base font-black text-slate-900 dark:text-white leading-none mt-0.5">Ayojon</span>
        </div>
      </Link>
    );
  }

  // Vendor branding
  if (variant === 'vendor') {
    return (
      <Link to={redirectPath} className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/30">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">Vendor Hub</span>
          <span className="text-base font-black text-slate-900 dark:text-white leading-none mt-0.5">Ayojon</span>
        </div>
      </Link>
    );
  }

  // Default customer-facing branding
  return (
    <Link to={redirectPath} className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] sm:h-9 sm:w-9">
        <span className="text-base font-bold text-white sm:text-lg">A</span>
      </div>
      <span className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
        <span className="text-[hsl(var(--primary))]">Ayojon</span>
      </span>
    </Link>
  );
}
