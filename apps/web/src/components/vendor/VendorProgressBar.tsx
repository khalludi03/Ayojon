import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = [
  { number: 1, title: 'Account', description: 'Login credentials' },
  { number: 2, title: 'Business Info', description: 'Company details' },
  { number: 3, title: 'Store Details', description: 'Shop information' },
  { number: 4, title: 'Verification', description: 'Upload documents' },
];

export function VendorProgressBar({ currentStep, totalSteps }: VendorProgressBarProps) {
  return (
    <div className="w-full">
      {/* Mobile View - Simplified */}
      <div className="block sm:hidden">
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-[hsl(var(--foreground))]">
            {STEP_LABELS[currentStep - 1]?.title}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {STEP_LABELS[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Desktop View - Detailed */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-[hsl(var(--muted))]">
            <div
              className="h-full bg-[hsl(var(--primary))] transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {STEP_LABELS.map((step) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              const isUpcoming = step.number > currentStep;

              return (
                <div key={step.number} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                      isCompleted &&
                        'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white',
                      isCurrent &&
                        'border-[hsl(var(--primary))] bg-[hsl(var(--background))] text-[hsl(var(--primary))]',
                      isUpcoming &&
                        'border-[hsl(var(--muted))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center max-w-[120px]">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        (isCurrent || isCompleted) &&
                          'text-[hsl(var(--foreground))]',
                        isUpcoming && 'text-[hsl(var(--muted-foreground))]'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
