import { cn } from '@/lib/utils';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

export type OrderStatus =
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'payment_received'
  | 'placed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

interface OrderTimelineProps {
  status: OrderStatus | string;
  className?: string;
}

const timelineSteps = [
  {
    key: 'placed',
    label: 'Order Placed',
    icon: Package,
    statuses: ['placed', 'awaiting_payment', 'payment_submitted', 'payment_received'],
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: CheckCircle2,
    statuses: ['payment_received', 'processing'],
  },
  {
    key: 'shipped',
    label: 'Shipped',
    icon: Truck,
    statuses: ['shipped'],
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: Check,
    statuses: ['delivered', 'vendor_paid', 'vendor_settled'],
  },
];

export function OrderTimeline({ status, className }: OrderTimelineProps) {
  const currentStatus = status.toLowerCase();

  if (currentStatus === 'cancelled') {
    return (
      <div className={cn("flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30", className)}>
        <XCircle className="h-6 w-6 text-red-600" />
        <div>
          <p className="font-bold text-red-900 dark:text-red-100">Order Cancelled</p>
          <p className="text-sm text-red-700 dark:text-red-300">This order has been cancelled and is no longer being processed.</p>
        </div>
      </div>
    );
  }

  // Determine current step index
  let currentStepIndex = -1;
  if (['placed', 'awaiting_payment', 'payment_submitted', 'payment_received'].includes(currentStatus)) {
    currentStepIndex = 0;
  } else if (['processing'].includes(currentStatus)) {
    currentStepIndex = 1;
  } else if (currentStatus === 'shipped') {
    currentStepIndex = 2;
  } else if (['delivered', 'vendor_paid', 'vendor_settled', 'cash_collected', 'settlement_ready'].includes(currentStatus)) {
    currentStepIndex = 3;
  }

  return (
    <div className={cn("w-full py-6", className)}>
      <div className="relative flex justify-between">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        
        {/* Progress Bar Active */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-0" 
          style={{ width: `${(Math.max(0, currentStepIndex) / (timelineSteps.length - 1)) * 100}%` }}
        />

        {timelineSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex || (index === 3 && currentStepIndex === 3);
          const isActive = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div 
                className={cn(
                  "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300 bg-white dark:bg-slate-950",
                  isCompleted ? "bg-primary border-primary text-white" : 
                  isActive ? "border-primary text-primary shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.1)]" : 
                  "border-slate-300 dark:border-slate-700 text-slate-400"
                )}
              >
                {isCompleted && index < 3 ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="mt-3 text-center">
                <p className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isCompleted || isActive ? "text-slate-900 dark:text-white" : "text-slate-400"
                )}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-[10px] text-primary font-medium mt-0.5">In Progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
