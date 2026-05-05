import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Mail,
  MoreVertical,
  Package,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUser } from '@/functions/get-user'
import { orpc } from '@/utils/orpc'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/admin/vendors' as any)({
  beforeLoad: async () => {
    const session = await getUser()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    const user = session.user as any
    if (user.role !== 'admin') {
      throw redirect({ to: '/' })
    }
    return { session }
  },
  component: AdminVendorsPage,
})

const ITEMS_PER_PAGE = 50

function AdminVendorsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Queries
  const { data, isLoading } = useQuery(
    orpc.admin.listVendors.queryOptions({
      input: {
        search: searchQuery || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      },
    }),
  )

  const { data: detailsData, isLoading: isDetailsLoading } = useQuery({
    ...orpc.admin.getVendorDetails.queryOptions({
      input: { id: selectedVendor! },
    }),
    enabled: !!selectedVendor && isDetailsOpen,
  })

  // Mutations
  const updateMutation = useMutation(
    orpc.admin.updateVendor.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.admin.listVendors.key(),
        })
        if (selectedVendor) {
          queryClient.invalidateQueries({
            queryKey: orpc.admin.getVendorDetails.key({ id: selectedVendor }),
          })
        }
        toast.success('Vendor updated successfully')
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const deleteMutation = useMutation(
    orpc.admin.deleteVendor.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.admin.listVendors.key(),
        })
        toast.success('Vendor profile deleted and user role reverted')
        setIsDeleteConfirmOpen(false)
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const toggleStatus = (id: string, currentlyActive: boolean) => {
    updateMutation.mutate({
      id,
      isActive: !currentlyActive,
    })
  }

  const toggleVerification = (id: string, currentlyVerified: boolean) => {
    updateMutation.mutate({
      id,
      isVerified: !currentlyVerified,
    })
  }

  const openDetails = (id: string) => {
    setSelectedVendor(id)
    setIsDetailsOpen(true)
  }

  const confirmDelete = (id: string, name: string) => {
    setVendorToDelete({ id, name })
    setIsDeleteConfirmOpen(true)
  }

  const totalPages = Math.ceil((data?.totalCount ?? 0) / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Store className="h-8 w-8 text-indigo-600" />
              Vendor Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Total {data?.totalCount ?? 0} active vendors on the platform.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by store name or owner email..."
                className="pl-10 border-slate-200 focus:ring-indigo-500 dark:border-slate-800"
              />
            </div>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Store
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Inventory
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!data ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading vendors...
                    </td>
                  </tr>
                ) : data.vendors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No vendors found.
                    </td>
                  </tr>
                ) : (
                  data.vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 font-black">
                            <Store className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {vendor.name}
                            </span>
                            <span className="text-[10px] font-black uppercase text-indigo-600">
                              ID: {vendor.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {vendor.ownerEmail}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {vendor.productCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border w-fit',
                              vendor.isActive
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-red-100 text-red-700 border-red-200',
                            )}
                          >
                            {vendor.isActive ? 'Active' : 'Suspended'}
                          </span>
                          {vendor.isVerified && (
                            <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider text-blue-600">
                              <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {new Date(vendor.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                              onClick={() => openDetails(vendor.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/vendors/${vendor.slug}` as any}
                                target="_blank"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" /> Visit
                                Public Store
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/admin/products` as any}
                                search={{ vendorId: vendor.id } as any}
                              >
                                <Package className="mr-2 h-4 w-4" /> View
                                Products
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                toggleVerification(vendor.id, vendor.isVerified)
                              }
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {vendor.isVerified
                                ? 'Unverify Vendor'
                                : 'Verify Vendor'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleStatus(vendor.id, vendor.isActive)
                              }
                            >
                              <Ban className="mr-2 h-4 w-4 text-red-600" />
                              <span className="text-red-600">
                                {vendor.isActive
                                  ? 'Suspend Vendor'
                                  : 'Activate Vendor'}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                confirmDelete(vendor.id, vendor.name)
                              }
                              className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Vendor
                              Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
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
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Store className="h-6 w-6 text-indigo-600" />
              Vendor Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive profile and store metrics.
            </DialogDescription>
          </DialogHeader>

          {!detailsData ? (
            <div className="py-12 text-center text-slate-500">
              Loading profile...
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="h-20 w-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                  {detailsData.vendor.logoUrl ? (
                    <img
                      src={detailsData.vendor.logoUrl}
                      alt={detailsData.vendor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-10 w-10 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {detailsData.vendor.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {detailsData.vendor.location}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                      @{detailsData.vendor.slug}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailStat
                  icon={User}
                  label="Owner"
                  value={detailsData.owner?.name || 'N/A'}
                />
                <DetailStat
                  icon={Mail}
                  label="Contact Email"
                  value={detailsData.owner?.email || 'N/A'}
                />
                <DetailStat
                  icon={Package}
                  label="Product Catalog"
                  value={`${detailsData.vendor.productCount} Items`}
                />
                <DetailStat
                  icon={Calendar}
                  label="Member Since"
                  value={new Date(
                    detailsData.vendor.joinedAt,
                  ).toLocaleDateString()}
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                  Description
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {detailsData.vendor.description ||
                    'No store description provided.'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="font-bold"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Remove Vendor Profile?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the store{' '}
              <strong>{vendorToDelete?.name}</strong>. The owner's user account
              will be downgraded to a Customer role. <strong>Warning:</strong>{' '}
              All products linked to this vendor may become inaccessible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="font-bold"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="font-bold"
              onClick={() =>
                vendorToDelete &&
                deleteMutation.mutate({ id: vendorToDelete.id })
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removing...' : 'Delete Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailStat({ icon: Icon, label, value }: any) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
      <div className="flex items-center gap-2 text-indigo-600 mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
        {value}
      </p>
    </div>
  )
}
