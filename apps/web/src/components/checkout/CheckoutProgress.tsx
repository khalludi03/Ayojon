import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Shipping", description: "Delivery address" },
  { number: 2, label: "Delivery", description: "Method" },
  { number: 3, label: "Payment", description: "Payment method" },
  { number: 4, label: "Review", description: "Confirm details" },
  { number: 5, label: "Confirmation", description: "Order complete" },
];

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="w-full bg-gradient-to-b from-[hsl(var(--muted))]/30 to-transparent py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Desktop Progress */}
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-1 items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                    currentStep > step.number
                      ? "border-green-500 bg-green-500 shadow-lg shadow-green-500/30"
                      : currentStep === step.number
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/30 scale-110"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="h-6 w-6 text-white" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        "text-base font-bold",
                        currentStep === step.number
                          ? "text-white"
                          : "text-[hsl(var(--muted-foreground))]"
                      )}
                    >
                      {step.number}
                    </span>
                  )}
                  {/* Active pulse effect */}
                  {currentStep === step.number && (
                    <span className="absolute inset-0 rounded-full border-2 border-[hsl(var(--primary))] animate-ping opacity-75" />
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-semibold transition-colors",
                      currentStep >= step.number
                        ? "text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--muted-foreground))]"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="relative mx-3 h-0.5 flex-1">
                  <div className="absolute inset-0 bg-[hsl(var(--border))]" />
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r transition-all duration-500",
                      currentStep > step.number
                        ? "from-green-500 to-green-500 w-full"
                        : currentStep === step.number
                          ? "from-[hsl(var(--primary))] to-[hsl(var(--primary))] w-1/2"
                          : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Progress */}
        <div className="sm:hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                Step {currentStep} of {steps.length}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {steps[currentStep - 1]?.label} - {steps[currentStep - 1]?.description}
              </p>
            </div>
            <div className="flex -space-x-1">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={cn(
                    "h-2 w-2 rounded-full border-2 border-[hsl(var(--background))] transition-all duration-300",
                    currentStep > step.number
                      ? "bg-green-500"
                      : currentStep === step.number
                        ? "bg-[hsl(var(--primary))] scale-125"
                        : "bg-[hsl(var(--muted))]"
                  )}
                />
              ))}
            </div>
          </div>
          {/* Mobile progress bar */}
          <div className="relative h-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
