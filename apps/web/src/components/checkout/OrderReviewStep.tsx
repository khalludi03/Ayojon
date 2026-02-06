import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCart, type CartItem } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Mail, MapPin, Package, Phone, Truck, User } from "lucide-react";

interface OrderReviewStepProps {
  onBack: () => void;
  onPlaceOrder: () => void;
  onEditStep: (step: number) => void;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    division: string;
    postalCode: string;
    deliveryMethod: string;
    paymentMethod: string;
  };
}

export function OrderReviewStep({
  onBack,
  onPlaceOrder,
  onEditStep,
  formData,
}: OrderReviewStepProps) {
  const { items, getSubtotal, getShipping, getTax, getTotal } = useCart();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case "standard":
        return "Standard Delivery (3-5 business days)";
      case "express":
        return "Express Delivery (1-2 business days)";
      case "same-day":
        return "Same-Day Delivery (Order before 12 PM)";
      default:
        return "Delivery method not selected";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card":
        return "Credit/Debit Card";
      case "bkash":
        return "bKash";
      case "nagad":
        return "Nagad";
      case "cod":
        return "Cash on Delivery";
      default:
        return "Payment method not selected";
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Review Your Order
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Confirm all details before placing your order
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                Items
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))] hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              <span>Product</span>
              <span>Total</span>
            </div>
            <div className="space-y-3">
              {items.map((item: CartItem) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images?.[0]?.url || '/placeholder.png'}
                      alt={item.product.images?.[0]?.alt || item.product.title}
                      className="h-12 w-12 rounded-md border border-[hsl(var(--border))] object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {item.product.title}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    {formatPrice(item.product.pricing.currentPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                  Delivery Address
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))] hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="mt-4 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
              <p className="font-medium text-[hsl(var(--foreground))]">
                {formData.fullName}
              </p>
              <p>{formData.addressLine1}</p>
              {formData.addressLine2 && <p>{formData.addressLine2}</p>}
              <p>
                {formData.city}, {formData.division}
                {formData.postalCode ? ` - ${formData.postalCode}` : ""}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                  Delivery Method
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))] hover:underline"
              >
                Edit
              </button>
            </div>
            <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
              {getDeliveryMethodLabel(formData.deliveryMethod)}
            </p>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                  Contact Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))] hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{formData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{formData.phone}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                  Payment Method
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))] hover:underline"
              >
                Edit
              </button>
            </div>
            <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
              {getPaymentMethodLabel(formData.paymentMethod)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
              Total Amount
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
              <span className="font-medium text-[hsl(var(--foreground))]">
                {formatPrice(getSubtotal())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Delivery</span>
              <span className="font-medium text-[hsl(var(--foreground))]">
                {formatPrice(getShipping())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Tax</span>
              <span className="font-medium text-[hsl(var(--foreground))]">
                {formatPrice(getTax())}
              </span>
            </div>
            <div className="flex justify-between border-t border-[hsl(var(--border))] pt-3 text-base font-bold text-[hsl(var(--foreground))]">
              <span>Total to Pay</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-6">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              id="agree-terms"
            />
            <label htmlFor="agree-terms" className="text-sm text-[hsl(var(--foreground))]">
              I agree to the Terms & Conditions
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            ← Back
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                disabled={!agreedToTerms}
              >
                Place Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Order</DialogTitle>
                <DialogDescription>
                  Are you sure you want to place this order?
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={onPlaceOrder}>Yes, Place Order</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
