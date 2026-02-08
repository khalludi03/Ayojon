import { createFileRoute, redirect } from '@tanstack/react-router';
import { VendorSettingsPage } from '@/components/vendor/settings/VendorSettingsPage';
import { getUser } from '@/functions/get-user';

export const Route = createFileRoute('/vendor/settings')({
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
  component: VendorSettingsPage,
});
