import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, CreditCard, Hash } from "lucide-react";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  transactionId: string;
  amount: number;
  paidAt: string;
  paymentMethod: string;
  cardType?: string;
  last4?: string;
  onBackToOrder: () => void;
}

export function PaymentSuccessModal({
  isOpen,
  transactionId,
  amount,
  paidAt,
  paymentMethod,
  cardType,
  last4,
  onBackToOrder,
}: PaymentSuccessModalProps) {
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl text-center">
              Payment Successful!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your {paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'card' ? 'card' : paymentMethod} payment has been processed successfully
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaction Details */}
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4 space-y-3">
            {/* Transaction ID */}
            <div className="flex items-start gap-3">
              <Hash className="h-5 w-5 text-[hsl(var(--muted-foreground))] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">
                  Transaction ID
                </p>
                <p className="font-mono text-sm font-semibold text-[hsl(var(--foreground))] break-all">
                  {transactionId}
                </p>
              </div>
            </div>

            {/* Amount Paid */}
            <div className="flex items-start gap-3 pt-3 border-t border-[hsl(var(--border))]">
              <CreditCard className="h-5 w-5 text-[hsl(var(--muted-foreground))] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">
                  Amount Paid
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ৳{amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-start gap-3 pt-3 border-t border-[hsl(var(--border))]">
              <Calendar className="h-5 w-5 text-[hsl(var(--muted-foreground))] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">
                  Payment Time
                </p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {formatDateTime(paidAt)}
                </p>
              </div>
            </div>

            {/* Card Details (only for card payments) */}
            {cardType && last4 && (
              <div className="flex items-start gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <CreditCard className="h-5 w-5 text-[hsl(var(--muted-foreground))] mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">
                    Payment Method
                  </p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {cardType} ending in {last4}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm text-center border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300">
              A confirmation email has been sent to your registered email address
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Button onClick={onBackToOrder} className="w-full" size="lg">
          Back to Order
        </Button>
      </DialogContent>
    </Dialog>
  );
}
