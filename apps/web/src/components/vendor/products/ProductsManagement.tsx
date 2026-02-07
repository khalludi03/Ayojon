import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { getVendorProducts } from '@/stores/vendor-product-store';
import type { VendorProduct } from '@/types/vendor-product';
import { ProductsList } from './ProductsList';

export function ProductsManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<VendorProduct[]>([]);

  // Mock vendor ID - in real app, get from auth context
  const vendorId = 'vendor-1';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const vendorProducts = getVendorProducts(vendorId);
    setProducts(vendorProducts);
  };

  const handleEditProduct = (product: VendorProduct) => {
    // Navigate to full products page in edit mode
    navigate({ to: '/vendor/products' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Products Overview</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Quick view of your product catalog
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: '/vendor/products' })}>
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button onClick={() => navigate({ to: '/vendor/products' })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products List (limited view) */}
      <ProductsList
        products={products.slice(0, 5)}
        onEdit={handleEditProduct}
        onRefresh={loadProducts}
      />

      {products.length > 5 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate({ to: '/vendor/products' })}>
            View All {products.length} Products
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
