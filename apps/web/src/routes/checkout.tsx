import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useCart } from '@/stores/cart-store';
import { addOrder } from '@/stores/order-store';
import { addSavedCard } from '@/stores/saved-cards-store';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { DeliveryMethodStep } from '@/components/checkout/DeliveryMethodStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { OrderReviewStep } from '@/components/checkout/OrderReviewStep';
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { orpcClient } from '@/utils/orpc';
import { toast } from 'sonner';

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
  // bKash Payment
  bkashTransactionId?: string;
  bkashAmount?: number;
  bkashPaidAt?: string;
  // Card Payment
  cardTransactionId?: string;
  cardAmount?: number;
  cardPaidAt?: string;
  cardType?: string;
  cardLast4?: string;
  cardHolderName?: string;
  cardExpiryDate?: string;
  cardSaveCard?: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    bkashTransactionId: undefined,
    bkashAmount: undefined,
    bkashPaidAt: undefined,
    cardTransactionId: undefined,
    cardAmount: undefined,
    cardPaidAt: undefined,
    cardType: undefined,
    cardLast4: undefined,
    cardHolderName: undefined,
    cardExpiryDate: undefined,
    cardSaveCard: false,
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

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    const orderNum = orderNumber || `AYJ${Date.now().toString().slice(-8)}`;
    const subtotal = getSubtotal();
    const shipping = getShipping();
    const tax = getTax();
    const discount = getDiscount();
    const orderTotal = subtotal + tax + shipping - discount;

    try {
      const response = await orpcClient.order.placeOrder({
        orderNumber: orderNum,
        subtotal,
        shippingCost: shipping,
        tax,
        discount,
        total: orderTotal,
        shipping: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          division: formData.division,
          postalCode: formData.postalCode,
        },
        payment: {
          method: formData.paymentMethod as any,
          transactionId: formData.bkashTransactionId || formData.cardTransactionId,
          senderMobile: formData.mobileNumber,
        },
        items: items.map(item => ({
          productId: item.product.id,
          vendorId: item.product.vendor.id,
          title: item.product.title,
          price: item.product.pricing.currentPrice,
          quantity: item.quantity,
          variantInfo: undefined,
        }))
      });

      const newOrderId = response.id;
      const firstItemImage = items[0]?.product?.images?.[0]?.url;
      const placedAt = formData.bkashPaidAt || formData.cardPaidAt || new Date().toISOString();

      // For bKash/Card, if not yet paid, we stay on confirmation but with instructions
      const isPrepaid = formData.paymentMethod === 'bkash' || formData.paymentMethod === 'card' || formData.paymentMethod === 'nagad';
      const hasPaid = !!(formData.bkashTransactionId || formData.cardTransactionId);
      
      const initialStatus = hasPaid ? 'processing' : (isPrepaid ? 'awaiting_payment' : 'processing');

      // Keep updating local store
      addOrder({
        id: newOrderId,
        orderNumber: orderNum,
        date: placedAt,
        total: orderTotal,
        status: initialStatus as any,
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
          method: formData.paymentMethod as any,
          last4: formData.cardLast4 || formData.cardNumber?.slice(-4) || formData.mobileNumber?.slice(-4),
          provider: formData.paymentMethod === 'bkash' ? 'bKash' : formData.paymentMethod === 'card' ? formData.cardType : undefined,
          transactionId: formData.bkashTransactionId || formData.cardTransactionId,
          amount: formData.bkashAmount || formData.cardAmount,
          paidAt: formData.bkashPaidAt || formData.cardPaidAt,
          status: hasPaid ? 'PAID' : 'PENDING',
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

      // Save card if requested
      if (formData.paymentMethod === 'card' && formData.cardSaveCard && formData.cardLast4) {
        addSavedCard(
          formData.cardLast4,
          formData.cardType || 'CARD',
          formData.cardHolderName || '',
          formData.cardExpiryDate || ''
        );
      }

      setOrderNumber(orderNum);
      setOrderId(newOrderId);
      setIsOrderPlaced(true);
      setCurrentStep(5);
      clearCart();
      setDeliveryMethod(null);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
          <OrderReviewStep
            onBack={handleBackStep}
            onPlaceOrder={handleNextStep}
            onEditStep={(step) => setCurrentStep(step)}
            isSubmitting={isSubmitting}
            formData={formData}
          />
        );
      case 4:
        return (
          <PaymentStep
            onPlaceOrder={handlePlaceOrder}
            onBack={handleBackStep}
            formData={formData}
            onFormChange={handleFormChange}
            isSubmitting={isSubmitting}
            totalAmount={getTotal()}
          />
        );
      case 5:
        return (
          <ConfirmationStep
            orderDetails={{
              orderId: orderId,
              orderNumber: orderNumber,
              totalAmount: getTotal(),
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
                transactionId: formData.bkashTransactionId || formData.cardTransactionId,
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
