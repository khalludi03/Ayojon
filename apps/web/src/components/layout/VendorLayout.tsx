import { useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Logo } from './header/Logo'
import { ThemeToggle } from './header/ThemeToggle'
import { NotificationBell } from './header/NotificationBell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/vendor/dashboard' },
  { label: 'Products', icon: Package, path: '/vendor/products' },
  { label: 'Orders', icon: ShoppingBag, path: '/vendor/orders' },
  { label: 'Settings', icon: Settings, path: '/vendor/settings' },
]

interface VendorLayoutProps {
  children: React.ReactNode
}

export function VendorLayout({ children }: VendorLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
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

  const isActivePath = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60 shadow-sm">
        {/* Main Header Bar */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <Logo />
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden flex-1 max-w-xl px-6 md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  type="search"
                  placeholder="Search products, orders..."
                  className="pl-10 h-10 bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))]"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
              <div className="border-l border-[hsl(var(--border))] pl-2 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="hidden lg:flex h-14 items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative',
                      isActive
                        ? 'text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--foreground))]/80 hover:text-[hsl(var(--foreground))]',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-[hsl(var(--background))] border-r border-[hsl(var(--border))] lg:hidden animate-in slide-in-from-left duration-300">
            <div className="flex h-16 items-center justify-between px-4 border-b border-[hsl(var(--border))]">
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-col p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-[hsl(var(--border))] p-4">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
