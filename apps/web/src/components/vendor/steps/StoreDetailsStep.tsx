import { useState } from 'react'
import { AlertCircle, Image as ImageIcon, Store, Upload, X } from 'lucide-react'
import type { VendorFormData } from '@/types/vendor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface StoreDetailsStepProps {
  formData: VendorFormData
  onFormChange: (field: keyof VendorFormData, value: any) => void
  onNext: () => void
  onBack: () => void
}

const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books & Stationery',
  'Toys & Games',
  'Health & Wellness',
  'Automotive',
  'Jewelry & Accessories',
]

export function StoreDetailsStep({
  formData,
  onFormChange,
  onNext,
  onBack,
}: StoreDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileUpload = (
    field: keyof VendorFormData,
    file: File | undefined,
  ) => {
    onFormChange(field, file)
  }

  const toggleCategory = (category: string) => {
    const current = formData.productCategories
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    onFormChange('productCategories', updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.storeName.trim())
      newErrors.storeName = 'Store name is required'
    if (!formData.storeDescription.trim())
      newErrors.storeDescription = 'Store description is required'
    if (formData.storeDescription.length > 500)
      newErrors.storeDescription = 'Description must be 500 characters or less'
    if (formData.productCategories.length === 0) {
      newErrors.productCategories = 'Select at least one category'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Store Details
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Set up your online store
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Name */}
        <div className="space-y-2">
          <Label htmlFor="storeName" className="text-sm font-semibold">
            Store Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="storeName"
              value={formData.storeName}
              onChange={(e) => {
                onFormChange('storeName', e.target.value)
                if (errors.storeName)
                  setErrors((prev) => ({ ...prev, storeName: '' }))
              }}
              placeholder="Your Store Name"
              className={cn(
                'pl-10',
                errors.storeName && 'border-red-500 focus-visible:ring-red-500',
              )}
            />
          </div>
          {errors.storeName && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.storeName}</span>
            </div>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            This will be your unique store name (e.g., example-store)
          </p>
        </div>

        {/* Store Description */}
        <div className="space-y-2">
          <Label htmlFor="storeDescription" className="text-sm font-semibold">
            Store Description <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Textarea
              id="storeDescription"
              value={formData.storeDescription}
              onChange={(e) => {
                onFormChange('storeDescription', e.target.value)
                if (errors.storeDescription)
                  setErrors((prev) => ({ ...prev, storeDescription: '' }))
              }}
              placeholder="Describe your store and what you sell..."
              rows={4}
              maxLength={500}
              className={cn(
                errors.storeDescription &&
                  'border-red-500 focus-visible:ring-red-500',
              )}
            />
          </div>
          {errors.storeDescription && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.storeDescription}</span>
            </div>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {formData.storeDescription.length}/500 characters
          </p>
        </div>

        {/* Product Categories */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Product Categories <span className="text-red-500">*</span>
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRODUCT_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={formData.productCategories.includes(category)}
                  onCheckedChange={() => {
                    toggleCategory(category)
                    if (errors.productCategories)
                      setErrors((prev) => ({ ...prev, productCategories: '' }))
                  }}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
          {errors.productCategories && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.productCategories}</span>
            </div>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Selected: {formData.productCategories.length} categories
          </p>
        </div>

        {/* Store Logo Upload */}
        <div className="space-y-2">
          <Label htmlFor="storeLogo" className="text-sm font-semibold">
            Store Logo (Optional)
          </Label>
          <div className="rounded-lg border-2 border-dashed border-[hsl(var(--border))] p-4">
            {formData.storeLogo ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span className="text-sm">{formData.storeLogo.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileUpload('storeLogo', undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="storeLogo"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  Click to upload logo
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  PNG, JPG up to 2MB
                </span>
                <input
                  id="storeLogo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload('storeLogo', e.target.files?.[0])
                  }
                />
              </label>
            )}
          </div>
        </div>

        {/* Store Banner Upload */}
        <div className="space-y-2">
          <Label htmlFor="storeBanner" className="text-sm font-semibold">
            Store Banner (Optional)
          </Label>
          <div className="rounded-lg border-2 border-dashed border-[hsl(var(--border))] p-4">
            {formData.storeBanner ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span className="text-sm">{formData.storeBanner.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileUpload('storeBanner', undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="storeBanner"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  Click to upload banner
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  PNG, JPG up to 5MB (recommended: 1920x400px)
                </span>
                <input
                  id="storeBanner"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload('storeBanner', e.target.files?.[0])
                  }
                />
              </label>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            ← Previous
          </Button>
          <Button type="submit" size="lg" className="min-w-[120px]">
            Next →
          </Button>
        </div>
      </form>
    </div>
  )
}
