import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import type { VendorProduct, ProductStatus, ProductType } from '@/types/vendor-product';
import { AddProductForm } from './AddProductForm';
import { EnhancedProductsTable } from './EnhancedProductsTable';
import { cn } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

type SortField = 'name' | 'price' | 'stock' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const CATEGORIES = [
  'Apparel & Accessories',
  'Jewelry & Watches',
  'Home & Living',
  'Electronics',
  'Beauty & Personal Care',
  'Art & Collectibles',
  'Toys & Games',
  'Sports & Outdoors',
];

const ITEMS_PER_PAGE = 20;

export function VendorProductsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Show filters
  const [showFilters, setShowFilters] = useState(false);

  // Bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Fetch products from API
  const { data: apiProducts = [], isLoading, refetch } = useQuery(
    orpc.product.listMyProducts.queryOptions({
      input: { limit: 100, offset: 0 },
    })
  );

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
      category: '', // TODO: Map categoryId to category name
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

  const handleToggleStatus = (product: VendorProduct) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    updateStatusMutation.mutate({ id: product.id, status: newStatus });
  };

  const handleDeleteProduct = (productId: string) => {
    deleteMutation.mutate({ id: productId });
  };

  const handleUpdatePrice = (productId: string, price: number) => {
    updateStatusMutation.mutate({ id: productId, price: price.toString() });
  };

  const handleUpdateStock = (productId: string, stock: number) => {
    updateStatusMutation.mutate({ id: productId, stock });
  };

  // Filter, sort, and paginate products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter((p) => p.productType === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'price':
          aVal = a.purchaseDetails?.regularPrice || a.rentalDetails?.dailyRate || 0;
          bVal = b.purchaseDetails?.regularPrice || b.rentalDetails?.dailyRate || 0;
          break;
        case 'stock':
          aVal = a.purchaseDetails?.quantity || a.rentalDetails?.quantityAvailable || 0;
          bVal = b.purchaseDetails?.quantity || b.rentalDetails?.quantityAvailable || 0;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchQuery, categoryFilter, statusFilter, typeFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, typeFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkActivate = () => {
    selectedProducts.forEach((productId) => {
      updateStatusMutation.mutate({ id: productId, status: 'active' });
    });
    setSelectedProducts(new Set());
  };

  const handleBulkDeactivate = () => {
    selectedProducts.forEach((productId) => {
      updateStatusMutation.mutate({ id: productId, status: 'draft' });
    });
    setSelectedProducts(new Set());
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    selectedProducts.forEach((productId) => {
      deleteMutation.mutate({ id: productId });
    });
    setSelectedProducts(new Set());
    setShowBulkDeleteConfirm(false);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleEditProduct = (product: VendorProduct) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (typeFilter ? 1 : 0);

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <AddProductForm
            onClose={handleCloseForm}
            onSuccess={() => {
              setShowAddForm(false);
              refetch();
            }}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent"></div>
        <span className="ml-3 text-[hsl(var(--muted-foreground))]">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Products</h1>
            <Button onClick={handleAddProduct} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Manage your product catalog ({filteredAndSortedProducts.length} product
            {filteredAndSortedProducts.length !== 1 ? 's' : ''})
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, or brand..."
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-[hsl(var(--primary))] text-white rounded">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    Product Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as ProductType | '')}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  >
                    <option value="">All Types</option>
                    <option value="purchase">Purchase</option>
                    <option value="rental">Rental</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    Sort By
                  </label>
                  <select
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortField(field as SortField);
                      setSortOrder(order as SortOrder);
                    }}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="stock-asc">Stock (Low to High)</option>
                    <option value="stock-desc">Stock (High to Low)</option>
                    <option value="createdAt-desc">Date Added (Newest)</option>
                    <option value="createdAt-asc">Date Added (Oldest)</option>
                  </select>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="mb-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                  Activate
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                  Deactivate
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <EnhancedProductsTable
          products={paginatedProducts}
          selectedProducts={selectedProducts}
          onSelectAll={handleSelectAll}
          onSelectProduct={handleSelectProduct}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onToggleStatus={handleToggleStatus}
          onUpdatePrice={handleUpdatePrice}
          onUpdateStock={handleUpdateStock}
          onRefresh={refetch}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedProducts.length)} of{' '}
              {filteredAndSortedProducts.length} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 py-1 text-sm text-[hsl(var(--muted-foreground))]">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Products"
        description={`Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone and these products will be permanently removed from your catalog.`}
        confirmText="Delete Products"
        variant="destructive"
      />
    </div>
  );
}
