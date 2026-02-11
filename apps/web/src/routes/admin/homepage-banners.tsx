import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  X,
} from 'lucide-react';
import { getUser } from '@/functions/get-user';
import { orpc, orpcClient } from '@/utils/orpc';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { nanoid } from 'nanoid';

export const Route = createFileRoute('/admin/homepage-banners' as any)({
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
  component: HomepageBannersPage,
});

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BannerFormData {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  sortOrder: number;
}

function HomepageBannersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<BannerFormData>({
    imageUrl: '',
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    buttonLink: '/',
    isActive: true,
    sortOrder: 0,
  });

  // Fetch banners
  const { data, isLoading } = useQuery(orpc.admin.listAllBanners.queryOptions());
  const banners = data?.banners || [];

  // Create banner mutation
  const createMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      return await orpcClient.admin.createBanner(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listAllBanners'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // Update banner mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<BannerFormData>) => {
      return await orpcClient.admin.updateBanner({ id, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listAllBanners'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // Delete banner mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await orpcClient.admin.deleteBanner({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listAllBanners'] });
      setDeleteConfirm(null);
    },
  });

  // Reorder banners mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedBanners: { id: string; sortOrder: number }[]) => {
      return await orpcClient.admin.reorderBanners({ banners: reorderedBanners });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listAllBanners'] });
    },
  });

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      title: '',
      subtitle: '',
      buttonText: 'Shop Now',
      buttonLink: '/',
      isActive: true,
      sortOrder: 0,
    });
    setEditingBanner(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, sortOrder: banners.length }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl,
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `homepage/banners/${nanoid()}.${fileExt}`;

      // Get presigned URL
      const { url, publicUrl } = await orpcClient.storage.getUploadUrl({
        key: fileName,
        type: file.type,
      });

      // Upload file
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Update form data
      setFormData((prev) => ({ ...prev, imageUrl: publicUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = (banner: Banner) => {
    updateMutation.mutate({ id: banner.id, isActive: !banner.isActive });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBanners = [...banners];
    const draggedBanner = newBanners[draggedIndex];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedBanner);

    // Update sort orders
    const reordered = newBanners.map((banner, idx) => ({
      id: banner.id,
      sortOrder: idx,
    }));

    reorderMutation.mutate(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Homepage Banners
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage main carousel slides on the homepage
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Banner
          </Button>
        </div>

        {/* Banners List */}
        <div className="space-y-3">
          {banners.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <ImageIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-4 text-slate-500 dark:text-slate-400">
                No banners yet. Create your first banner!
              </p>
            </div>
          ) : (
            banners.map((banner, index) => (
              <div
                key={banner.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4',
                  'hover:shadow-md transition-shadow cursor-move',
                  !banner.isActive && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-20 w-32 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {banner.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {banner.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Order: {banner.sortOrder}
                      </span>
                      {banner.isActive ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(banner)}
                      title={banner.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {banner.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(banner.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="flex items-center gap-4">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-24 w-40 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && (
                      <p className="text-xs text-slate-500 mt-1">Uploading...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  maxLength={200}
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle *</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  required
                  maxLength={500}
                  rows={3}
                />
              </div>

              {/* Button Text */}
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text *</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, buttonText: e.target.value }))
                  }
                  required
                  maxLength={50}
                />
              </div>

              {/* Button Link */}
              <div className="space-y-2">
                <Label htmlFor="buttonLink">Button Link *</Label>
                <Input
                  id="buttonLink"
                  value={formData.buttonLink}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))
                  }
                  required
                  placeholder="/products"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active (visible on homepage)</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !formData.imageUrl ||
                    !formData.title ||
                    !formData.subtitle ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingBanner ? 'Update' : 'Create'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Banner?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this banner? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
