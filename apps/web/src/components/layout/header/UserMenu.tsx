import { useEffect, useState, useRef } from 'react';
import { Heart, LogIn, LogOut, MapPin, Package, Settings, User, UserPlus } from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function UserMenu() {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasLoadedOnce = useRef(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mark as loaded once we have session data (or confirmed no session)
  useEffect(() => {
    if (!isPending) {
      hasLoadedOnce.current = true;
    }
  }, [isPending]);

  const isLoggedIn = !!session?.user;
  const user = session?.user ? {
    name: session.user.name || 'User',
    email: session.user.email,
    avatar: session.user.image || null
  } : null;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Clear all cached queries on logout
          queryClient.clear();
          toast.success('Signed out successfully');
          navigate({ to: '/' });
        }
      }
    });
  };

  // Only show loading state on initial load, not on subsequent navigations
  if (!mounted || (!hasLoadedOnce.current && isPending)) {
    return (
      <div className="flex items-center">
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2" disabled>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
              <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </div>
            <div className="text-left">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Loading...</p>
              <p className="text-sm font-medium invisible">Sign In / Register</p>
            </div>
          </Button>
        </div>
        <div className="sm:hidden">
          <Button variant="ghost" size="icon-sm" className="rounded-full" disabled>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center">
        {/* Desktop: Full buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 hover:bg-[hsl(var(--muted))]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  isHovered ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                )}>
                  <User className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Welcome</p>
                  <p className="text-sm font-medium">Sign In / Register</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 px-4 py-4 text-white">
                <p className="text-lg font-bold">Welcome to Ayojon!</p>
                <p className="text-sm text-white/80">Sign in to discover events</p>
              </div>
              
              <div className="p-2">
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg p-3 hover:bg-[hsl(var(--primary))]/10"
                  onClick={() => navigate({ to: '/login' })}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                      <LogIn className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <p className="font-medium">Sign In</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Access your account</p>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer rounded-lg p-3 hover:bg-[hsl(var(--primary))]/10"
                  onClick={() => navigate({ to: '/login' })}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--secondary))]/20">
                      <UserPlus className="h-5 w-5 text-[hsl(var(--secondary))]" />
                    </div>
                    <div>
                      <p className="font-medium">Create Account</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Join Ayojon today</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>

              <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-4 py-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Get 10% off your first order when you sign up!
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile: Icon only */}
        <div className="sm:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={() => navigate({ to: '/login' })}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Logged in state
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-[hsl(var(--muted))]">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full border-2 border-[hsl(var(--primary))] object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">My Account</p>
            <p className="text-sm font-medium">{user.name.split(' ')[0]}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
        {/* User Header */}
        <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 px-4 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-white/80">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="p-2">
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-[hsl(var(--muted))]">
            <Link to="/account" className="flex items-center">
              <User className="mr-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>My Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-[hsl(var(--muted))]">
            <Link to="/account/orders" className="flex items-center">
              <Package className="mr-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-[hsl(var(--muted))]">
            <Link to="/account/wishlist" className="flex items-center">
              <Heart className="mr-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>Wishlist</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-[hsl(var(--muted))]">
            <Link to="/account/addresses" className="flex items-center">
              <MapPin className="mr-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>Addresses</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-[hsl(var(--muted))]">
            <Link to="/account/settings" className="flex items-center">
              <Settings className="mr-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="m-0" />
        
        <div className="p-2">
          <DropdownMenuItem
            className="cursor-pointer rounded-lg p-3 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
