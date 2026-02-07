import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, GripVertical, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorProduct, ProductFormData, ProductImage, ProductSpecification } from '@/types/vendor-product';
import { addVendorProduct, updateVendorProduct, generateSKU, getVendorProducts } from '@/stores/vendor-product-store';
import { uploadFile } from '@/lib/storage-utils';

interface AddProductFormProps {
  vendorId: string;
  existingProduct?: VendorProduct | null;
  onClose: () => void;
}

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

export function AddProductForm({ vendorId, existingProduct, onClose }: AddProductFormProps) {
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
    weight: '',
    length: '',
    width: '',
    height: '',
    isFragile: false,
    requiresSetup: false,
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
      weight: product.shipping.weight.toString(),
      length: product.shipping.dimensions.length.toString(),
      width: product.shipping.dimensions.width.toString(),
      height: product.shipping.dimensions.height.toString(),
      isFragile: product.shipping.isFragile,
      requiresSetup: product.shipping.requiresSetup,
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

    const newImages: ProductImage[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      isPrimary: formData.images.length === 0 && index === 0,
      order: formData.images.length + index,
    }));

    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic Info
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

    // Description
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (formData.shortDescription.length > 160) newErrors.shortDescription = 'Short description must be 160 characters or less';

    // Category
    if (!formData.category) newErrors.category = 'Category is required';

    // Pricing - Purchase
    if (formData.productType === 'purchase' || formData.productType === 'both') {
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

    // Pricing - Rental
    if (formData.productType === 'rental' || formData.productType === 'both') {
      const dailyRate = parseFloat(formData.dailyRate);
      if (!formData.dailyRate || isNaN(dailyRate) || dailyRate <= 0) {
        newErrors.dailyRate = 'Daily rate must be greater than 0';
      }
      if (formData.weeklyRate) {
        const weeklyRate = parseFloat(formData.weeklyRate);
        if (isNaN(weeklyRate) || weeklyRate <= 0) {
          newErrors.weeklyRate = 'Weekly rate must be greater than 0';
        }
      }
      if (formData.monthlyRate) {
        const monthlyRate = parseFloat(formData.monthlyRate);
        if (isNaN(monthlyRate) || monthlyRate <= 0) {
          newErrors.monthlyRate = 'Monthly rate must be greater than 0';
        }
      }
      const securityDeposit = parseFloat(formData.securityDeposit);
      if (!formData.securityDeposit || isNaN(securityDeposit) || securityDeposit < 0) {
        newErrors.securityDeposit = 'Security deposit must be 0 or greater';
      }
      const minDuration = parseInt(formData.minimumRentalDuration);
      if (!formData.minimumRentalDuration || isNaN(minDuration) || minDuration < 1) {
        newErrors.minimumRentalDuration = 'Minimum rental duration must be at least 1 day';
      }
      const quantityAvailable = parseInt(formData.quantityAvailable);
      if (!formData.quantityAvailable || isNaN(quantityAvailable) || quantityAvailable < 0) {
        newErrors.quantityAvailable = 'Quantity available must be 0 or greater';
      }
    }

    // Images
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    // Shipping
    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight) || weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }
    const length = parseFloat(formData.length);
    if (!formData.length || isNaN(length) || length <= 0) {
      newErrors.length = 'Length must be greater than 0';
    }
    const width = parseFloat(formData.width);
    if (!formData.width || isNaN(width) || width <= 0) {
      newErrors.width = 'Width must be greater than 0';
    }
    const height = parseFloat(formData.height);
    if (!formData.height || isNaN(height) || height <= 0) {
      newErrors.height = 'Height must be greater than 0';
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
              const publicUrl = await uploadFile(image.file, `products/${formData.sku || 'unnamed'}`);
              return {
                ...image,
                url: publicUrl,
                file: undefined, // Remove file reference after upload
              };
            } catch (error) {
              console.error(`Failed to upload image ${image.id}:`, error);
              throw error;
            }
          }
          return image;
        })
      );

      const product: VendorProduct = {
        id: existingProduct?.id || `product-${Date.now()}`,
        vendorId,
        name: formData.name,
        brand: formData.brand,
        sku: formData.sku,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        subcategory: formData.subcategory,
        eventTypes: formData.eventTypes,
        productType: formData.productType,
        purchaseDetails: (formData.productType === 'purchase' || formData.productType === 'both')
          ? {
              regularPrice: parseFloat(formData.regularPrice),
              salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
              quantity: parseInt(formData.quantity),
            }
          : undefined,
        rentalDetails: (formData.productType === 'rental' || formData.productType === 'both')
          ? {
              dailyRate: parseFloat(formData.dailyRate),
              weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : undefined,
              monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : undefined,
              securityDeposit: parseFloat(formData.securityDeposit),
              minimumRentalDuration: parseInt(formData.minimumRentalDuration),
              quantityAvailable: parseInt(formData.quantityAvailable),
            }
          : undefined,
        images: uploadedImages,
        specifications: formData.specifications.filter(spec => spec.key && spec.value),
        shipping: {
          weight: parseFloat(formData.weight),
          dimensions: {
            length: parseFloat(formData.length),
            width: parseFloat(formData.width),
            height: parseFloat(formData.height),
          },
          isFragile: formData.isFragile,
          requiresSetup: formData.requiresSetup,
        },
        status: asDraft ? 'draft' : 'published',
        createdAt: existingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: !asDraft && !existingProduct?.publishedAt ? new Date().toISOString() : existingProduct?.publishedAt,
      };

      if (existingProduct) {
        updateVendorProduct(product.id, product);
      } else {
        addVendorProduct(product);
      }

      setSavedProductId(product.id);
      setShowSuccess(true);
    } catch (error) {
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (showSuccess) {
    const product = getVendorProducts().find(p => p.id === savedProductId);
    const wasPublished = product?.status === 'published';

    return (
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
          {existingProduct ? 'Product updated successfully!' : 'Product published successfully!'}
        </h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">
          {existingProduct
            ? 'Your changes have been saved and are now live'
            : wasPublished
              ? 'Your product is now live and visible to customers'
              : 'Your product has been saved as a draft'
          }
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose}>
            Back to Products
          </Button>
          <Button onClick={() => {
            onClose();
            // In a real app, this would navigate to the product detail page
            console.log('View product:', savedProductId);
          }}>
            View Product
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {existingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {existingProduct ? 'Update product information below' : 'Fill in the product details below'}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Section */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Elegant Wedding Dress"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="e.g., Ayojon Collection"
                  className={errors.brand ? 'border-red-500' : ''}
                />
                {errors.brand && <p className="text-sm text-red-500 mt-1">{errors.brand}</p>}
              </div>

              <div>
                <Label>SKU *</Label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleSKUModeChange('auto')}
                    className={cn(
                      'px-3 py-1 text-sm rounded border',
                      formData.skuMode === 'auto'
                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] text-[hsl(var(--foreground))]'
                    )}
                  >
                    Auto-generate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSKUModeChange('custom')}
                    className={cn(
                      'px-3 py-1 text-sm rounded border',
                      formData.skuMode === 'custom'
                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] text-[hsl(var(--foreground))]'
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
                  className={errors.sku ? 'border-red-500' : ''}
                />
                {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              Description
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide a detailed description of your product..."
                  rows={6}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <span className={cn(
                    'text-xs',
                    formData.shortDescription.length > 160 ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))]'
                  )}>
                    {formData.shortDescription.length}/160
                  </span>
                </div>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  placeholder="Brief summary for product listings..."
                  rows={2}
                  maxLength={160}
                  className={errors.shortDescription ? 'border-red-500' : ''}
                />
                {errors.shortDescription && <p className="text-sm text-red-500 mt-1">{errors.shortDescription}</p>}
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              Category & Classification
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={cn(
                    'w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] border-[hsl(var(--border))]',
                    errors.category && 'border-red-500'
                  )}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                  placeholder="e.g., Traditional Wear"
                />
              </div>

              <div>
                <Label>Event Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {EVENT_TYPES.map((eventType) => (
                    <button
                      key={eventType}
                      type="button"
                      onClick={() => handleEventTypeToggle(eventType)}
                      className={cn(
                        'px-3 py-2 text-sm rounded border text-left',
                        formData.eventTypes.includes(eventType)
                          ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                          : 'border-[hsl(var(--border))] text-[hsl(var(--foreground))]'
                      )}
                    >
                      {eventType}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              Pricing & Inventory
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Product Type *</Label>
                <div className="flex gap-4 mt-2">
                  {(['purchase', 'rental', 'both'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="productType"
                        value={type}
                        checked={formData.productType === type}
                        onChange={(e) => handleChange('productType', e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[hsl(var(--foreground))]">
                        {type === 'both' ? 'Both' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Purchase Details */}
              {(formData.productType === 'purchase' || formData.productType === 'both') && (
                <div className="pt-4 border-t border-[hsl(var(--border))]">
                  <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Purchase Details</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="regularPrice">Regular Price (৳) *</Label>
                      <Input
                        id="regularPrice"
                        type="number"
                        value={formData.regularPrice}
                        onChange={(e) => handleChange('regularPrice', e.target.value)}
                        placeholder="0.00"
                        className={errors.regularPrice ? 'border-red-500' : ''}
                      />
                      {errors.regularPrice && <p className="text-sm text-red-500 mt-1">{errors.regularPrice}</p>}
                    </div>
                    <div>
                      <Label htmlFor="salePrice">Sale Price (৳)</Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => handleChange('salePrice', e.target.value)}
                        placeholder="0.00"
                        className={errors.salePrice ? 'border-red-500' : ''}
                      />
                      {errors.salePrice && <p className="text-sm text-red-500 mt-1">{errors.salePrice}</p>}
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity in Stock *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        placeholder="0"
                        className={errors.quantity ? 'border-red-500' : ''}
                      />
                      {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Rental Details */}
              {(formData.productType === 'rental' || formData.productType === 'both') && (
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
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Specifications
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSpecification}>
                Add Specification
              </Button>
            </div>
            <div className="space-y-3">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={spec.key}
                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                    placeholder="Key (e.g., Dimensions)"
                    className="flex-1"
                  />
                  <Input
                    value={spec.value}
                    onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                    placeholder="Value (e.g., 10x20cm)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSpecification(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.specifications.length === 0 && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">
                  No specifications added yet
                </p>
              )}
            </div>
          </div>

          {/* Shipping Section */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              Shipping Details
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="0.00"
                    className={errors.weight ? 'border-red-500' : ''}
                  />
                  {errors.weight && <p className="text-sm text-red-500 mt-1">{errors.weight}</p>}
                </div>
                <div>
                  <Label htmlFor="length">Length (cm) *</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    value={formData.length}
                    onChange={(e) => handleChange('length', e.target.value)}
                    placeholder="0.00"
                    className={errors.length ? 'border-red-500' : ''}
                  />
                  {errors.length && <p className="text-sm text-red-500 mt-1">{errors.length}</p>}
                </div>
                <div>
                  <Label htmlFor="width">Width (cm) *</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    value={formData.width}
                    onChange={(e) => handleChange('width', e.target.value)}
                    placeholder="0.00"
                    className={errors.width ? 'border-red-500' : ''}
                  />
                  {errors.width && <p className="text-sm text-red-500 mt-1">{errors.width}</p>}
                </div>
                <div>
                  <Label htmlFor="height">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="0.00"
                    className={errors.height ? 'border-red-500' : ''}
                  />
                  {errors.height && <p className="text-sm text-red-500 mt-1">{errors.height}</p>}
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFragile}
                    onChange={(e) => handleChange('isFragile', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[hsl(var(--foreground))]">Fragile Item</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresSetup}
                    onChange={(e) => handleChange('requiresSetup', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[hsl(var(--foreground))]">Requires Setup</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Status Section - Only for existing products */}
          {existingProduct && (
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                Product Status
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                    Current Status
                  </label>
                  <div className="flex gap-2">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-sm font-semibold',
                        existingProduct.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : existingProduct.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      )}
                    >
                      {existingProduct.status === 'published'
                        ? 'Active (Published)'
                        : existingProduct.status === 'draft'
                          ? 'Draft'
                          : 'Archived'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {existingProduct.status === 'published'
                    ? 'This product is live and visible to customers'
                    : existingProduct.status === 'draft'
                      ? 'This product is not visible to customers yet'
                      : 'This product is archived and not visible'}
                </p>
                <div className="pt-3 border-t border-[hsl(var(--border))]">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                    Use the action buttons below to change the status when saving
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Images Section */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
              Product Images *
            </h3>

            {/* Upload Area */}
            <div className="mb-4">
              <label className="block border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-6 text-center cursor-pointer hover:border-[hsl(var(--primary))] transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                <p className="text-sm text-[hsl(var(--foreground))] mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  PNG, JPG, WEBP up to 5MB each (5-10 images)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images}</p>}
            </div>

            {/* Image Previews */}
            {formData.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} uploaded
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {formData.images.map((image) => (
                    <div
                      key={image.id}
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
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-3">
            <Button
              onClick={() => handleSubmit(false)}
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                existingProduct ? 'Update Product' : 'Publish Product'
              )}
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              variant="outline"
              className="w-full"
              disabled={isUploading}
            >
              Save as Draft
            </Button>
            {existingProduct && (
              <Button
                onClick={handleMarkOutOfStock}
                variant="outline"
                className="w-full"
                disabled={isUploading}
              >
                Mark as Out of Stock
              </Button>
            )}
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="w-full"
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
