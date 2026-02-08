import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Mail,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Shield,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { getUser } from '@/functions/get-user';
import { orpc } from '@/utils/orpc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/vendor-applications' as any)({
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
  component: VendorApplicationsPage,
});

const ITEMS_PER_PAGE = 50;

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', icon: Clock, color: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800' },
  suspended: { label: 'Suspended', icon: Ban, color: 'bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-800' },
};

function VendorApplicationsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Queries - fetch users with server-side vendor status filtering
  const { data: usersData, isLoading } = useQuery(orpc.admin.listUsers.queryOptions({
    input: {
      search: searchQuery || undefined,
      vendorStatus: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
    }
  }));

  // Fetch stats for each vendor status
  const { data: pendingStats } = useQuery(orpc.admin.listUsers.queryOptions({
    input: { vendorStatus: 'pending', limit: 1, offset: 0 }
  }));
  const { data: approvedStats } = useQuery(orpc.admin.listUsers.queryOptions({
    input: { vendorStatus: 'approved', limit: 1, offset: 0 }
  }));
  const { data: rejectedStats } = useQuery(orpc.admin.listUsers.queryOptions({
    input: { vendorStatus: 'rejected', limit: 1, offset: 0 }
  }));
  const { data: suspendedStats } = useQuery(orpc.admin.listUsers.queryOptions({
    input: { vendorStatus: 'suspended', limit: 1, offset: 0 }
  }));

  const stats = {
    pending: pendingStats?.totalCount ?? 0,
    approved: approvedStats?.totalCount ?? 0,
    rejected: rejectedStats?.totalCount ?? 0,
    suspended: suspendedStats?.totalCount ?? 0,
  };

  // Mutations
  const updateStatusMutation = useMutation(orpc.admin.updateVendorApplicationStatus.mutationOptions({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() });
      const statusMessages = {
        approved: 'Vendor application approved successfully',
        rejected: 'Vendor application rejected',
        suspended: 'Vendor account suspended',
      };
      toast.success(statusMessages[variables.vendorStatus]);
      setActionDialog(null);
      setActionReason('');
      setSelectedApplication(null);
    },
    onError: (error) => toast.error(error.message),
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const openActionDialog = (application: any, action: 'approve' | 'reject' | 'suspend') => {
    setSelectedApplication(application);
    setActionDialog(action);
    setActionReason('');
  };

  const handleAction = () => {
    if (!selectedApplication || !actionDialog) return;

    updateStatusMutation.mutate({
      userId: selectedApplication.id,
      vendorStatus: actionDialog === 'approve' ? 'approved' : actionDialog === 'reject' ? 'rejected' : 'suspended',
      reason: actionReason || undefined,
    });
  };

  const applications = usersData?.users ?? [];
  const totalPages = Math.ceil((usersData?.totalCount ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Vendor Applications
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium ml-[52px]">
              Review and manage vendor registration requests
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() })}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Pending Review"
            value={stats.pending}
            icon={Clock}
            color="bg-gradient-to-br from-yellow-500 to-amber-600"
          />
          <StatsCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatsCard
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="bg-gradient-to-br from-red-500 to-rose-600"
          />
          <StatsCard
            label="Suspended"
            value={stats.suspended}
            icon={Ban}
            color="bg-gradient-to-br from-gray-500 to-slate-600"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-12 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="pending">🟡 Pending Review</SelectItem>
                <SelectItem value="approved">🟢 Approved</SelectItem>
                <SelectItem value="rejected">🔴 Rejected</SelectItem>
                <SelectItem value="suspended">⚫ Suspended</SelectItem>
                <SelectItem value="all">All Statuses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Applicant</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Applied Date</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                      <p className="text-slate-500 font-medium">Loading applications...</p>
                    </div>
                  </td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Store className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold mb-1">No applications found</p>
                        <p className="text-sm text-slate-500">Try adjusting your filters</p>
                      </div>
                    </div>
                  </td></tr>
                ) : applications.map((application) => {
                  const statusConfig = STATUS_CONFIG[application.vendorStatus as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig?.icon || AlertCircle;

                  return (
                    <tr key={application.id} className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/30 dark:hover:from-purple-950/20 dark:hover:to-pink-950/10 transition-all duration-200">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                            {application.name[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {application.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                              <Mail className="h-3 w-3" />
                              {application.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider border-2 shadow-sm transition-all",
                          statusConfig?.color
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig?.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {application.vendorStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => openActionDialog(application, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 px-3"
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionDialog(application, 'reject')}
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20 rounded-lg h-8 px-3"
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Reject
                              </Button>
                            </>
                          )}
                          {application.vendorStatus === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionDialog(application, 'suspend')}
                              className="text-gray-600 border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950/20 rounded-lg h-8 px-3"
                            >
                              <Ban className="h-3.5 w-3.5 mr-1.5" />
                              Suspend
                            </Button>
                          )}
                          {(application.vendorStatus === 'rejected' || application.vendorStatus === 'suspended') && (
                            <Button
                              size="sm"
                              onClick={() => openActionDialog(application, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 px-3"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                              Re-approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="rounded-lg disabled:opacity-50 h-9 px-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="rounded-lg disabled:opacity-50 h-9 px-4"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {actionDialog === 'approve' && '✅ Approve Vendor Application'}
              {actionDialog === 'reject' && '❌ Reject Vendor Application'}
              {actionDialog === 'suspend' && '⛔ Suspend Vendor Account'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog === 'approve' && `Approve ${selectedApplication?.name} as a vendor? They will gain access to the vendor dashboard.`}
              {actionDialog === 'reject' && `Reject ${selectedApplication?.name}'s vendor application? They will be notified of this decision.`}
              {actionDialog === 'suspend' && `Suspend ${selectedApplication?.name}'s vendor account? They will lose access to vendor features.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder={`Enter reason for ${actionDialog}...`}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="rounded-xl"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActionDialog(null)} className="rounded-lg">
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={updateStatusMutation.isPending}
              className={cn(
                "rounded-lg",
                actionDialog === 'approve' && "bg-green-600 hover:bg-green-700",
                actionDialog === 'reject' && "bg-red-600 hover:bg-red-700",
                actionDialog === 'suspend' && "bg-gray-600 hover:bg-gray-700"
              )}
            >
              {updateStatusMutation.isPending ? 'Processing...' : `Confirm ${actionDialog}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("p-3 rounded-xl shadow-lg", color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {value.toLocaleString()}
          </p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
        </div>
      </div>
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", color)} />
    </div>
  );
}
