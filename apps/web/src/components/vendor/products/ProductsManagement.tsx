import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import type { VendorProduct, ProductStatus } from '@/types/vendor-product';
import { ProductsList } from './ProductsList';

export function ProductsManagement() {
  const navigate = useNavigate();

  // Fetch products from API
  const { data: apiProducts = [], isLoading, refetch } = useQuery(
    orpc.product.listMyProducts.queryOptions({
      input: { limit: 5, offset: 0 },
    })
  );

  // Update product status mutation
  const updateStatusMutation = useMutation(
    orpc.product.updateProduct.mutationOptions({
      onSuccess: () => {
        toast.success('Product updated');
        refetch();
      },
      onError: (error: any) => {
        toast.error('Failed to update product');
        console.error('Update error:', error);
      },
    })
  );

  // Delete product mutation
  const deleteMutation = useMutation(
    orpc.product.deleteProduct.mutationOptions({
      onSuccess: () => {
        toast.success('Product deleted successfully');
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to delete product');
        console.error('Delete error:', error);
      },
    })
  );

  const handleToggleStatus = (product: VendorProduct) => {
    const newStatus = product.status === 'published' ? 'draft' : 'active';
    updateStatusMutation.mutate({ id: product.id, status: newStatus as any });
  };

  const handleDeleteProduct = (productId: string) => {
    deleteMutation.mutate({ id: productId });
  };

  // Map API products to VendorProduct format for UI compatibility
  const products: VendorProduct[] = useMemo(() => {
    return apiProducts.map((p: any) => ({
      id: p.id,
      vendorId: p.vendorId,
      name: p.title,
      brand: p.brand || '',
      sku: p.sku || '',
      description: p.description,
      shortDescription: p.descriptionShort || '',
      category: p.categoryId,
      subcategory: '',
      eventTypes: [],
      productType: 'purchase' as const,
      purchaseDetails: {
        regularPrice: parseFloat(p.price) || 0,
        salePrice: p.salePrice ? parseFloat(p.salePrice) : undefined,
        quantity: p.stock || 0,
      },
      images: p.images || [],
      specifications: [],
      shipping: {
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        isFragile: p.isFragile || false,
        requiresSetup: p.setupRequired || false,
      },
      status: p.status as ProductStatus,
      createdAt: p.createdAt?.toString() || new Date().toISOString(),
      updatedAt: p.updatedAt?.toString() || new Date().toISOString(),
    }));
  }, [apiProducts]);

  const handleEditProduct = (product: VendorProduct) => {
    // Navigate to full products page
    navigate({ to: '/vendor/products' });
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))]">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        <span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">Loading inventory...</span>
      </div>
    );
  }

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
        onDelete={handleDeleteProduct}
        onToggleStatus={handleToggleStatus}
        onRefresh={refetch}
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
