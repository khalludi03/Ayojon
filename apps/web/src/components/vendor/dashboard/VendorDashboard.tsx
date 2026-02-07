import { useState } from 'react';
import { VendorNavigation } from './VendorNavigation';
import { DashboardOverview } from './DashboardOverview';
import { ProductsManagement } from '../products/ProductsManagement';

type VendorTab = 'dashboard' | 'products' | 'orders' | 'rentals' | 'settings';

export function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<VendorTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'products':
        return <ProductsManagement />;
      case 'orders':
        return (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">Orders management coming soon...</p>
          </div>
        );
      case 'rentals':
        return (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">Rentals management coming soon...</p>
          </div>
        );
      case 'settings':
        // Redirect to dedicated settings page
        window.location.href = '/vendor/settings';
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Vendor Dashboard
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage your store and track performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <VendorNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="mt-6">{renderContent()}</div>
      </div>
    </div>
  );
}
