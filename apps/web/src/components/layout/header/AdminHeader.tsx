import { useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserCog,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Logo } from './Logo'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

// Top-level navigation sections
const sections = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
    subTabs: null,
  },
  {
    id: 'people',
    label: 'People',
    icon: UserCog,
    subTabs: [
      { label: 'Users', path: '/admin/users', icon: Users },
      {
        label: 'Applications',
        path: '/admin/vendor-applications',
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    icon: Store,
    subTabs: [
      { label: 'Vendors', path: '/admin/vendors', icon: Store },
      { label: 'Products', path: '/admin/products', icon: Package },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingBag,
    path: '/admin/orders',
    subTabs: null,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/admin/settings',
    subTabs: null,
  },
]

export function AdminHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Clear all cached queries on logout
          queryClient.clear()
          toast.success('Signed out successfully')
          navigate({ to: '/login' })
        },
      },
    })
  }

  // Determine active section based on current path
  const getActiveSection = () => {
    const path = location.pathname
    if (path === '/admin/dashboard') return 'dashboard'
    if (
      path.includes('/admin/user') ||
      path.includes('/admin/vendor-application')
    )
      return 'people'
    if (path.includes('/admin/vendor') || path.includes('/admin/product'))
      return 'business'
    if (path.includes('/admin/order')) return 'orders'
    if (path.includes('/admin/setting')) return 'settings'
    return 'dashboard'
  }

  const activeSection = getActiveSection()
  const activeSectionData = sections.find((s) => s.id === activeSection)

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Top Bar */}
      <div className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-4 shrink-0">
              <Logo />
              <div className="hidden md:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-sm hidden lg:inline-block text-slate-900 dark:text-white">
                  Admin Panel
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <NotificationBell />

              <ThemeToggle />

              <div className="ml-2 border-l border-slate-200 dark:border-slate-800 pl-4 flex items-center gap-2">
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
                  className="text-red-600 md:hidden hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile: Hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden ml-2 text-slate-600"
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Primary Navigation Tabs */}
      <div className="hidden md:block bg-slate-50/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex items-center gap-1 py-2">
            {sections.map((section) => {
              const isActive = activeSection === section.id
              const SectionIcon = section.icon

              return (
                <Link
                  key={section.id}
                  to={(section.path || section.subTabs?.[0]?.path) as any}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white',
                  )}
                >
                  <SectionIcon className="h-4 w-4" />
                  <span>{section.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop: Secondary Navigation (Sub-tabs) */}
      {activeSectionData?.subTabs && (
        <div className="hidden md:block bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="flex items-center gap-1 py-2">
              {activeSectionData.subTabs.map((tab) => {
                const isActiveTab = location.pathname === tab.path
                const TabIcon = tab.icon

                return (
                  <Link
                    key={tab.path}
                    to={tab.path as any}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                      isActiveTab
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900',
                    )}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile: Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 animate-in slide-in-from-top duration-200">
          <nav className="space-y-1">
            {sections.map((section) => {
              const SectionIcon = section.icon

              if (!section.subTabs) {
                return (
                  <Link
                    key={section.id}
                    to={section.path as any}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all',
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900',
                    )}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <SectionIcon className="h-5 w-5" />
                    <span>{section.label}</span>
                  </Link>
                )
              }

              return (
                <div key={section.id} className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <SectionIcon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </div>
                  {section.subTabs.map((tab) => {
                    const TabIcon = tab.icon
                    return (
                      <Link
                        key={tab.path}
                        to={tab.path as any}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 ml-8 rounded-lg text-sm font-semibold transition-all',
                          location.pathname === tab.path
                            ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900',
                        )}
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        <TabIcon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
