import { LayoutDashboard, Package, ShoppingCart, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type VendorTab = 'dashboard' | 'products' | 'orders' | 'rentals' | 'settings';

interface VendorNavigationProps {
  activeTab: VendorTab;
  onTabChange: (tab: VendorTab) => void;
}

const tabs = [
  { id: 'dashboard' as VendorTab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products' as VendorTab, label: 'Products', icon: Package },
  { id: 'orders' as VendorTab, label: 'Orders', icon: ShoppingCart },
  { id: 'rentals' as VendorTab, label: 'Rentals', icon: Calendar },
  { id: 'settings' as VendorTab, label: 'Store Settings', icon: Settings },
];

export function VendorNavigation({ activeTab, onTabChange }: VendorNavigationProps) {
  return (
    <div className="border-b border-[hsl(var(--border))]">
      {/* Desktop Navigation */}
      <nav className="hidden sm:flex -mb-px space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                isActive
                  ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                  : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted))]'
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <nav className="sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as VendorTab)}
          className="block w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </nav>
    </div>
  );
}
