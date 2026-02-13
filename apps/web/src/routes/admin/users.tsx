import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Fingerprint,
  Mail,
  MoreVertical,
  Search,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  UserCheck,
  UserCog,
  UserX,
  Users,
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

export const Route = createFileRoute('/admin/users' as any)({
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
  component: AdminUsersPage,
})

const ITEMS_PER_PAGE = 50

function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Queries
  const { data, isLoading } = useQuery(
    orpc.admin.listUsers.queryOptions({
      input: {
        search: searchQuery || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      },
    }),
  )

  const { data: userDetails, isLoading: isDetailsLoading } = useQuery({
    ...orpc.admin.getUserDetails.queryOptions({ input: { id: selectedUser! } }),
    enabled: !!selectedUser && isDetailsOpen,
  })

  // Mutations
  const updateMutation = useMutation(
    orpc.admin.updateUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() })
        if (selectedUser) {
          queryClient.invalidateQueries({
            queryKey: orpc.admin.getUserDetails.key({ id: selectedUser }),
          })
        }
        toast.success('User updated successfully')
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const deleteMutation = useMutation(
    orpc.admin.deleteUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() })
        toast.success('User deleted successfully')
        setIsDeleteConfirmOpen(false)
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const toggleSuspension = (id: string, currentlyDeactivated: boolean) => {
    updateMutation.mutate({
      id,
      isDeactivated: !currentlyDeactivated,
    })
  }

  const changeRole = (id: string, newRole: 'customer' | 'vendor' | 'admin') => {
    updateMutation.mutate({
      id,
      role: newRole,
    })
  }

  const openDetails = (id: string) => {
    setSelectedUser(id)
    setIsDetailsOpen(true)
  }

  const confirmDelete = (id: string, name: string) => {
    setUserToDelete({ id, name })
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
              <Users className="h-8 w-8 text-indigo-600" />
              User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Total {data?.totalCount ?? 0} users registered on the platform.
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
                placeholder="Search users by name or email..."
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
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Role
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
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : data.users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  data.users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black">
                            {user.name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {user.name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                            user.role === 'vendor'
                              ? 'bg-emerald-100 text-emerald-700'
                              : user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700',
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border',
                            user.isDeactivated
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-green-100 text-green-700 border-green-200',
                          )}
                        >
                          <span
                            className={cn(
                              'mr-1.5 h-1.5 w-1.5 rounded-full',
                              user.isDeactivated
                                ? 'bg-red-600'
                                : 'bg-green-600',
                            )}
                          />
                          {user.isDeactivated ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => openDetails(user.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                changeRole(
                                  user.id,
                                  user.role === 'vendor'
                                    ? 'customer'
                                    : 'vendor',
                                )
                              }
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Change to{' '}
                              {user.role === 'vendor' ? 'Customer' : 'Vendor'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleSuspension(user.id, user.isDeactivated)
                              }
                            >
                              {user.isDeactivated ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />{' '}
                                  Activate Account
                                </>
                              ) : (
                                <>
                                  <UserX className="mr-2 h-4 w-4 text-red-600" />{' '}
                                  <span className="text-red-600">
                                    Suspend Account
                                  </span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => confirmDelete(user.id, user.name)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
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
            <DialogTitle className="text-2xl font-black tracking-tight">
              User Details
            </DialogTitle>
            <DialogDescription>
              Full account information and statistics.
            </DialogDescription>
          </DialogHeader>

          {!userDetails ? (
            <div className="py-12 text-center text-slate-500">
              Loading details...
            </div>
          ) : (
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                  {userDetails.user.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{userDetails.user.name}</h3>
                  <p className="text-sm text-slate-500">
                    {userDetails.user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <Fingerprint className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Account ID
                    </span>
                  </div>
                  <p className="text-sm font-mono font-medium truncate">
                    {userDetails.user.id}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Join Date
                    </span>
                  </div>
                  <p className="text-sm font-bold">
                    {new Date(userDetails.user.createdAt).toLocaleDateString(
                      'en-US',
                      { dateStyle: 'long' },
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Total Orders
                    </span>
                  </div>
                  <p className="text-2xl font-black">
                    {userDetails.stats.totalOrders}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Current Status
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        userDetails.user.isDeactivated
                          ? 'bg-red-600'
                          : 'bg-green-600',
                      )}
                    />
                    <p className="text-sm font-bold">
                      {userDetails.user.isDeactivated ? 'Suspended' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete Account Permanently?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the account for{' '}
              <strong>{userToDelete?.name}</strong>? This action cannot be
              undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                userToDelete && deleteMutation.mutate({ id: userToDelete.id })
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
