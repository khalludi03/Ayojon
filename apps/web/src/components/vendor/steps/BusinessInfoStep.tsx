import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VendorFormData } from '@/types/vendor';
import { Building2, Phone, MapPin, Hash, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessInfoStepProps {
  formData: VendorFormData;
  onFormChange: (field: keyof VendorFormData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

export function BusinessInfoStep({
  formData,
  onFormChange,
  onNext,
  onBack,
}: BusinessInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (!formData.taxId.trim()) newErrors.taxId = 'Tax ID / Trade License is required';
    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = 'Business phone is required';
    } else if (!validatePhone(formData.businessPhone)) {
      newErrors.businessPhone = 'Invalid phone number (use format: 01XXXXXXXXX)';
    }
    if (!formData.businessStreet.trim()) newErrors.businessStreet = 'Street address is required';
    if (!formData.businessCity.trim()) newErrors.businessCity = 'City is required';
    if (!formData.businessDivision) newErrors.businessDivision = 'Division is required';
    if (!formData.yearsInBusiness.trim()) {
      newErrors.yearsInBusiness = 'Years in business is required';
    } else if (parseInt(formData.yearsInBusiness) < 0) {
      newErrors.yearsInBusiness = 'Invalid number';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Business Information
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Tell us about your business
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-semibold">
            Business Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => {
                onFormChange('businessName', e.target.value);
                if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: '' }));
              }}
              placeholder="Your Business Name"
              className={cn(
                'pl-10',
                errors.businessName && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
          </div>
          {errors.businessName && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.businessName}</span>
            </div>
          )}
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="businessType" className="text-sm font-semibold">
            Business Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => {
              onFormChange('businessType', value);
              if (errors.businessType) setErrors((prev) => ({ ...prev, businessType: '' }));
            }}
          >
            <SelectTrigger
              className={cn(errors.businessType && 'border-red-500')}
            >
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual / Sole Proprietor</SelectItem>
              <SelectItem value="company">Private Limited Company</SelectItem>
              <SelectItem value="enterprise">Enterprise / Corporation</SelectItem>
            </SelectContent>
          </Select>
          {errors.businessType && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.businessType}</span>
            </div>
          )}
        </div>

        {/* Tax ID / Trade License */}
        <div className="space-y-2">
          <Label htmlFor="taxId" className="text-sm font-semibold">
            Tax ID / Trade License Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => {
                onFormChange('taxId', e.target.value);
                if (errors.taxId) setErrors((prev) => ({ ...prev, taxId: '' }));
              }}
              placeholder="Enter Tax ID or Trade License Number"
              className={cn(
                'pl-10',
                errors.taxId && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
          </div>
          {errors.taxId && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.taxId}</span>
            </div>
          )}
        </div>

        {/* Business Phone */}
        <div className="space-y-2">
          <Label htmlFor="businessPhone" className="text-sm font-semibold">
            Business Phone <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="businessPhone"
              type="tel"
              value={formData.businessPhone}
              onChange={(e) => {
                onFormChange('businessPhone', e.target.value);
                if (errors.businessPhone) setErrors((prev) => ({ ...prev, businessPhone: '' }));
              }}
              placeholder="01712345678"
              className={cn(
                'pl-10',
                errors.businessPhone && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
          </div>
          {errors.businessPhone && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.businessPhone}</span>
            </div>
          )}
        </div>

        {/* Business Address */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">
            Business Address <span className="text-red-500">*</span>
          </Label>

          {/* Street */}
          <div className="space-y-2">
            <Label htmlFor="businessStreet" className="text-xs text-[hsl(var(--muted-foreground))]">
              Street Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <Input
                id="businessStreet"
                value={formData.businessStreet}
                onChange={(e) => {
                  onFormChange('businessStreet', e.target.value);
                  if (errors.businessStreet) setErrors((prev) => ({ ...prev, businessStreet: '' }));
                }}
                placeholder="House/Building, Road, Area"
                className={cn(
                  'pl-10',
                  errors.businessStreet && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
            </div>
            {errors.businessStreet && (
              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.businessStreet}</span>
              </div>
            )}
          </div>

          {/* City and Postal Code */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessCity" className="text-xs text-[hsl(var(--muted-foreground))]">
                City
              </Label>
              <Input
                id="businessCity"
                value={formData.businessCity}
                onChange={(e) => {
                  onFormChange('businessCity', e.target.value);
                  if (errors.businessCity) setErrors((prev) => ({ ...prev, businessCity: '' }));
                }}
                placeholder="City"
                className={cn(
                  errors.businessCity && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {errors.businessCity && (
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.businessCity}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPostalCode" className="text-xs text-[hsl(var(--muted-foreground))]">
                Postal Code (optional)
              </Label>
              <Input
                id="businessPostalCode"
                value={formData.businessPostalCode}
                onChange={(e) => onFormChange('businessPostalCode', e.target.value)}
                placeholder="1234"
              />
            </div>
          </div>

          {/* Division */}
          <div className="space-y-2">
            <Label htmlFor="businessDivision" className="text-xs text-[hsl(var(--muted-foreground))]">
              Division
            </Label>
            <Select
              value={formData.businessDivision}
              onValueChange={(value) => {
                onFormChange('businessDivision', value);
                if (errors.businessDivision) setErrors((prev) => ({ ...prev, businessDivision: '' }));
              }}
            >
              <SelectTrigger
                className={cn(errors.businessDivision && 'border-red-500')}
              >
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {DIVISIONS.map((division) => (
                  <SelectItem key={division} value={division}>
                    {division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessDivision && (
              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.businessDivision}</span>
              </div>
            )}
          </div>
        </div>

        {/* Years in Business */}
        <div className="space-y-2">
          <Label htmlFor="yearsInBusiness" className="text-sm font-semibold">
            Years in Business <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="yearsInBusiness"
              type="number"
              min="0"
              value={formData.yearsInBusiness}
              onChange={(e) => {
                onFormChange('yearsInBusiness', e.target.value);
                if (errors.yearsInBusiness) setErrors((prev) => ({ ...prev, yearsInBusiness: '' }));
              }}
              placeholder="0"
              className={cn(
                'pl-10',
                errors.yearsInBusiness && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
          </div>
          {errors.yearsInBusiness && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.yearsInBusiness}</span>
            </div>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Enter 0 if you're starting a new business
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
          >
            ← Previous
          </Button>
          <Button
            type="submit"
            size="lg"
            className="min-w-[120px]"
          >
            Next →
          </Button>
        </div>
      </form>
    </div>
  );
}
