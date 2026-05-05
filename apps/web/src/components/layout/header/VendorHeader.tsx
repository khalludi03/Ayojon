import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

export function VendorHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
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

  const navLinks = [
    { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vendor/products', label: 'Products', icon: Package },
    { to: '/vendor/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/vendor/settings', label: 'Store Settings', icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60 shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Logo and Dashboard Title */}
          <div className="flex items-center gap-4 shrink-0">
            <Logo />
            <div className="hidden md:flex items-center gap-2 border-l border-[hsl(var(--border))] pl-4">
              <Store className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="font-bold text-lg hidden lg:inline-block">
                Vendor Central
              </span>
            </div>
          </div>

          {/* Center: Main Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))]',
                  'text-[hsl(var(--muted-foreground))]',
                )}
                activeProps={{
                  className:
                    'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/20',
                }}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Actions and Logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            <ThemeToggle />

            <div className="ml-2 border-l border-[hsl(var(--border))] pl-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 gap-2 hidden md:flex"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>

              {/* Mobile: Logout Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="text-[hsl(var(--destructive))] md:hidden"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile: Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden ml-2"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer (Simplified for now) */}
      {isMobileNavOpen && (
        <div className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-[hsl(var(--foreground))]"
                activeProps={{
                  className: 'bg-[hsl(var(--primary))] text-white',
                }}
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
  )
}
