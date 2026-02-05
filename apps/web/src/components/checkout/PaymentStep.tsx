import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Banknote } from "lucide-react";

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
    },
    {
      id: 'mobile',
      label: 'Mobile Payment',
      icon: Smartphone,
      description: 'bKash, Nagad, Rocket',
    },
    {
      id: 'cod',
      label: 'Cash on Delivery',
      icon: Banknote,
      description: 'Pay when you receive',
    },
  ];

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
        Payment Information
      </h2>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        Choose your payment method and complete the details
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Payment Method *</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    formData.paymentMethod === method.id
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                  }`}
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
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <p className="text-sm font-semibold">{method.label}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {method.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Credit/Debit Card Details */}
        {formData.paymentMethod === 'card' && (
          <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name *</Label>
              <Input
                id="cardName"
                value={formData.cardName || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('cardName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  value={formData.expiryDate || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  value={formData.cvv || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Payment Details */}
        {formData.paymentMethod === 'mobile' && (
          <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('mobileNumber', e.target.value)}
                placeholder="+880 1234 567890"
                type="tel"
                required
              />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              You will receive a payment request on your mobile after placing the order.
            </p>
          </div>
        )}

        {/* Cash on Delivery Info */}
        {formData.paymentMethod === 'cod' && (
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
            <p className="text-sm text-[hsl(var(--foreground))]">
              You can pay with cash when your order is delivered. Please keep the exact amount ready.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" size="lg">
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
}
