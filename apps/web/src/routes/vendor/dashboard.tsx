import { createFileRoute } from '@tanstack/react-router';
import { VendorDashboard } from '@/components/vendor/dashboard/VendorDashboard';

export const Route = createFileRoute('/vendor/dashboard')({
  component: VendorDashboardPage,
});

function VendorDashboardPage() {
  return <VendorDashboard />;
}

export default VendorDashboardPage;
