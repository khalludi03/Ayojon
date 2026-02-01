import { createFileRoute } from '@tanstack/react-router';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { mockDb } from '@/mock/db';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/product/$productSlug')({
  component: ProductDetailPage,
  // Load data before rendering if possible, or handle in component
  loader: async ({ params }) => {
    // Ensure DB is initialized
    await mockDb.init();
    const product = mockDb.getProductBySlug(params.productSlug);
    if (!product) {
       return null;
    }
    return product;
  },
});

function ProductDetailPage() {
  const { productSlug } = Route.useParams();
  const initialData = Route.useLoaderData();
  const [product, setProduct] = useState<Product | null | undefined>(initialData);

  // Fallback if loader didn't run (client-side nav sometimes) or just to be safe
  useEffect(() => {
    if (!product) {
        mockDb.init().then(() => {
            const found = mockDb.getProductBySlug(productSlug);
            setProduct(found);
        });
    }
  }, [product, productSlug]);

  if (!product) {
    return (
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground">Home</a>
            <span className="mx-2">/</span>
            <span className="capitalize">{product.categoryId}</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          {/* Product Gallery */}
          <div className="product-gallery-container">
            <ProductGallery 
                images={product.images} 
            />
          </div>

          {/* Product Info */}
          <div className="product-info-container">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
