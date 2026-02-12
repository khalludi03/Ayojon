import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Store,
  Tag,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Zap,
  Flame,
  Clock
} from 'lucide-react';
import { getUser } from '@/functions/get-user';
import { orpc } from '@/utils/orpc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/products' as any)({
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    const user = session.user as any;
    if (user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
    return { session };
  },
  component: AdminProductsPage,
});

const ITEMS_PER_PAGE = 50;

function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState<{id: string, title: string} | null>(null);
  const [removeReason, setRemoveReason] = useState('policy_violation');

  // Queries
  const { data, isLoading } = useQuery(orpc.admin.listAllProducts.queryOptions({
    input: {
      search: searchQuery || undefined,
      vendorId: vendorFilter !== 'all' ? vendorFilter : undefined,
      categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
    }
  }));

  // Helper Queries for Filters
  const { data: vendorsData } = useQuery(orpc.admin.listVendors.queryOptions({ input: { limit: 100 } }));

  const promotionsMutation = useMutation(orpc.admin.updateProductPromotions.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.admin.listAllProducts.key() });
      toast.success('Homepage section updated');
    },
    onError: (error) => toast.error(error.message),
  }));

  // Mutations
  const removeMutation = useMutation(orpc.admin.adminDeleteProduct.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.admin.listAllProducts.key() });
      toast.success('Product removed successfully');
      setIsRemoveDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const openRemoveDialog = (id: string, title: string) => {
    setProductToRemove({ id, title });
    setIsRemoveDialogOpen(true);
  };

  const toggleFeatured = (id: string, current: boolean) => {
    promotionsMutation.mutate({ id, isFeatured: !current });
  };

  const toggleDealType = (id: string, currentDealType: string | null | undefined, nextType: 'flash' | 'hot') => {
    const nextValue = currentDealType === nextType ? null : nextType;
    promotionsMutation.mutate({ id, dealType: nextValue });
  };

  const totalPages = Math.ceil((data?.totalCount ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Package className="h-8 w-8 text-indigo-600" />
              Product Oversight
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Monitoring {data?.totalCount ?? 0} active listings across the platform.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or vendors..."
                className="pl-10 border-slate-200 focus:ring-indigo-500 dark:border-slate-800"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendorsData?.vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="decorations">Decorations</SelectItem>
                  <SelectItem value="sound-lighting">Sound & Lighting</SelectItem>
                  <SelectItem value="furniture-tents">Furniture & Tents</SelectItem>
                  <SelectItem value="catering-equipment">Catering</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8">
                Filter
              </Button>
            </div>
          </form>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Vendor</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Homepage</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading products...</td></tr>
                ) : data?.products.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No products matching your filters.</td></tr>
                ) : data?.products.map((product) => (
                  <tr key={product.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{product.title}</span>
                          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-tighter">{product.categoryName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Store className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{product.vendorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-900 dark:text-white">৳{parseFloat(product.price).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                        product.status === 'active' 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", product.status === 'active' ? "bg-green-600" : "bg-slate-400")} />
                        {product.status === 'active' ? 'Published' : product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={product.isFeatured ? 'default' : 'outline'}
                          onClick={() => toggleFeatured(product.id, !!product.isFeatured)}
                          className={cn(
                            "h-8 min-w-[110px] justify-center gap-1.5 px-3 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800",
                            product.isFeatured && "bg-indigo-600 hover:bg-indigo-700 text-white"
                          )}
                          title={product.isFeatured ? 'Remove from Featured Products' : 'Add to Featured Products'}
                          aria-pressed={!!product.isFeatured}
                          disabled={promotionsMutation.isPending}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Featured
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant={product.dealType === 'flash' ? 'default' : 'outline'}
                          onClick={() => toggleDealType(product.id, product.dealType, 'flash')}
                          className={cn(
                            "h-8 min-w-[120px] justify-center gap-1.5 px-3 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800",
                            product.dealType === 'flash' && "bg-amber-600 hover:bg-amber-700 text-white"
                          )}
                          title={product.dealType === 'flash' ? 'Remove from Flash Deals' : 'Add to Flash Deals'}
                          aria-pressed={product.dealType === 'flash'}
                          disabled={promotionsMutation.isPending}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          Flash Deals
                        </Button>

                        {product.dealType === 'flash' && (
                          <div className="flex items-center gap-1 ml-1">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <input
                              type="datetime-local"
                              defaultValue={product.dealEndsAt ? new Date(new Date(product.dealEndsAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                              className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 h-6 focus:ring-1 focus:ring-amber-500 outline-none"
                              onBlur={(e) => {
                                const newDate = e.target.value ? new Date(e.target.value) : null;
                                if (newDate && (!product.dealEndsAt || new Date(product.dealEndsAt).getTime() !== newDate.getTime())) {
                                  promotionsMutation.mutate({ id: product.id, dealEndsAt: newDate });
                                }
                              }}
                            />
                          </div>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant={product.dealType === 'hot' ? 'default' : 'outline'}
                          onClick={() => toggleDealType(product.id, product.dealType, 'hot')}
                          className={cn(
                            "h-8 min-w-[110px] justify-center gap-1.5 px-3 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800",
                            product.dealType === 'hot' && "bg-rose-600 hover:bg-rose-700 text-white"
                          )}
                          title={product.dealType === 'hot' ? 'Remove from Hot Deals' : 'Add to Hot Deals'}
                          aria-pressed={product.dealType === 'hot'}
                          disabled={promotionsMutation.isPending}
                        >
                          <Flame className="h-3.5 w-3.5" />
                          Hot Deals
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link to={`/product/${product.slug}` as any} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" /> View Product
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <Edit className="mr-2 h-4 w-4" /> Edit (Impersonate)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openRemoveDialog(product.id, product.title)}
                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Product Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Remove Listing?
            </DialogTitle>
            <DialogDescription>
              You are removing <strong>{productToRemove?.title}</strong> from the marketplace. This will notify the vendor and hide the product from all customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Reason for Removal</label>
              <Select value={removeReason} onValueChange={setRemoveReason}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy_violation">Policy Violation</SelectItem>
                  <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                  <SelectItem value="spam">Spam / Duplicate</SelectItem>
                  <SelectItem value="vendor_request">Vendor Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="font-bold" onClick={() => setIsRemoveDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              className="font-bold px-8"
              onClick={() => productToRemove && removeMutation.mutate({ 
                id: productToRemove.id, 
                reason: removeReason 
              })}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removing..." : "Confirm Removal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
