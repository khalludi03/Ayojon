import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Banknote, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
  formData: {
    paymentMethod: string;
    cardNumber?: string;
    cardName?: string;
    expiryDate?: string;
    cvv?: string;
    mobileNumber?: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export function PaymentStep({ 
  onNext, 
  onBack, 
  formData, 
  onFormChange 
}: PaymentStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on payment method
    if (formData.paymentMethod === 'card') {
      if (formData.cardNumber && formData.cardName && formData.expiryDate && formData.cvv) {
        onNext();
      }
    } else if (formData.paymentMethod === 'mobile') {
      if (formData.mobileNumber) {
        onNext();
      }
    } else if (formData.paymentMethod === 'cod') {
      onNext();
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      label: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex',
      badge: '🔒 Secure',
    },
    {
      id: 'mobile',
      label: 'Mobile Payment',
      icon: Smartphone,
      description: 'bKash, Nagad, Rocket',
      badge: '⚡ Instant',
    },
    {
      id: 'cod',
      label: 'Cash on Delivery',
      icon: Banknote,
      description: 'Pay when you receive',
      badge: '✨ Popular',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))]/20 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-3">
            <Lock className="h-6 w-6 text-[hsl(var(--primary))]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Payment Information
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Choose your payment method and complete the details
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Select Payment Method <span className="text-red-500">*</span>
            </Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={cn(
                      "group relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 p-5 transition-all duration-200",
                      formData.paymentMethod === method.id
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-md scale-[1.02]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={(e) => onFormChange('paymentMethod', e.target.value)}
                      className="sr-only"
                      required
                    />
                    <Icon 
                      className={cn(
                        "h-8 w-8 transition-colors",
                        formData.paymentMethod === method.id 
                          ? "text-[hsl(var(--primary))]" 
                          : "text-[hsl(var(--muted-foreground))]"
                      )} 
                    />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {method.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                        {method.description}
                      </p>
                      <span className="mt-2 inline-block text-xs font-medium text-[hsl(var(--primary))]">
                        {method.badge}
                      </span>
                    </div>
                    
                    {/* Selected indicator */}
                    {formData.paymentMethod === method.id && (
                      <div className="absolute right-2 top-2 rounded-full bg-[hsl(var(--primary))] p-1">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Credit/Debit Card Details */}
          {formData.paymentMethod === 'card' && (
            <div className="space-y-4 rounded-lg border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-br from-[hsl(var(--muted))]/30 to-transparent p-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[hsl(var(--border))]">
                <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="font-semibold text-[hsl(var(--foreground))]">
                  Card Details
                </h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-sm font-semibold">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('cardNumber', e.target.value)}
                  placeholder="Enter your card number"
                  maxLength={19}
                  className="font-mono text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-sm font-semibold">Cardholder Name *</Label>
                <Input
                  id="cardName"
                  value={formData.cardName || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('cardName', e.target.value)}
                  placeholder="Enter name as shown on card"
                  className="uppercase"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-sm font-semibold">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    value={formData.expiryDate || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('expiryDate', e.target.value)}
                    placeholder="Enter expiry (MM/YY)"
                    maxLength={5}
                    className="font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv" className="flex items-center gap-1 text-sm font-semibold">
                    CVV *
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">(3-4 digits)</span>
                  </Label>
                  <Input
                    id="cvv"
                    value={formData.cvv || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('cvv', e.target.value)}
                    placeholder="Enter CVV code"
                    maxLength={4}
                    type="password"
                    className="font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-green-700 dark:text-green-300">
                  Your card information is encrypted and secure
                </p>
              </div>
            </div>
          )}

          {/* Mobile Payment Details */}
          {formData.paymentMethod === 'mobile' && (
            <div className="space-y-4 rounded-lg border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-br from-[hsl(var(--muted))]/30 to-transparent p-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[hsl(var(--border))]">
                <Smartphone className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="font-semibold text-[hsl(var(--foreground))]">
                  Mobile Payment Details
                </h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-sm font-semibold">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('mobileNumber', e.target.value)}
                  placeholder="Enter your mobile number (e.g., 01712345678)"
                  type="tel"
                  required
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm">
                <span className="text-xl shrink-0">💡</span>
                <p className="text-blue-700 dark:text-blue-300">
                  You will receive a payment request on your mobile after placing the order. Please complete the payment within 15 minutes.
                </p>
              </div>

              {/* Supported providers */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium">
                  📱 bKash
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium">
                  📱 Nagad
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-medium">
                  📱 Rocket
                </div>
              </div>
            </div>
          )}

          {/* Cash on Delivery Info */}
          {formData.paymentMethod === 'cod' && (
            <div className="rounded-lg border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-br from-[hsl(var(--muted))]/30 to-transparent p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]">
                <Banknote className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="font-semibold text-[hsl(var(--foreground))]">
                  Cash on Delivery
                </h3>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-lg shrink-0">✅</span>
                  <p className="text-[hsl(var(--foreground))]">
                    Pay with cash when your order is delivered to your doorstep
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-lg shrink-0">💵</span>
                  <p className="text-[hsl(var(--foreground))]">
                    Please keep the exact amount ready for a smooth delivery experience
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-lg shrink-0">📦</span>
                  <p className="text-[hsl(var(--foreground))]">
                    Inspect your order before making the payment
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
                <p className="text-amber-700 dark:text-amber-300">
                  ⚠️ Additional ৳50 COD fee may apply
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" size="lg" onClick={onBack}>
              ← Back
            </Button>
            <Button 
              type="submit" 
              size="lg"
              disabled={!formData.paymentMethod}
            >
              Place Order →
            </Button>
          </div>
        </form>
      </div>

      {/* Security Badge */}
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
        <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Lock className="h-4 w-4" />
          <span>Secure SSL encrypted payment</span>
          <span className="text-[hsl(var(--border))]">•</span>
          <ShieldCheck className="h-4 w-4" />
          <span>PCI DSS compliant</span>
        </div>
      </div>
    </div>
  );
}
