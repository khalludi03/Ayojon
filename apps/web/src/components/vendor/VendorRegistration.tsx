import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { VendorFormData } from '@/types/vendor';
import { authClient } from '@/lib/auth-client';
import { orpcClient } from '@/utils/orpc';
import { uploadFile } from '@/lib/storage-utils';
import { toast } from 'sonner';
import { VendorProgressBar } from './VendorProgressBar';
import { AccountStep } from './steps/AccountStep';
import { BusinessInfoStep } from './steps/BusinessInfoStep';
import { StoreDetailsStep } from './steps/StoreDetailsStep';
import { VerificationStep } from './steps/VerificationStep';
import { ConfirmationStep } from './ConfirmationStep';

const TOTAL_STEPS = 4;

export function VendorRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [userId, setUserId] = useState<string>('');

  const [formData, setFormData] = useState<VendorFormData>({
    // Step 1 - Account
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2 - Business Info
    businessName: '',
    businessType: '',
    taxId: '',
    businessPhone: '',
    businessStreet: '',
    businessCity: '',
    businessDivision: '',
    businessPostalCode: '',
    yearsInBusiness: '',

    // Step 3 - Store Details
    storeName: '',
    storeDescription: '',
    productCategories: [],
    storeLogo: undefined,
    storeBanner: undefined,

    // Step 4 - Verification Documents
    tradeLicense: undefined,
    identification: undefined,
    bankDetails: undefined,
  });

  const handleFormChange = (field: keyof VendorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAccountCreation = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string; userId?: string }> => {
    try {
      // Create user account with better-auth
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to create account' };
      }

      if (data?.user) {
        // Store user ID for linking vendor application
        setUserId(data.user.id);
        return { success: true, userId: data.user.id };
      }

      return { success: false, error: 'Account created but user data not returned' };
    } catch (err) {
      console.error('Account creation error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error('No user ID found. User must be authenticated.');
      return;
    }

    try {
      toast.loading('Submitting application...', { id: 'submit-app' });

      // 1. Upload files if they exist
      let logoUrl = '';
      let bannerUrl = '';
      let tradeLicenseUrl = '';
      let identificationUrl = '';
      let bankDetailsUrl = '';

      if (formData.storeLogo instanceof File) {
        logoUrl = await uploadFile(formData.storeLogo, 'vendor/logos');
      }
      if (formData.storeBanner instanceof File) {
        bannerUrl = await uploadFile(formData.storeBanner, 'vendor/banners');
      }
      if (formData.tradeLicense instanceof File) {
        tradeLicenseUrl = await uploadFile(formData.tradeLicense, 'vendor/documents');
      }
      if (formData.identification instanceof File) {
        identificationUrl = await uploadFile(formData.identification, 'vendor/documents');
      }
      if (formData.bankDetails instanceof File) {
        bankDetailsUrl = await uploadFile(formData.bankDetails, 'vendor/documents');
      }

      // 2. Submit application to backend
      const response = await orpcClient.vendor.submitVendorApplication({
        businessName: formData.businessName,
        businessType: formData.businessType as any,
        taxId: formData.taxId,
        businessPhone: formData.businessPhone,
        businessAddress: {
          street: formData.businessStreet,
          city: formData.businessCity,
          division: formData.businessDivision,
          postalCode: formData.businessPostalCode,
        },
        yearsInBusiness: parseInt(formData.yearsInBusiness) || 0,
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        productCategories: formData.productCategories,
        logoUrl: logoUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        tradeLicenseUrl: tradeLicenseUrl || undefined,
        identificationUrl: identificationUrl || undefined,
        bankDetailsUrl: bankDetailsUrl || undefined,
      });

      setApplicationId(response.applicationId);
      setIsSubmitted(true);
      toast.success('Application submitted successfully!', { id: 'submit-app' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Application submission error:', err);
      toast.error('Failed to submit application. Please try again.', { id: 'submit-app' });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountStep
            formData={formData}
            onFormChange={handleFormChange}
            onNext={handleNext}
            onAccountCreation={handleAccountCreation}
          />
        );
      case 2:
        return (
          <BusinessInfoStep
            formData={formData}
            onFormChange={handleFormChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StoreDetailsStep
            formData={formData}
            onFormChange={handleFormChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <VerificationStep
            formData={formData}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <ConfirmationStep
        applicationId={applicationId}
        email={formData.email}
        onBackToHome={() => navigate({ to: '/' })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] sm:text-4xl">
          Become a Vendor
        </h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Join our marketplace and start selling your products
        </p>
      </div>

      {/* Progress Bar */}
      <VendorProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Form Steps */}
      <div className="mt-8">{renderStep()}</div>
    </div>
  );
}
