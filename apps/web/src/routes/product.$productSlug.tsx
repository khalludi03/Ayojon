import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { orpc } from '@/utils/orpc';
import type { Product } from '@/types';
import { ProductDetailPage } from '@/components/product/ProductDetailPage';

export const Route = createFileRoute('/product/$productSlug')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const product = await orpc.products.detail.call({ slug: params.productSlug }) as Product;
    const relatedProducts = await orpc.products.related.call({ productId: product.id }) as Product[];
    return { product, relatedProducts };
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
  const { product, relatedProducts } = Route.useLoaderData();
  return <ProductDetailPage product={product} relatedProducts={relatedProducts} />;
}
