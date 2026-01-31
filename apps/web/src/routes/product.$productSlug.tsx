import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/product/$productSlug')({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productSlug } = Route.useParams();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold">Product: {productSlug}</h1>
        <p className="mt-4 text-[hsl(var(--muted-foreground))]">
          Product detail page - Coming soon
        </p>
      </div>
    </div>
  );
}

export default ProductDetailPage;
