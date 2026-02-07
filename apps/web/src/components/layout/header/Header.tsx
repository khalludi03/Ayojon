import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { HelpCircle, Menu, Phone, Search, Truck } from 'lucide-react';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { MobileSearchModal } from './MobileSearchModal';
import { UserMenu } from './UserMenu';
import { CartIcon } from './CartIcon';
import { WishlistIcon } from './WishlistIcon';
import { ThemeToggle } from './ThemeToggle';
import { MainNav } from './MainNav';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';
import { Button } from '@/components/ui/button';
import { useCart } from '@/stores/cart-store';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function Header() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { openDrawer } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="hidden sm:block bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--primary))] text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-9 items-center justify-between text-xs">
            <div className="flex items-center gap-6">
              <a href="/track-order" className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
                <Truck className="h-3.5 w-3.5" />
                Track Order
              </a>
              <a href="/help" className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
                Help Center
              </a>
            </div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Hotline: 16XXX
              </span>
              <span>Free shipping on orders over ৳999</span>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60 shadow-sm">
        {/* Main Header Bar */}
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="flex h-14 items-center justify-between gap-1 py-2 sm:h-16 sm:gap-2 md:h-18 md:gap-4 md:py-3">
            {/* Left side: Hamburger + Logo grouped together */}
            <div className="flex items-center gap-1 shrink-0 sm:gap-2">
              {/* Mobile: Hamburger Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              {/* Logo */}
              <Logo />
            </div>

            {/* Search Bar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden flex-1 max-w-xl px-3 md:block md:px-4 lg:max-w-2xl lg:px-6">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-0 sm:gap-1 md:gap-2">
              {/* Mobile Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 md:hidden"
                onClick={() => setIsSearchModalOpen(true)}
                aria-label="Open search"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium hover:bg-[hsl(var(--primary))]/10"
                onClick={() => navigate({ to: '/become-vendor' })}
              >
                Become a Vendor
              </Button>
              <ThemeToggle />
              <WishlistIcon
                onClick={() => navigate({ to: '/account', search: { section: 'wishlist' } })}
              />
              <CartIcon onClick={openDrawer} />
              <div className="ml-0 border-l border-[hsl(var(--border))] pl-0.5 sm:ml-1 sm:pl-1 md:ml-2 md:pl-2">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-14 items-center justify-between">
              <MainNav onCategoryClick={() => setIsMegaMenuOpen(true)} />
              
              {/* Right side promo text */}
              <div className="hidden xl:flex items-center">
                <a
                  href="/deals"
                  className="flex items-center gap-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-200"
                  style={{ boxShadow: 'var(--shadow-festive)' }}
                >
                  <span className="animate-pulse">🔥</span>
                  <span>Hot Deals: Up to 70% Off!</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mega Menu - Desktop only */}
      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Mobile Search Modal */}
      <MobileSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      
      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}

export default Header;
