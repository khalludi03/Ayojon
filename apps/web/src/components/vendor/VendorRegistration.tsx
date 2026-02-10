import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { VendorFormData } from '@/types/vendor';
import { authClient } from '@/lib/auth-client';
import { orpcClient } from '@/utils/orpc';
import { uploadFile } from '@/lib/storage-utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { VendorProgressBar } from './VendorProgressBar';
import { AccountStep } from './steps/AccountStep';
import { BusinessInfoStep } from './steps/BusinessInfoStep';
import { StoreDetailsStep } from './steps/StoreDetailsStep';
import { VerificationStep } from './steps/VerificationStep';
import { ConfirmationStep } from './ConfirmationStep';

const TOTAL_STEPS = 4;

export function VendorRegistration() {
  const navigate = useNavigate();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [isStep1Skipped, setIsStep1Skipped] = useState(false);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

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

  // Automatically skip step 1 if user is logged in
  useEffect(() => {
    if (session?.user && !isStep1Skipped) {
      const user = session.user as any;
      
      // If already a vendor or application is in progress, mark as already applied
      if (user.vendorStatus === 'pending' || (user.role === 'vendor' && user.vendorStatus === 'approved') || user.vendorStatus === 'rejected') {
        setIsAlreadyApplied(true);
        return;
      }

      if (currentStep === 1) {
        setUserId(session.user.id);
        setFormData(prev => ({
          ...prev,
          email: session.user.email
        }));
        setCurrentStep(2);
        setIsStep1Skipped(true);
        toast.info(`Logged in as ${session.user.email}. Skipping account creation.`);
      }
    }
  }, [session, currentStep, isStep1Skipped]);

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
    try {
      toast.loading('Processing your application...', { id: 'submit-app' });

      // 1. Create account if not already logged in
      let currentUserId = userId || (session?.user?.id as string);
      
      if (!currentUserId) {
        toast.loading('Creating account...', { id: 'submit-app' });
        const result = await handleAccountCreation(
          formData.email,
          formData.password,
          formData.businessName || formData.email.split('@')[0]
        );

        if (!result.success || !result.userId) {
          toast.error(result.error || 'Failed to create account', { id: 'submit-app' });
          return;
        }
        currentUserId = result.userId;
        
        // Wait a small amount of time for the session to be established
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.loading('Uploading documents...', { id: 'submit-app' });
      // 2. Upload files if they exist
      let logoUrl = '';
      let bannerUrl = '';
      let tradeLicenseUrl = '';
      let identificationUrl = '';
      let bankDetailsUrl = '';

      if (formData.storeLogo instanceof File) {
        logoUrl = await uploadFile(formData.storeLogo, 'vendor/logos', formData.storeLogo.type);
      }
      if (formData.storeBanner instanceof File) {
        bannerUrl = await uploadFile(formData.storeBanner, 'vendor/banners', formData.storeBanner.type);
      }
      if (formData.tradeLicense instanceof File) {
        tradeLicenseUrl = await uploadFile(formData.tradeLicense, 'vendor/documents', formData.tradeLicense.type);
      }
      if (formData.identification instanceof File) {
        identificationUrl = await uploadFile(formData.identification, 'vendor/documents', formData.identification.type);
      }
      if (formData.bankDetails instanceof File) {
        bankDetailsUrl = await uploadFile(formData.bankDetails, 'vendor/documents', formData.bankDetails.type);
      }

      // 3. Submit application to backend
      toast.loading('Submitting application...', { id: 'submit-app' });
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

  if (isSessionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent"></div>
        <span className="ml-3 text-[hsl(var(--muted-foreground))]">Loading...</span>
      </div>
    );
  }

  if (isAlreadyApplied) {
    const user = session?.user as any;
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <svg className="h-12 w-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
          Registration Already Completed
        </h2>
        <p className="mb-8 text-[hsl(var(--muted-foreground))]">
          {user?.vendorStatus === 'pending' 
            ? "You have already completed all 4 steps of the registration process. Your application is currently under review by our team."
            : user?.vendorStatus === 'approved'
            ? "Your vendor account is already active! You can now manage your store from the dashboard."
            : "Your previous application has been processed. Please contact support if you have any questions."}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            Back to Home
          </Button>
          {user?.vendorStatus === 'approved' ? (
            <Button onClick={() => navigate({ to: '/vendor/dashboard' })}>
              Go to Dashboard
            </Button>
          ) : (
            <Button onClick={() => navigate({ to: '/vendor/application-pending' })}>
              View Application Status
            </Button>
          )}
        </div>
      </div>
    );
  }

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
