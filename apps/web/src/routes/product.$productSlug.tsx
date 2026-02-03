import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { mockDb } from '@/mock/db';
import { ProductDetailPage } from '@/components/product/ProductDetailPage';

export const Route = createFileRoute('/product/$productSlug')({
  component: RouteComponent,
  // Load data before rendering if possible, or handle in component
  loader: async ({ params }) => {
    // Ensure DB is initialized
    await mockDb.init();
    const product = mockDb.getProductBySlug(params.productSlug);
    if (!product) {
       throw notFound();
    }
    return product;
  },
  notFoundComponent: () => {
    return (
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            <Link to="/products">
                <Button variant="outline">Browse Products</Button>
            </Link>
        </div>
    );
  }
});

function RouteComponent() {
  const product = Route.useLoaderData();
  return <ProductDetailPage product={product} />;
}
