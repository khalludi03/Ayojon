import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  UserCog, 
  ShieldAlert, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Mail,
  Calendar,
  Package,
  ArrowLeft
} from 'lucide-react';
import { orpc } from '@/utils/orpc';
import { getUser } from '@/functions/get-user';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/users' as any)({
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    const user = session.user as any;
    if (user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const limit = 50;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  
  const queryClient = useQueryClient();

  const { data: testCount } = useQuery(orpc.testUserCount.queryOptions());

  const { data, isLoading, error } = useQuery(
    orpc.listUsers.queryOptions({ 
      limit, 
      offset: page * limit, 
      search: search || undefined 
    })
  );

  if (error) {
    console.error("User list error:", error);
  }

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const { data: userDetails, isLoading: isLoadingDetails } = useQuery({
    ...orpc.getUserDetails.queryOptions({ id: selectedUser?.id ?? '' }),
    enabled: !!selectedUser && isDetailsOpen,
  });

  const toggleStatusMutation = useMutation(orpc.toggleUserStatus.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.listUsers.queryKey() });
      toast.success('User status updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    }
  }));

  const updateRoleMutation = useMutation(orpc.updateUserRole.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.listUsers.queryKey() });
      toast.success('User role updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update role');
    }
  }));

  const deleteUserMutation = useMutation(orpc.deleteUser.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.listUsers.queryKey() });
      toast.success('User deleted successfully');
      setIsDeleteOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user');
    }
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/admin/dashboard" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-indigo-600" />
              User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              View and manage all platform accounts. Total in DB: {testCount?.count ?? '...'}
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-20 bg-slate-50/50 dark:bg-slate-900/20" />
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 shadow-sm">
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-xs">
                              {user.name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</span>
                            <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn(
                          "uppercase text-[10px] font-black tracking-widest px-2 py-0.5 border-none",
                          user.role === 'admin' ? "bg-amber-100 text-amber-700" :
                          user.role === 'vendor' ? "bg-emerald-100 text-emerald-700" :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-bold px-2 py-0.5",
                          user.isDeactivated 
                            ? "border-red-200 bg-red-50 text-red-600" 
                            : "border-emerald-200 bg-emerald-50 text-emerald-600"
                        )}>
                          {user.isDeactivated ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ 
                              id: user.id, 
                              role: user.role === 'vendor' ? 'customer' : 'vendor' 
                            })}>
                              <UserCog className="mr-2 h-4 w-4" /> 
                              {user.role === 'vendor' ? 'Make Customer' : 'Make Vendor'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={user.isDeactivated ? "text-emerald-600" : "text-amber-600"}
                              onClick={() => toggleStatusMutation.mutate({ 
                                id: user.id, 
                                isDeactivated: !user.isDeactivated 
                              })}
                            >
                              {user.isDeactivated ? (
                                <><UserCheck className="mr-2 h-4 w-4" /> Reactivate</>
                              ) : (
                                <><ShieldAlert className="mr-2 h-4 w-4" /> Suspend</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:bg-red-50"
                              onClick={() => { setUserToDelete(user); setIsDeleteOpen(true); }}
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
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
            <div className="flex flex-col">
              <p className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-white">{users.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{total}</span> users
              </p>
              {error && <p className="text-xs text-red-500 font-bold mt-1">Error: {(error as any).message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 0} 
                onClick={() => setPage(p => p - 1)}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = i; // Simplified pagination for now
                  return (
                    <Button 
                      key={i}
                      variant={page === pageNum ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={cn("h-8 w-8 p-0 font-bold", page === pageNum && "bg-indigo-600 text-white")}
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages - 1} 
                onClick={() => setPage(p => p + 1)}
                className="h-8 px-2"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
          <div className="bg-indigo-600 h-24 relative">
             <div className="absolute -bottom-10 left-8">
               <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-lg">
                  <AvatarImage src={selectedUser?.image} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-2xl">
                    {selectedUser?.name?.[0].toUpperCase()}
                  </AvatarFallback>
               </Avatar>
             </div>
          </div>
          <div className="pt-12 p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedUser?.name}</h2>
              <p className="text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" /> {selectedUser?.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</p>
                <Badge className={cn(
                  "uppercase text-[10px] font-black tracking-widest border-none",
                  selectedUser?.role === 'admin' ? "bg-amber-100 text-amber-700" :
                  selectedUser?.role === 'vendor' ? "bg-emerald-100 text-emerald-700" :
                  "bg-blue-100 text-blue-700"
                )}>
                  {selectedUser?.role}
                </Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <Badge variant="outline" className={cn(
                  "text-[10px] font-bold",
                  selectedUser?.isDeactivated 
                    ? "border-red-200 bg-red-50 text-red-600" 
                    : "border-emerald-200 bg-emerald-50 text-emerald-600"
                )}>
                  {selectedUser?.isDeactivated ? 'Suspended' : 'Active'}
                </Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Member Since
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedUser && new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Total Orders
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isLoadingDetails ? "..." : userDetails?.orderCount ?? 0}
                </p>
              </div>
            </div>

            <div className="space-y-3">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Information</p>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs py-2 border-b border-slate-50 dark:border-slate-800">
                   <span className="text-slate-500 font-medium">User ID</span>
                   <span className="text-slate-900 dark:text-white font-mono">{selectedUser?.id}</span>
                 </div>
                 <div className="flex justify-between text-xs py-2 border-b border-slate-50 dark:border-slate-800">
                   <span className="text-slate-500 font-medium">Email Verified</span>
                   <span className={cn("font-bold", selectedUser?.emailVerified ? "text-emerald-600" : "text-amber-600")}>
                     {selectedUser?.emailVerified ? 'Yes' : 'No'}
                   </span>
                 </div>
               </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-50 dark:bg-slate-900/50 p-6">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" /> Delete Account
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{userToDelete?.name}</span>'s account? 
              This action is permanent and cannot be undone. All user data, orders, and sessions will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteUserMutation.mutate({ id: userToDelete.id })}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}