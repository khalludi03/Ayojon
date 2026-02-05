import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useCart } from '@/stores/cart-store';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { SchedulingStep } from '@/components/checkout/SchedulingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
});

interface FormData {
  // Shipping
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  division: string;
  postalCode: string;
  addressType: 'home' | 'office';
  saveAddress: boolean;
  // Scheduling
  deliveryDate: string;
  deliveryTime: string;
  // Payment
  paymentMethod: string;
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  mobileNumber?: string;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    division: '',
    postalCode: '',
    addressType: 'home',
    saveAddress: false,
    deliveryDate: '',
    deliveryTime: '',
    paymentMethod: '',
    cardNumber: undefined,
    cardName: undefined,
    expiryDate: undefined,
    cvv: undefined,
    mobileNumber: undefined,
  });

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0 && currentStep !== 4) {
      navigate({ to: '/cart' });
    }
  }, [items, navigate, currentStep]);

  // Generate order number when reaching confirmation
  useEffect(() => {
    if (currentStep === 4 && !orderNumber) {
      const orderNum = `AYJ${Date.now().toString().slice(-8)}`;
      setOrderNumber(orderNum);
    }
  }, [currentStep, orderNumber]);

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ShippingStep
            onNext={handleNextStep}
            formData={formData}
            onFormChange={handleFormChange}
          />
        );
      case 2:
        return (
          <SchedulingStep
            onNext={handleNextStep}
            onBack={handleBackStep}
            formData={formData}
            onFormChange={handleFormChange}
          />
        );
      case 3:
        return (
          <PaymentStep
            onNext={handleNextStep}
            onBack={handleBackStep}
            formData={formData}
            onFormChange={handleFormChange}
          />
        );
      case 4:
        return (
          <ConfirmationStep
            orderDetails={{
              orderNumber: orderNumber,
              shipping: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                division: formData.division,
                postalCode: formData.postalCode,
                addressType: formData.addressType,
              },
              scheduling: {
                deliveryDate: formData.deliveryDate,
                deliveryTime: formData.deliveryTime,
              },
              payment: {
                paymentMethod: formData.paymentMethod,
              },
            }}
          />
        );
      default:
        return null;
    }
  };

  if (items.length === 0 && currentStep !== 4) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Complete your order in {currentStep === 4 ? '4' : '4 simple'} steps
          </p>
        </div>

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={currentStep} />

        {/* Mobile Summary Toggle (only show on steps 1-3) */}
        {currentStep < 4 && (
          <div className="mb-4 lg:hidden">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            >
              <span>Order Summary</span>
              {isSummaryOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Mobile Collapsible Summary */}
        {currentStep < 4 && isSummaryOpen && (
          <div className="mb-6 lg:hidden">
            <CheckoutOrderSummary />
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Checkout Steps - 2/3 width on desktop */}
          <div className="lg:col-span-2">{renderStep()}</div>

          {/* Order Summary Sidebar - 1/3 width, sticky on desktop, only show on steps 1-3 */}
          {currentStep < 4 && (
            <div className="hidden lg:block">
              <div className="lg:sticky lg:top-24">
                <CheckoutOrderSummary />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
