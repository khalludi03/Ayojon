import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, GripVertical, Check, Loader2, Package, Tag, FileText, DollarSign, Image as ImageIcon, Settings, Info, Sparkles } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { VendorProduct, ProductFormData, ProductImage, ProductSpecification } from '@/types/vendor-product';
import type { Category } from '@/types/category';
import { uploadFile } from '@/lib/storage-utils';

// Helper to generate SKU
function generateSKU(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AYJ-${timestamp}-${random}`;
}

interface AddProductFormProps {
  existingProduct?: VendorProduct | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EVENT_TYPES = [
  'Wedding',
  'Birthday',
  'Anniversary',
  'Corporate Event',
  'Baby Shower',
  'Graduation',
  'Holiday Party',
  'Engagement',
  'Retirement',
  'Other',
];

export function AddProductForm({ existingProduct, onClose, onSuccess }: AddProductFormProps) {
  const { data: categories = [] } = useQuery(orpc.product.listCategories.queryOptions()) as { data: Category[] };

  // Create product mutation
  const createProductMutation = useMutation(
    orpc.product.createProduct.mutationOptions({
      onSuccess: () => {
        toast.success('Product created successfully!');
        setShowSuccess(true);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to create product');
        console.error('Create product error:', error);
      },
    })
  );

  // Update product mutation
  const updateProductMutation = useMutation(
    orpc.product.updateProduct.mutationOptions({
      onSuccess: () => {
        toast.success('Product updated successfully!');
        setShowSuccess(true);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to update product');
        console.error('Update product error:', error);
      },
    })
  );

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    sku: '',
    skuMode: 'auto',
    description: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    eventTypes: [],
    productType: 'purchase',
    regularPrice: '',
    salePrice: '',
    quantity: '',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    securityDeposit: '',
    minimumRentalDuration: '1',
    quantityAvailable: '',
    images: [],
    specifications: [],
    keyFeatures: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedProductId, setSavedProductId] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      loadExistingProduct(existingProduct);
    } else if (formData.skuMode === 'auto') {
      setFormData(prev => ({ ...prev, sku: generateSKU() }));
    }
  }, []);

  const loadExistingProduct = (product: VendorProduct) => {
    setFormData({
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      skuMode: 'custom',
      description: product.description,
      shortDescription: product.shortDescription,
      category: product.category,
      subcategory: product.subcategory,
      eventTypes: product.eventTypes,
      productType: product.productType,
      regularPrice: product.purchaseDetails?.regularPrice.toString() || '',
      salePrice: product.purchaseDetails?.salePrice?.toString() || '',
      quantity: product.purchaseDetails?.quantity.toString() || '',
      dailyRate: product.rentalDetails?.dailyRate.toString() || '',
      weeklyRate: product.rentalDetails?.weeklyRate?.toString() || '',
      monthlyRate: product.rentalDetails?.monthlyRate?.toString() || '',
      securityDeposit: product.rentalDetails?.securityDeposit.toString() || '',
      minimumRentalDuration: product.rentalDetails?.minimumRentalDuration.toString() || '1',
      quantityAvailable: product.rentalDetails?.quantityAvailable.toString() || '',
      images: product.images,
      specifications: product.specifications,
      keyFeatures: (product as any).keyFeatures || [],
    });
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSKUModeChange = (mode: 'auto' | 'custom') => {
    if (mode === 'auto') {
      setFormData(prev => ({ ...prev, skuMode: mode, sku: generateSKU() }));
    } else {
      setFormData(prev => ({ ...prev, skuMode: mode }));
    }
  };

  const handleEventTypeToggle = (eventType: string) => {
    setFormData(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter(t => t !== eventType)
        : [...prev.eventTypes, eventType],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const newImages: ProductImage[] = [];

    Array.from(files).forEach((file, index) => {
      // Permissive validation
      const isImageMime = file.type.startsWith('image/');
      const hasImageExt = ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

      if (!isImageMime && !hasImageExt) {
        toast.error(`Format of "${file.name}" is not recognized as an image.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image "${file.name}" is too large (max 5MB)`);
        return;
      }

      newImages.push({
        id: `${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        file,
        isPrimary: formData.images.length === 0 && index === 0,
        order: formData.images.length + index,
      });
    });

    if (newImages.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
    
    // Clear input
    e.target.value = '';
  };

  const handleImageRemove = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId),
    }));
  };

  const handleSetPrimaryImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      })),
    }));
  };

  const handleAddSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
    }));
  };

  const handleRemoveSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleAddKeyFeature = () => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, ''],
    }));
  };

  const handleKeyFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.map((feature, i) =>
        i === index ? value : feature
      ),
    }));
  };

  const handleRemoveKeyFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic Info
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

        // Description

        if (!formData.description.trim()) {

          newErrors.description = 'Description is required';

        } else if (formData.description.trim().length < 5) {

          newErrors.description = 'Description must be at least 5 characters long';

        }

    

        if (!formData.shortDescription.trim()) {

          newErrors.shortDescription = 'Short description is required';

        } else if (formData.shortDescription.trim().length < 5) {

          newErrors.shortDescription = 'Short description must be at least 5 characters long';

        } else if (formData.shortDescription.length > 160) {

          newErrors.shortDescription = 'Short description must be 160 characters or less';

        }

    

    // Category
    if (!formData.category) newErrors.category = 'Category is required';

    // Pricing - Purchase
    if (formData.productType === 'purchase') {
      const regularPrice = parseFloat(formData.regularPrice);
      if (!formData.regularPrice || isNaN(regularPrice) || regularPrice <= 0) {
        newErrors.regularPrice = 'Regular price must be greater than 0';
      }
      if (formData.salePrice) {
        const salePrice = parseFloat(formData.salePrice);
        if (isNaN(salePrice) || salePrice <= 0) {
          newErrors.salePrice = 'Sale price must be greater than 0';
        } else if (salePrice >= regularPrice) {
          newErrors.salePrice = 'Sale price must be less than regular price';
        }
      }
      const quantity = parseInt(formData.quantity);
      if (!formData.quantity || isNaN(quantity) || quantity < 0) {
        newErrors.quantity = 'Quantity must be 0 or greater';
      }
    }

    // Images
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmDiscard) return;
    }
    onClose();
  };

  const handleMarkOutOfStock = () => {
    if (formData.productType === 'purchase' || formData.productType === 'both') {
      handleChange('quantity', '0');
    }
    if (formData.productType === 'rental' || formData.productType === 'both') {
      handleChange('quantityAvailable', '0');
    }
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsUploading(true);
    try {
      // Upload images that have a file attached (newly added images)
      const uploadedImages = await Promise.all(
        formData.images.map(async (image) => {
          if (image.file) {
            try {
              const publicUrl = await uploadFile(image.file, `products/${formData.sku || 'unnamed'}`, image.file.type);
              return {
                url: publicUrl,
                alt: image.id,
                isPrimary: image.isPrimary,
              };
            } catch (error) {
              console.error(`Failed to upload image ${image.id}:`, error);
              throw error;
            }
          }
          return {
            url: image.url,
            alt: image.id,
            isPrimary: image.isPrimary,
          };
        })
      );

      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Map display category to ID
      const categoryMap: Record<string, string> = {
        'Apparel & Accessories': 'event-clothing',
        'Jewelry & Watches': 'floral-arrangements', // Mapping best fit if not exact
        'Home & Living': 'furniture-tents',
        'Electronics': 'sound-lighting',
        'Beauty & Personal Care': 'party-supplies', // Mapping best fit
        'Art & Collectibles': 'decorations',
        'Toys & Games': 'entertainment',
        'Sports & Outdoors': 'entertainment', // Mapping best fit
      };

      // Map form data to API format - ensure correct types
      const apiData = {
        title: formData.name,
        slug: `${slug}-${Date.now()}`,
        description: formData.description,
        descriptionShort: formData.shortDescription || undefined,
        brand: formData.brand || undefined,
        sku: formData.sku || undefined,
        categoryId: categoryMap[formData.category] || 'decorations',
        price: formData.regularPrice.toString(), // Must be string
        salePrice: formData.salePrice ? formData.salePrice.toString() : null, // Send null if empty
        stock: parseInt(formData.quantity) || 0,
        status: asDraft ? ('draft' as const) : ('active' as const),
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        keyFeatures: formData.keyFeatures.filter(f => f.trim() !== ''), // Filter out empty features
      };

      if (existingProduct) {
        updateProductMutation.mutate({
          id: existingProduct.id,
          title: apiData.title,
          description: apiData.description,
          descriptionShort: apiData.descriptionShort,
          brand: apiData.brand,
          sku: apiData.sku || generateSKU(),
          categoryId: apiData.categoryId,
          price: apiData.price,
          stock: apiData.stock,
          status: apiData.status,
          keyFeatures: apiData.keyFeatures.length > 0 ? apiData.keyFeatures : undefined,
        });
      } else {
        createProductMutation.mutate(apiData);
      }
    } catch (error) {
      toast.error('Failed to upload images. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="rounded-2xl border-2 border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-12 text-center shadow-xl">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg animate-in zoom-in duration-300">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="text-3xl font-black text-green-900 dark:text-green-100">
            {existingProduct ? 'Product Updated!' : 'Product Created!'}
          </h2>
          <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-green-700 dark:text-green-300 mb-8 text-lg font-medium">
          {existingProduct
            ? 'Your changes have been saved successfully'
            : 'Your product is now live and ready for customers'
          }
        </p>
        <Button 
          onClick={onClose}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 shadow-lg hover:shadow-xl transition-all"
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--primary))] p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Package className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              {existingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <p className="text-white/90 font-medium ml-[52px]">
            {existingProduct ? 'Update your product information' : 'Create a new product listing for your store'}
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Section */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
                <Tag className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-black text-[hsl(var(--foreground))] tracking-tight">
                Basic Information
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Elegant Wedding Dress"
                  className={cn(
                    "h-12 text-base font-medium border-2 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all",
                    errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  )}
                />
                {errors.name && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="brand" className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="e.g., Ayojon Collection"
                  className={cn(
                    "h-12 text-base font-medium border-2 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all",
                    errors.brand ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  )}
                />
                {errors.brand && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.brand}</p>}
              </div>

              <div>
                <Label className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">SKU *</Label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSKUModeChange('auto')}
                    className={cn(
                      'flex-1 px-4 py-2.5 text-sm font-bold rounded-xl border-2 transition-all',
                      formData.skuMode === 'auto'
                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] shadow-md'
                        : 'border-slate-200 dark:border-slate-800 text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]/30'
                    )}
                  >
                    Auto-generate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSKUModeChange('custom')}
                    className={cn(
                      'flex-1 px-4 py-2.5 text-sm font-bold rounded-xl border-2 transition-all',
                      formData.skuMode === 'custom'
                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] shadow-md'
                        : 'border-slate-200 dark:border-slate-800 text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]/30'
                    )}
                  >
                    Custom
                  </button>
                </div>
                <Input
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  disabled={formData.skuMode === 'auto'}
                  placeholder="Enter custom SKU"
                  className={cn(
                    "h-12 text-base font-medium border-2 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all",
                    errors.sku ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  )}
                />
                {errors.sku && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.sku}</p>}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
                <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-black text-[hsl(var(--foreground))] tracking-tight">
                Description
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="description" className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide a detailed description of your product..."
                  rows={6}
                  className={cn(
                    "text-base font-medium border-2 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all resize-none",
                    errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  )}
                />
                {errors.description && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.description}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="shortDescription" className="text-sm font-bold text-[hsl(var(--foreground))]">Short Description *</Label>
                  <span className={cn(
                    'text-xs font-bold px-2 py-1 rounded-lg',
                    formData.shortDescription.length > 160 
                      ? 'text-red-600 bg-red-50 dark:bg-red-950/30' 
                      : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                  )}>
                    {formData.shortDescription.length}/160
                  </span>
                </div>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  placeholder="Write a brief summary (max 160 characters)"
                  rows={3}
                  maxLength={160}
                  className={cn(
                    "text-base font-medium border-2 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all resize-none",
                    errors.shortDescription ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  )}
                />
                {errors.shortDescription && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.shortDescription}</p>}
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-md">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">
                Category & Classification
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="category" className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={cn(
                    'w-full h-12 text-base font-medium rounded-xl border-2 pl-4 pr-10 py-2 bg-[hsl(var(--background))] focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all appearance-none',
                    errors.category ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  )}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="subcategory" className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                  placeholder="e.g., Traditional Wear"
                  className="h-12 text-base font-medium border-2 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                />
              </div>

              <div>
                <Label className="text-sm font-bold text-[hsl(var(--foreground))] mb-3 block">Event Types</Label>
                <div className="grid grid-cols-2 gap-3">
                  {EVENT_TYPES.map((eventType) => (
                    <button
                      key={eventType}
                      type="button"
                      onClick={() => handleEventTypeToggle(eventType)}
                      className={cn(
                        'px-4 py-3 text-sm font-bold rounded-xl border-2 text-left transition-all flex items-center justify-between',
                        formData.eventTypes.includes(eventType)
                          ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] shadow-md'
                          : 'border-slate-200 dark:border-slate-800 text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]/30'
                      )}
                    >
                      <span>{eventType}</span>
                      {formData.eventTypes.includes(eventType) && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
                <DollarSign className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-black text-[hsl(var(--foreground))] tracking-tight">
                Pricing & Inventory
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-bold text-[hsl(var(--foreground))] mb-3 block">Product Type *</Label>
                <div className="flex gap-3 mt-2">
                  {(['purchase'] as const).map((type) => (
                    <label key={type} className="flex-1 group cursor-pointer">
                      <div className={cn(
                        "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        formData.productType === type
                          ? "bg-[hsl(var(--primary))]/10 border-[hsl(var(--primary))] shadow-md"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[hsl(var(--primary))]/30"
                      )}>
                        <input
                          type="radio"
                          name="productType"
                          value={type}
                          checked={formData.productType === type}
                          onChange={(e) => handleChange('productType', e.target.value)}
                          className="w-5 h-5 text-indigo-600"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-bold text-[hsl(var(--foreground))] block">
                            {type.charAt(0).toUpperCase() + type.slice(1)} Only
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            Sell products directly to customers
                          </span>
                        </div>
                        {formData.productType === type && (
                          <Check className="h-5 w-5 text-[hsl(var(--primary))]" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Rental Products Coming Soon
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        We're working on adding rental functionality. For now, you can only add purchase products.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              {formData.productType === 'purchase' && (
                <div className="pt-4 border-t border-[hsl(var(--border))]">
                  <h4 className="font-bold text-[hsl(var(--foreground))] mb-4 text-base">Purchase Details</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="regularPrice" className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">Regular Price (৳) *</Label>
                      <Input
                        id="regularPrice"
                        type="number"
                        value={formData.regularPrice}
                        onChange={(e) => handleChange('regularPrice', e.target.value)}
                        placeholder="0.00"
                        className={cn(
                          "h-12 text-base font-medium border-2 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all",
                          errors.regularPrice ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                        )}
                      />
                      {errors.regularPrice && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.regularPrice}</p>}
                    </div>
                    <div>
                      <Label htmlFor="salePrice" className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">Sale Price (৳)</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => handleChange('salePrice', e.target.value)}
                        placeholder="0.00"
                        className={cn(
                          "h-12 text-base font-medium border-2 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all",
                          errors.salePrice ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                        )}
                      />
                      {errors.salePrice && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.salePrice}</p>}
                    </div>
                    <div>
                      <Label htmlFor="quantity" className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">Quantity in Stock *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        placeholder="0"
                        className={cn(
                          "h-12 text-base font-medium border-2 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all",
                          errors.quantity ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                        )}
                      />
                      {errors.quantity && <p className="text-sm text-red-500 mt-2 font-semibold flex items-center gap-1"><X className="h-4 w-4" />{errors.quantity}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Rental Details - Currently Disabled */}
              {false && (formData.productType === 'rental' || formData.productType === 'both') && (
                <div className="pt-4 border-t border-[hsl(var(--border))]">
                  <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Rental Details</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="dailyRate">Daily Rate (৳) *</Label>
                      <Input
                        id="dailyRate"
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => handleChange('dailyRate', e.target.value)}
                        placeholder="0.00"
                        className={errors.dailyRate ? 'border-red-500' : ''}
                      />
                      {errors.dailyRate && <p className="text-sm text-red-500 mt-1">{errors.dailyRate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="weeklyRate">Weekly Rate (৳)</Label>
                      <Input
                        id="weeklyRate"
                        type="number"
                        value={formData.weeklyRate}
                        onChange={(e) => handleChange('weeklyRate', e.target.value)}
                        placeholder="0.00"
                        className={errors.weeklyRate ? 'border-red-500' : ''}
                      />
                      {errors.weeklyRate && <p className="text-sm text-red-500 mt-1">{errors.weeklyRate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="monthlyRate">Monthly Rate (৳)</Label>
                      <Input
                        id="monthlyRate"
                        type="number"
                        value={formData.monthlyRate}
                        onChange={(e) => handleChange('monthlyRate', e.target.value)}
                        placeholder="0.00"
                        className={errors.monthlyRate ? 'border-red-500' : ''}
                      />
                      {errors.monthlyRate && <p className="text-sm text-red-500 mt-1">{errors.monthlyRate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="securityDeposit">Security Deposit (৳) *</Label>
                      <Input
                        id="securityDeposit"
                        type="number"
                        value={formData.securityDeposit}
                        onChange={(e) => handleChange('securityDeposit', e.target.value)}
                        placeholder="0.00"
                        className={errors.securityDeposit ? 'border-red-500' : ''}
                      />
                      {errors.securityDeposit && <p className="text-sm text-red-500 mt-1">{errors.securityDeposit}</p>}
                    </div>
                    <div>
                      <Label htmlFor="minimumRentalDuration">Min. Rental Duration (days) *</Label>
                      <Input
                        id="minimumRentalDuration"
                        type="number"
                        value={formData.minimumRentalDuration}
                        onChange={(e) => handleChange('minimumRentalDuration', e.target.value)}
                        placeholder="1"
                        className={errors.minimumRentalDuration ? 'border-red-500' : ''}
                      />
                      {errors.minimumRentalDuration && <p className="text-sm text-red-500 mt-1">{errors.minimumRentalDuration}</p>}
                    </div>
                    <div>
                      <Label htmlFor="quantityAvailable">Quantity Available *</Label>
                      <Input
                        id="quantityAvailable"
                        type="number"
                        value={formData.quantityAvailable}
                        onChange={(e) => handleChange('quantityAvailable', e.target.value)}
                        placeholder="0"
                        className={errors.quantityAvailable ? 'border-red-500' : ''}
                      />
                      {errors.quantityAvailable && <p className="text-sm text-red-500 mt-1">{errors.quantityAvailable}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Section */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-md">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">
                  Specifications
                </h3>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddSpecification}
                className="font-bold text-[hsl(var(--primary))] border-2 border-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary))]/5 transition-all"
              >
                <Tag className="h-4 w-4 mr-2" />
                Add Spec
              </Button>
            </div>
            <div className="space-y-4">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 items-start p-4 rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 hover:border-[hsl(var(--primary))]/30 transition-all">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      placeholder="Key (e.g., Material, Size, Color)"
                      className="h-11 text-base font-medium border-2 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                    />
                    <Input
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g., 100% Cotton, Medium, Red)"
                      className="h-11 text-base font-medium border-2 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSpecification(index)}
                    className="h-11 w-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              {formData.specifications.length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/30">
                  <Settings className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    No specifications added yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Click "Add Spec" to add product specifications
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Key Features (Highlights) Section */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">
                    Product Highlights
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Key features displayed prominently to customers
                  </p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddKeyFeature}
                className="font-bold text-amber-600 dark:text-amber-400 border-2 border-amber-500/20 hover:bg-amber-500/5 transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
            <div className="space-y-3">
              {formData.keyFeatures.map((feature, index) => (
                <div key={index} className="flex gap-3 items-center p-4 rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition-all">
                  <div className="flex-1">
                    <Input
                      value={feature}
                      onChange={(e) => handleKeyFeatureChange(index, e.target.value)}
                      placeholder="e.g., Premium quality materials, Easy to setup, Weather resistant"
                      className="h-11 text-base font-medium border-2 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveKeyFeature(index)}
                    className="h-11 w-11 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              {formData.keyFeatures.length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/30">
                  <Sparkles className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    No highlights added yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Click "Add Feature" to highlight key product features
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Status Section - Only for existing products */}
          {existingProduct && (
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
                Product Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 block">
                    Current Status
                  </label>
                  <div className="flex gap-2">
                    <span
                      className={cn(
                        'inline-flex rounded-xl px-4 py-2 text-sm font-bold shadow-sm',
                        existingProduct.status === 'active'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : existingProduct.status === 'draft'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
                            : 'bg-gradient-to-r from-gray-500 to-slate-600 text-white'
                      )}
                    >
                      {existingProduct.status === 'active'
                        ? '✓ Active (Published)'
                        : existingProduct.status === 'draft'
                          ? '○ Draft'
                          : '⊗ Archived'}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50">
                  {existingProduct.status === 'active'
                    ? '✓ This product is live and visible to customers'
                    : existingProduct.status === 'draft'
                      ? '○ This product is not visible to customers yet'
                      : '⊗ This product is archived and not visible'}
                </p>
                <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-[hsl(var(--primary))]">
                    💡 Use action buttons below to change status
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Images Section */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
                <ImageIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-black text-[hsl(var(--foreground))] tracking-tight">
                Product Images *
              </h3>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
              <label className="relative block border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all group overflow-hidden">
                <div className="absolute inset-0 bg-[hsl(var(--primary))]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-[hsl(var(--primary))]" />
                  </div>
                  <p className="text-base font-bold text-[hsl(var(--foreground))] mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">
                    PNG, JPG, WEBP up to 5MB each
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Upload 5-10 high-quality images for best results
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {errors.images && <p className="text-sm text-red-500 mt-2 font-semibold">{errors.images}</p>}
            </div>

            {/* Image Previews */}
            {formData.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} uploaded
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {formData.images.map((image, imageIndex) => (
                    <div
                      key={`${image.id}-${imageIndex}`}
                      className={cn(
                        'relative group rounded-lg overflow-hidden border-2',
                        image.isPrimary
                          ? 'border-[hsl(var(--primary))]'
                          : 'border-[hsl(var(--border))]'
                      )}
                    >
                      <img
                        src={image.url}
                        alt="Product"
                        className="w-full h-24 object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-1 left-1 bg-[hsl(var(--primary))] text-white text-xs px-2 py-0.5 rounded">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!image.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(image.id)}
                            className="p-1 bg-white rounded text-xs"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleImageRemove(image.id)}
                          className="p-1 bg-red-500 text-white rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-8 shadow-lg space-y-4">
            <Button
              onClick={() => handleSubmit(false)}
              size="lg"
              className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading Images...
                </>
              ) : (
                <>
                  {existingProduct ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Update Product
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Publish Product
                    </>
                  )}
                </>
              )}
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              size="lg"
              variant="outline"
              className="w-full border-2 font-bold text-base"
              disabled={isUploading}
            >
              Save as Draft
            </Button>
            {existingProduct && (
              <Button
                onClick={handleMarkOutOfStock}
                size="lg"
                variant="outline"
                className="w-full border-2 font-bold text-base border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5"
                disabled={isUploading}
              >
                Mark as Out of Stock
              </Button>
            )}
            <Button
              onClick={handleCancel}
              size="lg"
              variant="ghost"
              className="w-full font-bold text-base"
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
