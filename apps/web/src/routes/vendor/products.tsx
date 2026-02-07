import { createFileRoute } from '@tanstack/react-router';
import { VendorProductsPage } from '@/components/vendor/products/VendorProductsPage';

export const Route = createFileRoute('/vendor/products')({
  component: VendorProductsPage,
});
