import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Truck, Zap, Clock, Package, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart-store";

interface DeliveryMethodStepProps {
  onNext: () => void;
  onBack: () => void;
  formData: {
    deliveryMethod: string;
  };
  onFormChange: (field: string, value: string) => void;
}

type DeliveryMethod = {
  id: string;
  name: string;
  duration: string;
  description: string;
  cost: number;
  freeThreshold?: number;
  icon: typeof Truck;
  iconColor: string;
  timeRestriction?: string;
  estimatedDays: { min: number; max: number };
};

export function DeliveryMethodStep({ 
  onNext, 
  onBack, 
  formData, 
  onFormChange 
}: DeliveryMethodStepProps) {
  const { getSubtotal } = useCart();
  const subtotal = getSubtotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.deliveryMethod) {
      onNext();
    }
  };

  // Calculate estimated delivery date
  const getEstimatedDate = (method: DeliveryMethod) => {
    const today = new Date();
    const minDate = new Date(today);
    const maxDate = new Date(today);
    
    minDate.setDate(today.getDate() + method.estimatedDays.min);
    maxDate.setDate(today.getDate() + method.estimatedDays.max);

    if (method.estimatedDays.min === method.estimatedDays.max) {
      return minDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    return `${minDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${maxDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;
  };

  // Check if same-day delivery is available (before 12 PM)
  const isSameDayAvailable = () => {
    const now = new Date();
    return now.getHours() < 12;
  };

  const deliveryMethods: DeliveryMethod[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      duration: '3-5 Business Days',
      description: 'Perfect for regular orders',
      cost: 50,
      freeThreshold: 1000,
      icon: Package,
      iconColor: 'from-blue-500 to-blue-600',
      estimatedDays: { min: 3, max: 5 },
    },
    {
      id: 'express',
      name: 'Express Delivery',
      duration: '1-2 Business Days',
      description: 'Faster delivery for urgent needs',
      cost: 100,
      icon: Zap,
      iconColor: 'from-orange-500 to-red-500',
      estimatedDays: { min: 1, max: 2 },
    },
    {
      id: 'same-day',
      name: 'Same-Day Delivery',
      duration: 'Today',
      description: 'Get it delivered within hours',
      cost: 150,
      icon: Clock,
      iconColor: 'from-purple-500 to-pink-500',
      timeRestriction: 'Order before 12 PM',
      estimatedDays: { min: 0, max: 0 },
    },
  ];

  const getCost = (method: DeliveryMethod) => {
    if (method.id === 'standard' && method.freeThreshold && subtotal >= method.freeThreshold) {
      return 0;
    }
    return method.cost;
  };

  const isMethodAvailable = (method: DeliveryMethod) => {
    if (method.id === 'same-day') {
      return isSameDayAvailable();
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))]/20 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-3">
            <Truck className="h-6 w-6 text-[hsl(var(--primary))]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Delivery Method
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Choose how quickly you want to receive your order
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Methods */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Select Delivery Method <span className="text-red-500">*</span>
            </Label>
            
            <div className="grid gap-4">
              {deliveryMethods.map((method) => {
                const cost = getCost(method);
                const isAvailable = isMethodAvailable(method);
                const isSelected = formData.deliveryMethod === method.id;
                const Icon = method.icon;

                return (
                  <label
                    key={method.id}
                    className={cn(
                      "group relative flex cursor-pointer flex-col rounded-xl border-2 p-5 transition-all duration-200",
                      !isAvailable && "cursor-not-allowed opacity-60",
                      isSelected && isAvailable
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-md scale-[1.01]'
                        : isAvailable
                        ? 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50'
                        : 'border-[hsl(var(--border))]'
                    )}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.id}
                      checked={isSelected}
                      onChange={(e) => onFormChange('deliveryMethod', e.target.value)}
                      className="sr-only"
                      required
                      disabled={!isAvailable}
                    />
                    
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-md",
                        method.iconColor
                      )}>
                        <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                              {method.name}
                            </h3>
                            <p className="mt-0.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              {method.duration}
                            </p>
                          </div>
                          
                          {/* Cost Badge */}
                          <div className="text-right">
                            {cost === 0 ? (
                              <div className="rounded-full bg-green-100 px-3 py-1 dark:bg-green-950">
                                <span className="text-sm font-bold text-green-700 dark:text-green-300">FREE</span>
                              </div>
                            ) : (
                              <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                                ৳{cost}
                              </p>
                            )}
                            {method.id === 'standard' && method.freeThreshold && subtotal < method.freeThreshold && (
                              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                                Free over ৳{method.freeThreshold}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                          {method.description}
                        </p>

                        {/* Estimated Delivery */}
                        {isAvailable && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))]/30 px-3 py-2">
                            <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
                            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                              Estimated: {getEstimatedDate(method)}
                            </span>
                          </div>
                        )}

                        {/* Time Restriction */}
                        {method.timeRestriction && !isAvailable && (
                          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-2">
                            <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                              Not available - {method.timeRestriction}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && isAvailable && (
                        <div className="absolute right-4 top-4 rounded-full bg-[hsl(var(--primary))] p-1.5">
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Info Notice */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  💡 Delivery Information
                </p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Business days exclude weekends and public holidays</li>
                  <li>• You'll receive tracking updates via SMS and email</li>
                  <li>• Contact support for special delivery requests</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" size="lg" onClick={onBack}>
              ← Back
            </Button>
            <Button 
              type="submit" 
              size="lg"
              disabled={!formData.deliveryMethod}
            >
              Continue to Payment →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
