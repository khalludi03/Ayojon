import { createFileRoute, redirect } from '@tanstack/react-router';
import { VendorProductsPage } from '@/components/vendor/products/VendorProductsPage';
import { getUser } from '@/functions/get-user';

export const Route = createFileRoute('/vendor/products')({
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    const user = session.user as any;
    if (user.role !== 'vendor' || user.vendorStatus !== 'approved') {
      throw redirect({ to: '/' });
    }
    return { session };
  },
  component: VendorProductsPage,
});
