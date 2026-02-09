import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Upload,
  X,
  Store,
  Phone,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { orpcClient } from '@/utils/orpc';
import { uploadFile } from '@/lib/storage-utils';
import { toast } from 'sonner';

export function VendorSettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
    bannerUrl: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadVendorProfile();
  }, []);

  const loadVendorProfile = async () => {
    try {
      setIsLoading(true);
      const response = await orpcClient.vendor.getVendorProfile();
      
      if (response.vendor) {
        const v = response.vendor;
        setFormData({
          name: v.name || '',
          description: v.description || '',
          address: v.address || '',
          phone: v.phone || '',
          email: v.email || '',
          logoUrl: v.logoUrl || '',
          bannerUrl: v.bannerUrl || '',
        });
        setLogoPreview(v.logoUrl || '');
        setBannerPreview(v.bannerUrl || '');
      }
    } catch (err) {
      console.error('Failed to load vendor profile:', err);
      toast.error('Failed to load store settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
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
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setHasChanges(true);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
      setHasChanges(true);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setLogoFile(null);
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    setHasChanges(true);
  };

  const handleRemoveBanner = () => {
    setBannerPreview('');
    setBannerFile(null);
    setFormData(prev => ({ ...prev, bannerUrl: '' }));
    setHasChanges(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Store description is required';
    }

    if (formData.phone && !/^01[0-9]{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Invalid phone number format (01XXXXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    const saveToastId = toast.loading('Saving changes...');

    try {
      let currentLogoUrl = formData.logoUrl;
      let currentBannerUrl = formData.bannerUrl;

      // 1. Upload new files if selected
      if (logoFile) {
        currentLogoUrl = await uploadFile(logoFile, 'vendor/logos');
      }
      if (bannerFile) {
        currentBannerUrl = await uploadFile(bannerFile, 'vendor/banners');
      }

      // 2. Save to backend
      await orpcClient.vendor.updateVendorProfile({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        logoUrl: currentLogoUrl || undefined,
        bannerUrl: currentBannerUrl || undefined,
      });

      setFormData(prev => ({
        ...prev,
        logoUrl: currentLogoUrl,
        bannerUrl: currentBannerUrl
      }));
      
      setLogoFile(null);
      setBannerFile(null);
      setHasChanges(false);
      toast.success('Store settings updated successfully!', { id: saveToastId });
    } catch (err) {
      console.error('Failed to save vendor profile:', err);
      toast.error('Failed to save changes. Please try again.', { id: saveToastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Store Settings</h1>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Customize your store appearance and information
          </p>
        </div>

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
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Fashion Paradise"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Store Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your store..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
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
                  <Label htmlFor="phone">Business Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Shop location..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[hsl(var(--border))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}