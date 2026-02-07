import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useCart } from '@/stores/cart-store';
import { addOrder } from '@/stores/order-store';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { DeliveryMethodStep } from '@/components/checkout/DeliveryMethodStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { OrderReviewStep } from '@/components/checkout/OrderReviewStep';
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
  // Delivery
  deliveryMethod: string;
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
  const {
    items,
    getSubtotal,
    getShipping,
    getTax,
    getDiscount,
    getTotal,
    clearCart,
    setDeliveryMethod,
  } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
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
    deliveryMethod: '',
    paymentMethod: '',
    cardNumber: undefined,
    cardName: undefined,
    expiryDate: undefined,
    cvv: undefined,
    mobileNumber: undefined,
  });

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0 && currentStep !== 5 && !isOrderPlaced) {
      navigate({ to: '/cart' });
    }
  }, [items, navigate, currentStep, isOrderPlaced]);

  // Generate order number when reaching confirmation
  useEffect(() => {
    if (currentStep === 5 && !orderNumber) {
      const orderNum = `AYJ${Date.now().toString().slice(-8)}`;
      setOrderNumber(orderNum);
    }
  }, [currentStep, orderNumber]);

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Sync delivery method with cart store
    if (field === 'deliveryMethod' && typeof value === 'string') {
      setDeliveryMethod(value as 'standard' | 'express' | 'same-day');
    }
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = () => {
    const orderNum = orderNumber || `AYJ${Date.now().toString().slice(-8)}`;
    const newOrderId = `${Date.now()}`;
    const firstItemImage = items[0]?.product?.images?.[0]?.url;
    const placedAt = new Date().toISOString();
    const subtotal = getSubtotal();
    const shipping = getShipping();
    const tax = getTax();
    const discount = getDiscount();
    const orderTotal = subtotal + tax + shipping - discount;

    addOrder({
      id: newOrderId,
      orderNumber: orderNum,
      date: placedAt,
      total: orderTotal,
      status: 'processing',
      items: items.reduce((total, item) => total + item.quantity, 0),
      imageUrl: firstItemImage,
      deliveryMethod: formData.deliveryMethod,
      lineItems: items.map((item) => ({
        id: item.id,
        title: item.product.title,
        quantity: item.quantity,
        price: item.product.pricing.currentPrice,
        imageUrl: item.product.images?.[0]?.url,
        productId: item.product.id,
        product: item.product,
      })),
      address: {
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
      payment: {
        method: formData.paymentMethod,
        last4: formData.cardNumber?.slice(-4) || formData.mobileNumber?.slice(-4),
        provider: formData.paymentMethod === 'bkash' ? 'bKash' : undefined,
        status: 'PENDING',
      },
      pricing: {
        subtotal,
        shipping,
        tax,
        discount,
        total: orderTotal,
      },
      timeline: {
        placedAt,
      },
    });

    setOrderNumber(orderNum);
    setOrderId(newOrderId);
    setIsOrderPlaced(true);
    setCurrentStep(5);
    clearCart();
    setDeliveryMethod(null);
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
          <DeliveryMethodStep
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
          <OrderReviewStep
            onBack={handleBackStep}
            onPlaceOrder={handlePlaceOrder}
            onEditStep={(step) => setCurrentStep(step)}
            formData={formData}
          />
        );
      case 5:
        return (
          <ConfirmationStep
            orderDetails={{
              orderId: orderId,
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
                deliveryMethod: formData.deliveryMethod,
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

  if (items.length === 0 && currentStep !== 5 && !isOrderPlaced) {
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
            Complete your order in {currentStep === 5 ? '5' : '5 simple'} steps
          </p>
        </div>

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={currentStep} />

        {/* Mobile Summary Toggle (only show on steps 1-4) */}
        {currentStep < 5 && (
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
        {currentStep < 5 && isSummaryOpen && (
          <div className="mb-6 lg:hidden">
            <CheckoutOrderSummary />
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Checkout Steps - 2/3 width on desktop */}
          <div className="lg:col-span-2">{renderStep()}</div>

          {/* Order Summary Sidebar - 1/3 width, sticky on desktop, only show on steps 1-4 */}
          {currentStep < 5 && (
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
