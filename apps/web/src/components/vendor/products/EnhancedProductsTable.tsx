import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Eye, Package, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorProduct } from '@/types/vendor-product';

interface EnhancedProductsTableProps {
  products: VendorProduct[];
  selectedProducts: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectProduct: (productId: string, checked: boolean) => void;
  onEdit: (product: VendorProduct) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (product: VendorProduct) => void;
  onUpdatePrice: (productId: string, price: number) => void;
  onUpdateStock: (productId: string, stock: number) => void;
  onRefresh: () => void;
  onSort: (field: 'name' | 'price' | 'stock' | 'createdAt') => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
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

const getStatusLabel = (product: VendorProduct): string => {
  const stock = product.purchaseDetails?.quantity || product.rentalDetails?.quantityAvailable || 0;

  if (product.status === 'draft') return 'Draft';
  if (product.status === 'archived') return 'Archived';
  if (stock === 0) return 'Out of Stock';
  return 'Active';
};

export function EnhancedProductsTable({
  products,
  selectedProducts,
  onSelectAll,
  onSelectProduct,
  onEdit,
  onDelete,
  onToggleStatus,
  onUpdatePrice,
  onUpdateStock,
  onRefresh,
  onSort,
  sortField,
  sortOrder,
}: EnhancedProductsTableProps) {
  const [editingPrice, setEditingPrice] = useState<{ productId: string; value: string } | null>(null);
  const [editingStock, setEditingStock] = useState<{ productId: string; value: string } | null>(null);

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      onDelete(productId);
    }
  };

  const handleToggleStatus = (product: VendorProduct) => {
    onToggleStatus(product);
  };

  const handleSavePriceEdit = (product: VendorProduct) => {
    if (!editingPrice) return;

    const newPrice = parseFloat(editingPrice.value);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    onUpdatePrice(product.id, newPrice);
    setEditingPrice(null);
  };

  const handleSaveStockEdit = (product: VendorProduct) => {
    if (!editingStock) return;

    const newStock = parseInt(editingStock.value);
    if (isNaN(newStock) || newStock < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }

    onUpdateStock(product.id, newStock);
    setEditingStock(null);
  };

  const SortButton = ({ field, children }: { field: 'name' | 'price' | 'stock' | 'createdAt'; children: React.ReactNode }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-[hsl(var(--foreground))] transition-colors"
    >
      {children}
      {sortField === field && (
        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      )}
    </button>
  );

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
        <Package className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
          No products found
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  const allSelected = products.length > 0 && products.every((p) => selectedProducts.has(p.id));
  const someSelected = products.some((p) => selectedProducts.has(p.id)) && !allSelected;

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
              <th className="p-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Product
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                <SortButton field="name">SKU</SortButton>
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Category
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Type
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                <SortButton field="price">Price/Rate</SortButton>
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                <SortButton field="stock">Stock</SortButton>
              </th>
              <th className="p-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Status
              </th>
              <th className="p-3 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {products.map((product) => {
              const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
              const price = product.purchaseDetails?.regularPrice || product.rentalDetails?.dailyRate || 0;
              const stock = product.purchaseDetails?.quantity || product.rentalDetails?.quantityAvailable || 0;
              const isEditingPrice = editingPrice?.productId === product.id;
              const isEditingStock = editingStock?.productId === product.id;

              return (
                <tr
                  key={product.id}
                  className={cn(
                    'hover:bg-[hsl(var(--muted))]/30 transition-colors',
                    selectedProducts.has(product.id) && 'bg-[hsl(var(--muted))]/50'
                  )}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={(e) => onSelectProduct(product.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={product.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-[hsl(var(--muted))] flex items-center justify-center">
                          <Package className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-[hsl(var(--muted-foreground))]">{product.sku}</td>
                  <td className="p-3 text-sm text-[hsl(var(--foreground))]">{product.category}</td>
                  <td className="p-3 text-sm text-[hsl(var(--foreground))]">
                    {getProductTypeLabel(product)}
                  </td>
                  <td className="p-3">
                    {isEditingPrice ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editingPrice.value}
                          onChange={(e) => setEditingPrice({ ...editingPrice, value: e.target.value })}
                          className="h-8 w-24 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePriceEdit(product)}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingPrice(null)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingPrice({ productId: product.id, value: price.toString() })}
                        className="text-sm font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] cursor-pointer"
                      >
                        ৳{price.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditingStock ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editingStock.value}
                          onChange={(e) => setEditingStock({ ...editingStock, value: e.target.value })}
                          className="h-8 w-20 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveStockEdit(product)}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingStock(null)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingStock({ productId: product.id, value: stock.toString() })}
                        className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] cursor-pointer"
                      >
                        {stock}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                        getStatusColor(product.status),
                        stock === 0 && product.status === 'active' && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      )}
                    >
                      {getStatusLabel(product)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(product)}
                        title={product.status === 'active' ? 'Unpublish' : 'Publish'}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(product)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
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
      <div className="lg:hidden divide-y divide-[hsl(var(--border))]">
        {products.map((product) => {
          const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
          const price = product.purchaseDetails?.regularPrice || product.rentalDetails?.dailyRate || 0;
          const stock = product.purchaseDetails?.quantity || product.rentalDetails?.quantityAvailable || 0;

          return (
            <div key={product.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={(e) => onSelectProduct(product.id, e.target.checked)}
                  className="mt-1 w-4 h-4 cursor-pointer shrink-0"
                />
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={product.name}
                    className="h-16 w-16 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                    <Package className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{product.brand}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">SKU: {product.sku}</p>
                  <div className="mt-1">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                        getStatusColor(product.status),
                        stock === 0 && product.status === 'active' && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      )}
                    >
                      {getStatusLabel(product)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs block">Type</span>
                  <span className="font-medium text-xs">{getProductTypeLabel(product)}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs block">Price</span>
                  <span className="font-medium">৳{price.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs block">Stock</span>
                  <span className="font-medium">{stock}</span>
                </div>
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
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(product)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
