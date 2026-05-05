import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Edit, Eye, EyeOff, Image as ImageIcon, Save } from 'lucide-react'
import { nanoid } from 'nanoid'
import { getUser } from '@/functions/get-user'
import { orpc, orpcClient } from '@/utils/orpc'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/homepage-promo-cards' as any)({
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
  component: HomepagePromoCardsPage,
})

interface PromoCard {
  id: string
  slotNumber: number
  imageUrl: string
  label: string
  title: string
  link: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface PromoCardFormData {
  imageUrl: string
  label: string
  title: string
  link: string
  isActive: boolean
}

function HomepagePromoCardsPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState<PromoCardFormData>({
    imageUrl: '',
    label: '',
    title: '',
    link: '/',
    isActive: true,
  })

  // Fetch promo cards
  const { data, isLoading } = useQuery(
    orpc.admin.listAllPromoCards.queryOptions(),
  )
  const promoCards = data?.promoCards || []

  // Create a map of slot number to promo card
  const promoCardsBySlot = new Map<number, PromoCard>()
  promoCards.forEach((card) => {
    promoCardsBySlot.set(card.slotNumber, card)
  })

  // Update promo card mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      slotNumber,
      ...cardData
    }: { slotNumber: number } & Partial<PromoCardFormData>) => {
      return await orpcClient.admin.updatePromoCard({ slotNumber, ...cardData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'listAllPromoCards'],
      })
      setIsDialogOpen(false)
      resetForm()
    },
  })

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      label: '',
      title: '',
      link: '/',
      isActive: true,
    })
    setEditingSlot(null)
  }

  const openEditDialog = (slotNumber: number) => {
    const card = promoCardsBySlot.get(slotNumber)
    setEditingSlot(slotNumber)
    if (card) {
      setFormData({
        imageUrl: card.imageUrl,
        label: card.label,
        title: card.title,
        link: card.link,
        isActive: card.isActive,
      })
    } else {
      setFormData({
        imageUrl: '',
        label: `Card ${slotNumber}`,
        title: `Promo Card ${slotNumber}`,
        link: '/',
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSlot === null) return
    updateMutation.mutate({ slotNumber: editingSlot, ...formData })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `homepage/promo-cards/${nanoid()}.${fileExt}`

      // Get presigned URL
      const { url, publicUrl } = await orpcClient.storage.getUploadUrl({
        key: fileName,
        type: file.type,
      })

      // Upload file
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      // Update form data
      setFormData((prev) => ({ ...prev, imageUrl: publicUrl }))
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const toggleActive = (slotNumber: number) => {
    const card = promoCardsBySlot.get(slotNumber)
    if (card) {
      updateMutation.mutate({ slotNumber, isActive: !card.isActive })
    }
  }

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Homepage Promo Cards
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage the 4 promotional cards beside the main banner
          </p>
        </div>

        {/* Promo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((slotNumber) => {
            const card = promoCardsBySlot.get(slotNumber)
            const isEmpty = !card || !card.imageUrl

            return (
              <div
                key={slotNumber}
                className={cn(
                  'bg-white dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700',
                  'hover:border-slate-400 dark:hover:border-slate-600 transition-colors',
                  card && !card.isActive && 'opacity-50',
                )}
              >
                <div className="p-6 space-y-4">
                  {/* Slot Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        Slot {slotNumber}
                      </span>
                      {card && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            card.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {card.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {card && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(slotNumber)}
                          title={card.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {card.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(slotNumber)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        {isEmpty ? 'Add' : 'Edit'}
                      </Button>
                    </div>
                  </div>

                  {/* Card Preview */}
                  {isEmpty ? (
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          No image uploaded
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded inline-block mb-1">
                          {card.label}
                        </div>
                        <h3 className="text-sm font-semibold text-white">
                          {card.title}
                        </h3>
                      </div>
                    </div>
                  )}

                  {/* Card Info */}
                  {card && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <p>
                        <span className="font-medium">Link:</span> {card.link}
                      </p>
                      <p>
                        <span className="font-medium">Label:</span> {card.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Promo Card - Slot {editingSlot}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Card Image</Label>
                <div className="space-y-3">
                  {formData.imageUrl && (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <p className="text-xs text-slate-500">Uploading...</p>
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="label">Label (e.g., "50% OFF RENTAL") *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  required
                  maxLength={100}
                  placeholder="50% OFF RENTAL"
                />
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
                  placeholder="Wedding Decorations"
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link">Link *</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, link: e.target.value }))
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
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
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
                    !formData.label ||
                    !formData.title ||
                    updateMutation.isPending
                  }
                >
                  {updateMutation.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
