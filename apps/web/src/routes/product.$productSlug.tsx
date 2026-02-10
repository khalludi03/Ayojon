import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { orpcClient } from '@/utils/orpc';
import { ProductDetailPage } from '@/components/product/ProductDetailPage';

export const Route = createFileRoute('/product/$productSlug')({
  component: RouteComponent,
  // Load data before rendering if possible, or handle in component
  loader: async ({ params }) => {
    console.log(`[ProductLoader] Loading product for slug: "${params.productSlug}"`);
    try {
      // Try direct fetch to debug what's happening at network level
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const apiUrl = `${baseUrl}/api/product.getProductBySlug?slug=${encodeURIComponent(params.productSlug)}`;
      console.log(`[ProductLoader] Fetching from: ${apiUrl}`);
      
      const product = await orpcClient.product.getProductBySlug({ slug: params.productSlug });
      
      if (!product) {
        console.warn(`[ProductLoader] Product NOT FOUND for slug: "${params.productSlug}"`);
        throw notFound();
      }

      console.log(`[ProductLoader] Product found: "${product.title}"`);

      // Fetch related products (same category)
      let relatedProducts: any[] = [];
      try {
        const relatedResponse = await orpcClient.product.getProducts({ 
          category: product.categoryId, 
          limit: 8 
        });
        relatedProducts = (relatedResponse.data || []).filter((p: any) => p.id !== product.id);
      } catch (relatedError) {
        console.error(`[ProductLoader] Error fetching related products:`, relatedError);
      }

      return { product, relatedProducts };
    } catch (error: any) {
      if (error?.status === 404 || error?.name === 'NotFoundError' || error?.isNotFound) {
        throw error;
      }
      console.error(`[ProductLoader] Unexpected error:`, error);
      throw error;
    }
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
