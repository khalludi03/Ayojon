import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-4 text-[hsl(var(--muted-foreground))]">
          Checkout page - Coming soon
        </p>
      </div>
    </div>
  );
}

export default CheckoutPage;
