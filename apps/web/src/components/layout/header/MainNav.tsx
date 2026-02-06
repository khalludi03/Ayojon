import { Link } from '@tanstack/react-router';
import { ChevronDown, Home, Menu, Mic, Sparkles, UtensilsCrossed, Zap } from 'lucide-react';
import { NavDropdown } from './NavDropdown';
import type {DropdownItem} from './NavDropdown';
import { cn } from '@/lib/utils';

// Dropdown items for event categories
const decorDropdownItems: Array<DropdownItem> = [
  { href: '/category/decorations-balloons?subcategory=balloon-arches', label: 'Balloon Arches & Bouquets' },
  { href: '/category/decorations-balloons?subcategory=backdrops', label: 'Backdrops & Photo Walls' },
  { href: '/category/decorations-balloons?subcategory=led-decor', label: 'LED Lights & Neon Signs' },
  { href: '/category/decorations-balloons?subcategory=themed-decor', label: 'Themed Decorations' },
  { href: '/category/decorations-balloons?subcategory=entrance-decor', label: 'Entrance & Gate Decor' },
  { href: '/category/decorations-balloons', label: 'View All', description: 'Browse decorations & balloons' },
];

const soundDropdownItems: Array<DropdownItem> = [
  { href: '/category/sound-lighting?subcategory=pa-systems', label: 'PA Systems & Speakers' },
  { href: '/category/sound-lighting?subcategory=microphones', label: 'Microphones & Wireless' },
  { href: '/category/sound-lighting?subcategory=dj-equipment', label: 'DJ Equipment' },
  { href: '/category/sound-lighting?subcategory=stage-lights', label: 'Stage Lights & Effects' },
  { href: '/category/sound-lighting?subcategory=projectors', label: 'Projectors & Screens' },
  { href: '/category/sound-lighting', label: 'View All', description: 'Browse sound & lighting' },
];

const cateringDropdownItems: Array<DropdownItem> = [
  { href: '/category/catering-equipment?subcategory=chafing-dishes', label: 'Chafing Dishes & Warmers' },
  { href: '/category/catering-equipment?subcategory=glassware', label: 'Glassware & Drinkware' },
  { href: '/category/catering-equipment?subcategory=bar-equipment', label: 'Bar Equipment' },
  { href: '/category/catering-equipment?subcategory=serving-platters', label: 'Serving Platters & Bowls' },
  { href: '/category/catering-equipment?subcategory=beverage-dispensers', label: 'Beverage Dispensers' },
  { href: '/category/catering-equipment', label: 'View All', description: 'Browse catering equipment' },
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

        {/* Decorations - With dropdown */}
        <NavDropdown label="Decor" icon={Sparkles} items={decorDropdownItems} />

        {/* Sound & Lighting */}
        <NavDropdown label="Sound & Lighting" icon={Mic} items={soundDropdownItems} />

        {/* Catering Equipment */}
        <NavDropdown label="Catering" icon={UtensilsCrossed} items={cateringDropdownItems} />

        <NavDropdown label="Catering" icon={UtensilsCrossed} items={cateringDropdownItems} highlight />
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
