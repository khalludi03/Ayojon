import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorProduct } from '@/types/vendor-product';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ProductsListProps {
  products: VendorProduct[];
  onEdit: (product: VendorProduct) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (product: VendorProduct) => void;
  onRefresh: () => void;
}

const getStatusColor = (status: VendorProduct['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'archived':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getProductTypeLabel = (product: VendorProduct) => {
  if (product.productType === 'both') return 'Purchase & Rental';
  return product.productType.charAt(0).toUpperCase() + product.productType.slice(1);
};

export function ProductsList({ products, onEdit, onDelete, onToggleStatus, onRefresh }: ProductsListProps) {
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleDelete = (productId: string) => {
    setProductToDelete(productId);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete);
      setProductToDelete(null);
    }
  };

  const handleToggleStatus = (product: VendorProduct) => {
    onToggleStatus(product);
  };

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
        <Package className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
          No products yet
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Get started by adding your first product
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Product
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                SKU
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Type
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Price
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Stock
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Status
              </th>
              <th className="pb-3 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {products.map((product) => {
              const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
              const price = product.purchaseDetails?.regularPrice || product.rentalDetails?.dailyRate || 0;
              const stock = product.purchaseDetails?.quantity || product.rentalDetails?.quantityAvailable || 0;

              return (
                <tr key={product.id} className="hover:bg-[hsl(var(--muted))]/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {primaryImage && (
                        <img
                          src={primaryImage.url}
                          alt={product.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                          {product.name}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-[hsl(var(--muted-foreground))]">
                    {product.sku}
                  </td>
                  <td className="py-4 text-sm text-[hsl(var(--foreground))]">
                    {getProductTypeLabel(product)}
                  </td>
                  <td className="py-4 text-sm font-medium text-[hsl(var(--foreground))]">
                    ৳{price.toLocaleString()}
                  </td>
                  <td className="py-4 text-sm text-[hsl(var(--muted-foreground))]">
                    {stock}
                  </td>
                  <td className="py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                        getStatusColor(product.status)
                      )}
                    >
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(product)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {product.status === 'active' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {products.map((product) => {
          const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
          const price = product.purchaseDetails?.regularPrice || product.rentalDetails?.dailyRate || 0;
          const stock = product.purchaseDetails?.quantity || product.rentalDetails?.quantityAvailable || 0;

          return (
            <div
              key={product.id}
              className="rounded-lg border border-[hsl(var(--border))] p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                {primaryImage && (
                  <img
                    src={primaryImage.url}
                    alt={product.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{product.brand}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">SKU: {product.sku}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-1 text-xs font-semibold shrink-0',
                    getStatusColor(product.status)
                  )}
                >
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">
                  {getProductTypeLabel(product)}
                </span>
                <span className="font-medium">৳{price.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleToggleStatus(product)}
                >
                  {product.status === 'active' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmationDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and the product will be removed from your catalog."
        confirmText="Delete Product"
        variant="destructive"
      />
    </div>
  );
}
