import { createFileRoute, notFound } from '@tanstack/react-router';
import { ProductGallery } from '@/components/product/ProductGallery';
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
       // Allow 404 handling
       // throw notFound(); // This might require a NotFoundRoute, let's just return null and handle in component for now or simple null check
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.title}</h1>
            
            {/* Vendor Info */}
            <div className="mt-2 text-sm text-muted-foreground">
                Sold by <span className="font-medium text-foreground">{product.vendor.name}</span>
                {product.vendor.isVerified && (
                    <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-800">✓</span>
                )}
            </div>

            <div className="mt-4 flex items-end">
                <p className="text-3xl tracking-tight text-foreground">
                    {product.pricing.currencySymbol}{product.pricing.currentPrice.toLocaleString()}
                </p>
                {product.pricing.discountPercentage > 0 && (
                    <>
                        <p className="ml-2 text-lg text-muted-foreground line-through">
                            {product.pricing.currencySymbol}{product.pricing.originalPrice.toLocaleString()}
                        </p>
                        <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                            -{product.pricing.discountPercentage}%
                        </span>
                    </>
                )}
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center">
                <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                        <svg
                            key={rating}
                            className={`h-5 w-5 flex-shrink-0 ${
                                product.rating.average > rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ))}
                </div>
                <p className="ml-2 text-sm text-muted-foreground">
                    {product.rating.average} ({product.rating.count} reviews)
                </p>
            </div>

            <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <p className="text-base text-muted-foreground">{product.description}</p>
            </div>

            {/* Key Features */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-foreground">Highlights</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {product.keyFeatures.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-10 flex gap-4">
                <Button size="lg" className="flex-1">Add to Cart</Button>
                <Button size="lg" variant="secondary" className="flex-1">Buy Now</Button>
            </div>

            {/* Metadata */}
            <div className="mt-8 border-t pt-8 text-xs text-muted-foreground">
                <p>SKU: {product.id.split('-').pop()}</p>
                <p>Category: <span className="capitalize">{product.categoryId}</span></p>
                {product.stockStatus === 'in_stock' ? (
                    <p className="text-green-600">In Stock ({product.stock} available)</p>
                ) : (
                    <p className="text-red-600 capitalize">{product.stockStatus.replace('_', ' ')}</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;