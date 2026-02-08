import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  ShoppingBag, 
  Menu, 
  Bell,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export function AdminHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('Signed out successfully');
          navigate({ to: '/login' });
        }
      }
    });
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/vendors', label: 'Vendors', icon: Store },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-200 dark:border-indigo-900 bg-indigo-50/80 dark:bg-indigo-950/20 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Logo and Dashboard Title */}
          <div className="flex items-center gap-4 shrink-0">
            <Logo />
            <div className="hidden md:flex items-center gap-2 border-l border-indigo-200 dark:border-indigo-800 pl-4">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-lg hidden lg:inline-block text-indigo-900 dark:text-indigo-100">Admin Control</span>
            </div>
          </div>

          {/* Center: Main Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to as any}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/40",
                  "text-indigo-700 dark:text-indigo-300"
                )}
                activeProps={{
                  className: "bg-indigo-600 text-white dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400"
                }}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Actions and Logout */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-indigo-600 dark:text-indigo-400">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-indigo-950" />
            </Button>
            
            <ThemeToggle />
            
            <div className="ml-2 border-l border-indigo-200 dark:border-indigo-800 pl-4 flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2 hidden md:flex font-bold"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-600 md:hidden"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile: Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden ml-2 text-indigo-600"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden border-t border-indigo-100 dark:border-indigo-900 bg-white dark:bg-indigo-950 p-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to as any}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-bold text-indigo-900 dark:text-indigo-100"
                activeProps={{ className: "bg-indigo-600 text-white" }}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
