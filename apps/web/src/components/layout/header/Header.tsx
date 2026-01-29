import { useState } from 'react';
import { HelpCircle, Menu, Phone, Search, Truck } from 'lucide-react';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { CurrencySelector } from './CurrencySelector';
import { UserMenu } from './UserMenu';
import { CartIcon } from './CartIcon';
import { WishlistIcon } from './WishlistIcon';
import { ThemeToggle } from './ThemeToggle';
import { MainNav } from './MainNav';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Set header height variable for children
  const headerRef = (node: HTMLDivElement) => {
    if (node) {
      const height = node.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  };

  return (
    <div ref={headerRef}>
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
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-18 items-center justify-between gap-4 py-3">
            {/* Mobile: Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <Logo />

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden flex-1 max-w-2xl px-6 md:block">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSearchModalOpen(true)}
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </Button>

              <div className="hidden md:block">
                <CurrencySelector />
              </div>
              <ThemeToggle />
              <WishlistIcon />
              <CartIcon />
              <div className="ml-1 sm:ml-2 border-l border-[hsl(var(--border))] pl-1 sm:pl-2">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-14 items-center justify-between">
              <MainNav 
                isMegaMenuOpen={isMegaMenuOpen}
                onCategoryClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)} 
                onMouseEnter={() => setIsMegaMenuOpen(true)}
              />
              
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
      {isSearchModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setIsSearchModalOpen(false)}
            aria-hidden="true"
          />

          {/* Search Modal */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--background))] p-4 shadow-lg animate-slide-down md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SearchBar />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;
