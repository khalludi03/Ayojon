import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderDetailView } from '@/components/vendor/orders/OrderDetailView';
import { getUser } from '@/functions/get-user';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/vendor/orders/$orderId')({
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
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { orderId } = Route.useParams();

  // Fetch order details from API using vendor-specific endpoint
  const { data: order, isLoading, error } = useQuery({
    ...orpc.vendor.getOrderDetails.queryOptions({
      input: { orderId }
    }),
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-[hsl(var(--muted-foreground))]">The order you're looking for doesn't exist or you don't have access.</p>
        <Button asChild>
          <Link to="/vendor/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Button variant="ghost" asChild className="mb-6 hover:bg-transparent p-0">
          <Link to="/vendor/orders" className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Back to Orders</span>
          </Link>
        </Button>

        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
          <OrderDetailView order={order} />
        </div>
      </div>
    </div>
  );
}
