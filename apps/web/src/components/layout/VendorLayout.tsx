import { useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Store,
  BarChart3
} from 'lucide-react';
import { Logo } from './header/Logo';
import { ThemeToggle } from './header/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/vendor/dashboard' }
    ]
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', icon: Package, path: '/vendor/products' }
    ]
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders', icon: ShoppingBag, path: '/vendor/orders' }
    ]
  },
  {
    label: 'Settings',
    items: [
      { label: 'Store Settings', icon: Settings, path: '/vendor/settings' }
    ]
  }
];

interface VendorLayoutProps {
  children: React.ReactNode;
}

export function VendorLayout({ children }: VendorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
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

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:border-slate-200 dark:lg:border-slate-800 lg:bg-white dark:lg:bg-slate-900 lg:transition-all lg:duration-300 lg:z-40",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {!sidebarCollapsed && <Logo variant="vendor" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path as any}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                        isActive
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-white")} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                      {isActive && !sidebarCollapsed && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full justify-start gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 font-semibold",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Button & Overlay */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Logo variant="vendor" />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col lg:hidden animate-in slide-in-from-left duration-300">
              {/* Mobile Sidebar Header */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
                <Logo variant="vendor" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {navigationGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.path);

                        return (
                          <Link
                            key={item.path}
                            to={item.path as any}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                              isActive
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            <span>{item.label}</span>
                            {isActive && (
                              <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Mobile Sidebar Footer */}
              <div className="border-t border-slate-200 dark:border-slate-800 p-3">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Logout</span>
                </Button>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className={cn("lg:transition-all lg:duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Top Header Bar (Desktop only) */}
        <header className="hidden lg:sticky lg:top-0 lg:z-30 lg:flex lg:h-16 lg:items-center lg:gap-4 lg:border-b lg:border-slate-200 dark:lg:border-slate-800 lg:bg-white/80 dark:lg:bg-slate-900/80 lg:backdrop-blur-sm lg:px-6">
          <div className="flex-1 flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search products, orders..."
                className="pl-10 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
            </Button>

            <ThemeToggle />

            {/* Vendor Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
              <Store className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Vendor</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
