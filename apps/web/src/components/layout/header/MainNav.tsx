import { Link } from '@tanstack/react-router';
import { ChevronDown, Home, Menu, Package, Tag, User, UserRound, Zap } from 'lucide-react';
import {  NavDropdown } from './NavDropdown';
import type {DropdownItem} from './NavDropdown';
import { cn } from '@/lib/utils';

// Dropdown items for each category
const womensDropdownItems: Array<DropdownItem> = [
  { href: '/category/womens-clothing/dresses', label: 'Dresses' },
  { href: '/category/womens-clothing/tops', label: 'Tops & Blouses' },
  { href: '/category/womens-clothing/sarees', label: 'Sarees' },
  { href: '/category/womens-clothing/kurtis', label: 'Kurtis & Salwar' },
  { href: '/category/womens-clothing/western', label: 'Western Wear' },
  { href: '/category/womens-clothing', label: 'View All', description: 'Browse all women\'s clothing' },
];

const mensDropdownItems: Array<DropdownItem> = [
  { href: '/category/mens-clothing/shirts', label: 'Shirts' },
  { href: '/category/mens-clothing/t-shirts', label: 'T-Shirts' },
  { href: '/category/mens-clothing/pants', label: 'Pants & Jeans' },
  { href: '/category/mens-clothing/traditional', label: 'Traditional Wear' },
  { href: '/category/mens-clothing/activewear', label: 'Activewear' },
  { href: '/category/mens-clothing', label: 'View All', description: 'Browse all men\'s clothing' },
];

const salesDropdownItems: Array<DropdownItem> = [
  { href: '/deals/flash', label: 'Flash Sale', description: 'Up to 70% off' },
  { href: '/deals/clearance', label: 'Clearance', description: 'Final markdowns' },
  { href: '/deals/bundle', label: 'Bundle Offers', description: 'Buy more, save more' },
  { href: '/deals/seasonal', label: 'Seasonal Sale', description: 'Limited time offers' },
  { href: '/deals', label: 'All Deals', description: 'View all promotions' },
];

const bundleDropdownItems: Array<DropdownItem> = [
  { href: '/bundle-deals/electronics', label: 'Electronics Bundles' },
  { href: '/bundle-deals/fashion', label: 'Fashion Combos' },
  { href: '/bundle-deals/home', label: 'Home Essentials' },
  { href: '/bundle-deals/gifts', label: 'Gift Sets' },
  { href: '/bundle-deals', label: 'All Bundles', description: 'View all bundle deals' },
];

interface MainNavProps {
  onCategoryClick?: () => void;
}

export function MainNav({ onCategoryClick }: MainNavProps) {
  return (
    <nav className="flex items-center gap-1">
      {/* All Categories Button - Desktop only */}
      <button
        onClick={onCategoryClick}
        className="hidden items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[hsl(var(--primary))]/90 hover:shadow-md lg:flex"
      >
        <Menu className="h-4 w-4" />
        <span>All Categories</span>
        <ChevronDown className="h-3 w-3 ml-1" />
      </button>

      {/* Main Navigation Links */}
      <div className="hidden items-center gap-1 ml-2 lg:flex">
        {/* Home - Simple link, no dropdown */}
        <Link
          to="/"
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
            'hover:bg-[hsl(var(--card))] hover:shadow-sm',
            'text-[hsl(var(--foreground))]'
          )}
          activeProps={{
            className: cn(
              'bg-[hsl(var(--primary))] text-white',
              'hover:bg-[hsl(var(--primary))]/90'
            )
          }}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        {/* Women's - With dropdown */}
        <NavDropdown
          label="Women's"
          icon={UserRound}
          items={womensDropdownItems}
        />

        {/* Men's - With dropdown */}
        <NavDropdown
          label="Men's"
          icon={User}
          items={mensDropdownItems}
        />

        {/* Sales - With dropdown, highlighted */}
        <NavDropdown
          label="Sales"
          icon={Tag}
          items={salesDropdownItems}
          highlight
        />

        {/* Bundle Deals - With dropdown */}
        <NavDropdown
          label="Bundle Deals"
          icon={Package}
          items={bundleDropdownItems}
        />
      </div>

      {/* Flash Deals Highlight */}
      <a
        href="/deals/flash"
        className="hidden lg:flex items-center gap-2 ml-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
      >
        <Zap className="h-4 w-4" />
        <span>Flash Deals</span>
      </a>
    </nav>
  );
}
