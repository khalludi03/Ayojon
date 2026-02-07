import { createFileRoute } from '@tanstack/react-router';
import { VendorOrdersPage } from '@/components/vendor/orders/VendorOrdersPage';

export const Route = createFileRoute('/vendor/orders')({
  component: VendorOrdersPage,
});
