import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Upload,
  X,
  Eye,
  Check,
  Store,
  FileText,
  Phone,
  Globe,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorStoreFormData } from '@/types/vendor-store';
import {
  getVendorStoreSettings,
  updateVendorStoreSettings,
} from '@/stores/vendor-store-settings-store';

export function VendorSettingsPage() {
  // Mock vendor ID - in real app, get from auth context
  const vendorId = 'vendor-1';

  const [formData, setFormData] = useState<VendorStoreFormData>({
    storeName: '',
    storeDescription: '',
    returnPolicy: '',
    shippingPolicy: '',
    cancellationPolicy: '',
    businessPhone: '',
    businessEmail: '',
    businessHours: '',
    facebookUrl: '',
    instagramUrl: '',
    websiteUrl: '',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const settings = getVendorStoreSettings(vendorId);
    setFormData({
      storeName: settings.storeName,
      storeDescription: settings.storeDescription,
      returnPolicy: settings.returnPolicy,
      shippingPolicy: settings.shippingPolicy,
      cancellationPolicy: settings.cancellationPolicy,
      businessPhone: settings.businessPhone,
      businessEmail: settings.businessEmail,
      businessHours: settings.businessHours,
      facebookUrl: settings.facebookUrl || '',
      instagramUrl: settings.instagramUrl || '',
      websiteUrl: settings.websiteUrl || '',
    });
    setLogoPreview(settings.logo || '');
    setBannerPreview(settings.banner || '');
  };

  const handleChange = (field: keyof VendorStoreFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, logo: file }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, banner: file }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setFormData((prev) => ({ ...prev, logo: undefined }));
    setHasChanges(true);
  };

  const handleRemoveBanner = () => {
    setBannerPreview('');
    setFormData((prev) => ({ ...prev, banner: undefined }));
    setHasChanges(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    if (!formData.storeDescription.trim()) {
      newErrors.storeDescription = 'Store description is required';
    }

    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = 'Business phone is required';
    } else if (!/^01[0-9]{9}$/.test(formData.businessPhone.replace(/[\s-]/g, ''))) {
      newErrors.businessPhone = 'Invalid phone number format (01XXXXXXXXX)';
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Invalid email format';
    }

    if (formData.facebookUrl && !isValidUrl(formData.facebookUrl)) {
      newErrors.facebookUrl = 'Invalid URL format';
    }

    if (formData.instagramUrl && !isValidUrl(formData.instagramUrl)) {
      newErrors.instagramUrl = 'Invalid URL format';
    }

    if (formData.websiteUrl && !isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Invalid URL format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      updateVendorStoreSettings(vendorId, {
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        logo: logoPreview || undefined,
        banner: bannerPreview || undefined,
        returnPolicy: formData.returnPolicy,
        shippingPolicy: formData.shippingPolicy,
        cancellationPolicy: formData.cancellationPolicy,
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        businessHours: formData.businessHours,
        facebookUrl: formData.facebookUrl || undefined,
        instagramUrl: formData.instagramUrl || undefined,
        websiteUrl: formData.websiteUrl || undefined,
      });

      setIsSaving(false);
      setHasChanges(false);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const handlePreviewStore = () => {
    // In a real app, this would navigate to the vendor's public store page
    console.log('Preview store:', vendorId);
    alert('Store preview feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Store Settings</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreviewStore}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Store
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Customize your store appearance and information
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-400">
                Changes saved successfully!
              </p>
              <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                Your store settings have been updated
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Basic Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  placeholder="e.g., Fashion Paradise"
                  className={errors.storeName ? 'border-red-500' : ''}
                />
                {errors.storeName && (
                  <p className="text-sm text-red-500 mt-1">{errors.storeName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="storeDescription">Store Description *</Label>
                <Textarea
                  id="storeDescription"
                  value={formData.storeDescription}
                  onChange={(e) => handleChange('storeDescription', e.target.value)}
                  placeholder="Describe your store and what makes it unique..."
                  rows={4}
                  className={errors.storeDescription ? 'border-red-500' : ''}
                />
                {errors.storeDescription && (
                  <p className="text-sm text-red-500 mt-1">{errors.storeDescription}</p>
                )}
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {formData.storeDescription.length} characters
                </p>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Branding</h2>
            </div>

            <div className="space-y-6">
              {/* Logo */}
              <div>
                <Label>Store Logo</Label>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                  Recommended size: 200x200px
                </p>
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-32 w-32 rounded-lg object-cover border border-[hsl(var(--border))]"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-6 text-center cursor-pointer hover:border-[hsl(var(--primary))] transition-colors max-w-xs">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                    <p className="text-sm text-[hsl(var(--foreground))] mb-1">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      PNG, JPG up to 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Banner */}
              <div>
                <Label>Store Banner</Label>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                  Recommended size: 1200x400px
                </p>
                {bannerPreview ? (
                  <div className="relative inline-block w-full max-w-2xl">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-48 rounded-lg object-cover border border-[hsl(var(--border))]"
                    />
                    <button
                      onClick={handleRemoveBanner}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-6 text-center cursor-pointer hover:border-[hsl(var(--primary))] transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
                    <p className="text-sm text-[hsl(var(--foreground))] mb-1">
                      Click to upload banner
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      PNG, JPG up to 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Store Policies */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Store Policies
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Textarea
                  id="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={(e) => handleChange('returnPolicy', e.target.value)}
                  placeholder="Describe your return policy..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="shippingPolicy">Shipping Policy</Label>
                <Textarea
                  id="shippingPolicy"
                  value={formData.shippingPolicy}
                  onChange={(e) => handleChange('shippingPolicy', e.target.value)}
                  placeholder="Describe your shipping policy..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={(e) => handleChange('cancellationPolicy', e.target.value)}
                  placeholder="Describe your cancellation policy..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Contact Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="businessPhone">Business Phone *</Label>
                  <Input
                    id="businessPhone"
                    value={formData.businessPhone}
                    onChange={(e) => handleChange('businessPhone', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={errors.businessPhone ? 'border-red-500' : ''}
                  />
                  {errors.businessPhone && (
                    <p className="text-sm text-red-500 mt-1">{errors.businessPhone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="businessEmail">Business Email *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleChange('businessEmail', e.target.value)}
                    placeholder="business@example.com"
                    className={errors.businessEmail ? 'border-red-500' : ''}
                  />
                  {errors.businessEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.businessEmail}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Textarea
                  id="businessHours"
                  value={formData.businessHours}
                  onChange={(e) => handleChange('businessHours', e.target.value)}
                  placeholder="e.g., Monday - Friday: 9:00 AM - 6:00 PM"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Social Media Links
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/yourstore"
                  className={errors.facebookUrl ? 'border-red-500' : ''}
                />
                {errors.facebookUrl && (
                  <p className="text-sm text-red-500 mt-1">{errors.facebookUrl}</p>
                )}
              </div>

              <div>
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/yourstore"
                  className={errors.instagramUrl ? 'border-red-500' : ''}
                />
                {errors.instagramUrl && (
                  <p className="text-sm text-red-500 mt-1">{errors.instagramUrl}</p>
                )}
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  placeholder="https://yourstore.com"
                  className={errors.websiteUrl ? 'border-red-500' : ''}
                />
                {errors.websiteUrl && (
                  <p className="text-sm text-red-500 mt-1">{errors.websiteUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreviewStore}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Store
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
