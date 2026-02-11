import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Banknote, CreditCard, Lock, ShieldCheck, Smartphone, Wallet, Loader2, Info, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStepProps {
  onPlaceOrder: () => void;
  onBack: () => void;
  formData: {
    paymentMethod: string;
    cardNumber?: string;
    cardName?: string;
    expiryDate?: string;
    cvv?: string;
    mobileNumber?: string;
    bkashTransactionId?: string;
  };
  onFormChange: (field: string, value: string) => void;
  isSubmitting?: boolean;
  totalAmount: number;
}

export function PaymentStep({ 
  onPlaceOrder, 
  onBack, 
  formData, 
  onFormChange,
  isSubmitting = false,
  totalAmount
}: PaymentStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on payment method
    if (formData.paymentMethod === 'bkash') {
      if (!formData.mobileNumber || !formData.bkashTransactionId) {
        return;
      }
    }
    
    onPlaceOrder();
  };

  const unavailableMethods = new Set<string>();

  const paymentMethods = [
    {
      id: 'cod',
      label: 'Cash on Delivery (COD)',
      icon: Banknote,
      description: 'Pay when you receive your order',
      fee: 0,
      badge: '✨ Popular',
    },
    {
      id: 'bkash',
      label: 'bKash',
      icon: Wallet,
      description: 'Pay via bKash mobile wallet',
      fee: 0,
      badge: '⚡ Instant',
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-base font-semibold">
                Select Payment Method <span className="text-red-500">*</span>
              </Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="link" className="h-auto p-0 text-sm">
                    Payment Terms
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Payment Terms & Conditions</DialogTitle>
                    <DialogDescription>
                      Please review the payment terms before completing your order.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                    <p>• All payments are processed securely and encrypted.</p>
                    <p>• Mobile wallet payments must be completed within 15 minutes.</p>
                    <p>• Card payments may require OTP or 3D Secure verification.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = formData.paymentMethod === method.id;
                const isAvailable = !unavailableMethods.has(method.id);

                return (
                  <label
                    key={method.id}
                    className={cn(
                      "group relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 p-5 transition-all duration-200",
                      !isAvailable && "cursor-not-allowed opacity-60",
                      isSelected && isAvailable
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-md scale-[1.02]'
                        : isAvailable
                        ? 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50'
                        : 'border-[hsl(var(--border))]'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={isSelected}
                      onChange={(e) => onFormChange('paymentMethod', e.target.value)}
                      className="sr-only"
                      required
                      disabled={!isAvailable}
                    />
                    <Icon
                      className={cn(
                        "h-8 w-8 transition-colors",
                        isSelected ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
                      )}
                    />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {method.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                        {method.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                        <span className="rounded-full bg-[hsl(var(--muted))]/50 px-2 py-0.5 font-medium text-[hsl(var(--foreground))]">
                          {method.fee > 0 ? `+৳${method.fee} fee` : 'No extra fee'}
                        </span>
                        <span className="font-medium text-[hsl(var(--primary))]">
                          {method.badge}
                        </span>
                      </div>
                    </div>

                    {isSelected && isAvailable && (
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

            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
              Some items may restrict payment methods. Unavailable options will appear disabled.
            </div>
          </div>

          {/* bKash Payment Info */}
          {formData.paymentMethod === 'bkash' && (
            <div className="space-y-6 rounded-lg border-2 border-indigo-200 bg-indigo-50/30 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2 pb-2 border-b border-indigo-100 dark:border-indigo-800">
                <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-indigo-900 dark:text-indigo-100">
                  Manual bKash Payment
                </h3>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Instructions</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please send <strong>৳{totalAmount.toLocaleString()}</strong> to our merchant bKash number below using "Send Money" or "Payment", then provide the details.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded text-center">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Merchant bKash Number</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">01700-000000</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-sm font-bold">Your bKash Number *</Label>
                  <Input
                    id="mobileNumber"
                    value={formData.mobileNumber || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('mobileNumber', e.target.value)}
                    placeholder="017XXXXXXXX"
                    type="tel"
                    className="bg-white dark:bg-slate-900"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bkashTransactionId" className="text-sm font-bold">Transaction ID (TrxID) *</Label>
                  <Input
                    id="bkashTransactionId"
                    value={formData.bkashTransactionId || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('bkashTransactionId', e.target.value.toUpperCase())}
                    placeholder="8N7A6D5C4B"
                    className="font-mono uppercase bg-white dark:bg-slate-900"
                    required
                  />
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
                  ⚠️ Additional ৳50 COD fee applies
                </p>
              </div>
            </div>
          )}

          {/* Proceed Information */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-center text-slate-600 dark:text-slate-400 font-medium">
              {formData.paymentMethod === 'bkash' 
                ? "Click below after entering your payment details to complete the order."
                : formData.paymentMethod === 'cod'
                ? "You will pay the total amount at your doorstep when you receive the items."
                : "Select a payment method above to continue."}
            </p>
          </div>
        </form>
      </div>

      {/* Action Buttons - Moved outside for better visibility */}
      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-between items-center">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto h-12 px-8 order-2 sm:order-1">
          ← Back to Review
        </Button>
        
        <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto order-1 sm:order-2">
          {!formData.paymentMethod && (
            <p className="text-xs font-bold text-destructive animate-pulse">
              Please select a payment method above
            </p>
          )}
          {formData.paymentMethod === 'bkash' && (!formData.mobileNumber || !formData.bkashTransactionId) && (
            <p className="text-xs font-bold text-destructive">
              Please enter TrxID and Mobile Number
            </p>
          )}
          
          <Button 
            type="button" 
            size="lg"
            onClick={handleSubmit}
            className={cn(
              "w-full sm:w-auto px-16 text-lg font-black h-14 transition-all duration-300",
              formData.paymentMethod 
                ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-[0_8px_25px_-4px_rgba(249,115,22,0.4)] scale-105"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
            disabled={!formData.paymentMethod || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Complete Order
                <ShieldCheck className="ml-3 h-5 w-5" />
              </>
            )}
          </Button>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            <Lock className="h-3 w-3" />
            SSL Secure Checkout
          </div>
        </div>
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
