import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { VendorFormData } from '@/types/vendor';
import { Upload, FileText, X, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationStepProps {
  formData: VendorFormData;
  onFormChange: (field: keyof VendorFormData, value: any) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function VerificationStep({
  formData,
  onFormChange,
  onSubmit,
  onBack,
}: VerificationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (field: keyof VendorFormData, file: File | undefined) => {
    onFormChange(field, file);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.tradeLicense) newErrors.tradeLicense = 'Trade license is required';
    if (!formData.identification) newErrors.identification = 'ID document is required';
    if (!formData.bankDetails) newErrors.bankDetails = 'Bank details are required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      // Simulate submission delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onSubmit();
    }
  };

  const FileUploadBox = ({
    field,
    label,
    description,
    file,
  }: {
    field: keyof VendorFormData;
    label: string;
    description: string;
    file?: File;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        {label} <span className="text-red-500">*</span>
      </Label>
      <div
        className={cn(
          'rounded-lg border-2 border-dashed p-4',
          errors[field]
            ? 'border-red-500'
            : 'border-[hsl(var(--border))]'
        )}
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileUpload(field, undefined)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label htmlFor={field} className="flex flex-col items-center cursor-pointer">
            <Upload className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
            <span className="text-sm text-[hsl(var(--muted-foreground))] text-center">
              Click to upload {label}
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1 text-center">
              {description}
            </span>
            <input
              id={field}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileUpload(field, e.target.files?.[0])}
              disabled={isSubmitting}
            />
          </label>
        )}
      </div>
      {errors[field] && (
        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3 w-3" />
          <span>{errors[field]}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Verification Documents
          </h2>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Upload required documents for verification
        </p>
      </div>

      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Required Documents:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Trade License (PDF or image)</li>
                <li>NID / Passport (clear scan or photo)</li>
                <li>Bank Account Details (statement or cheque)</li>
              </ul>
              <p className="mt-2 text-xs">
                All documents will be reviewed by our team within 2-3 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Trade License */}
        <FileUploadBox
          field="tradeLicense"
          label="Trade License"
          description="PDF or Image (max 5MB)"
          file={formData.tradeLicense}
        />

        {/* NID/Passport */}
        <FileUploadBox
          field="identification"
          label="NID / Passport"
          description="Clear scan or photo (max 5MB)"
          file={formData.identification}
        />

        {/* Bank Details */}
        <FileUploadBox
          field="bankDetails"
          label="Bank Account Details"
          description="Bank statement or cheque (max 5MB)"
          file={formData.bankDetails}
        />

        {/* Security Notice */}
        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
            <Shield className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Your documents are encrypted and securely stored. We only use them for verification purposes.
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            disabled={isSubmitting}
          >
            ← Previous
          </Button>
          <Button
            type="submit"
            size="lg"
            className="min-w-[160px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
