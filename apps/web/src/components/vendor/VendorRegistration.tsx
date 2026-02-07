import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { VendorFormData, VendorApplication } from '@/types/vendor';
import { addVendorApplication } from '@/stores/vendor-application-store';
import { authClient } from '@/lib/auth-client';
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
      console.error('No user ID found. User must be authenticated.');
      return;
    }

    // Create vendor application linked to authenticated user
    const application: VendorApplication = {
      id: `vendor-${Date.now()}`,
      userId, // Link to authenticated user
      email: formData.email,
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
      storeLogo: formData.storeLogo?.name, // In real app, upload to server
      storeBanner: formData.storeBanner?.name,
      documents: {
        tradeLicense: formData.tradeLicense?.name,
        identification: formData.identification?.name,
        bankDetails: formData.bankDetails?.name,
      },
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    // Save application (in real app, this would be saved to backend)
    addVendorApplication(application);
    setApplicationId(application.id);

    // Mock: Send email notification (in real app, this would be done on backend)
    console.log('Vendor application submitted:', application);
    console.log('User is now authenticated with ID:', userId);

    // Show confirmation
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
