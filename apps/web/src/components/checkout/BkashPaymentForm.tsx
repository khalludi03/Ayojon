import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BkashPaymentFormProps {
  totalAmount: number;
  onPaymentSuccess: (transactionId: string, mobileNumber: string, amount: number, paidAt: string) => void;
  onCancel: () => void;
}

export function BkashPaymentForm({
  totalAmount,
  onPaymentSuccess,
  onCancel,
}: BkashPaymentFormProps) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const validateMobileNumber = (number: string): boolean => {
    // Must be exactly 11 digits and only numeric
    const cleaned = number.replace(/\D/g, "");
    return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
  };

  const handleSendOtp = () => {
    setError("");

    // Validate mobile number
    if (!validateMobileNumber(mobileNumber)) {
      setError("Invalid bKash number (must be 11 digits)");
      return;
    }

    // Simulate OTP send (mock)
    setOtpSent(true);
  };

  const handleVerifyAndPay = async () => {
    setError("");

    // Validate OTP
    const cleanedOtp = otp.replace(/\D/g, "");
    if (!cleanedOtp || cleanedOtp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    // Test cases for mock errors
    if (cleanedOtp === "000000") {
      setError("OTP mismatch. Please try again");
      return;
    }

    if (cleanedOtp === "111111") {
      setError("Insufficient balance");
      return;
    }

    // Show loading state
    setIsProcessing(true);

    // Simulate payment processing (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate transaction ID
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const transactionId = `BKASH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${randomSuffix}`;
    const paidAt = new Date().toISOString();

    // Call success handler
    onPaymentSuccess(transactionId, mobileNumber, totalAmount, paidAt);
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      setMobileNumber(value);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-br from-[hsl(var(--muted))]/30 to-transparent p-5">
      <div className="flex items-center gap-2 pb-2 border-b border-[hsl(var(--border))]">
        <Smartphone className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h3 className="font-semibold text-[hsl(var(--foreground))]">
          bKash Payment
        </h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Mobile Number Input */}
      <div className="space-y-2">
        <Label htmlFor="bkashMobile" className="text-sm font-semibold">
          bKash Mobile Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="bkashMobile"
          value={mobileNumber}
          onChange={handleMobileNumberChange}
          placeholder="01712345678"
          type="tel"
          maxLength={11}
          disabled={isProcessing}
          className={cn(
            "font-mono text-base",
            error && error.includes("Invalid bKash number") && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Enter your 11-digit bKash mobile number
        </p>
      </div>

      {/* Send OTP Button */}
      {!otpSent && (
        <Button
          type="button"
          onClick={handleSendOtp}
          disabled={isProcessing || !mobileNumber}
          className="w-full"
        >
          Send OTP
        </Button>
      )}

      {/* OTP Section */}
      {otpSent && (
        <>
          {/* OTP Sent Message */}
          <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-green-700 dark:text-green-300">
              OTP sent to your number ending with {mobileNumber.slice(-4)}
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-2">
            <Label htmlFor="bkashOtp" className="text-sm font-semibold">
              Enter OTP <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bkashOtp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              type="text"
              maxLength={6}
              disabled={isProcessing}
              className={cn(
                "font-mono text-base text-center tracking-widest",
                error && error.includes("OTP") && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Enter the 6-digit OTP sent to your mobile
            </p>
          </div>

          {/* Verify & Pay Button */}
          <Button
            type="button"
            onClick={handleVerifyAndPay}
            disabled={isProcessing || !otp}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing payment...
              </>
            ) : (
              "Verify & Pay"
            )}
          </Button>

          {/* Resend OTP */}
          <Button
            type="button"
            variant="link"
            onClick={handleSendOtp}
            disabled={isProcessing}
            className="w-full"
          >
            Didn't receive OTP? Resend
          </Button>
        </>
      )}

      {/* Payment Info */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm border border-blue-200 dark:border-blue-800">
        <span className="text-xl shrink-0">💡</span>
        <div className="space-y-1">
          <p className="text-blue-700 dark:text-blue-300 font-semibold">
            Amount to Pay: ৳{totalAmount.toFixed(2)}
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-xs">
            Please complete the payment within 15 minutes
          </p>
        </div>
      </div>

      {/* Test Instructions (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-xs border border-amber-200 dark:border-amber-800">
          <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
            Test Cases (Development Only):
          </p>
          <ul className="space-y-0.5 text-amber-700 dark:text-amber-400">
            <li>• Any valid 11-digit number works</li>
            <li>• Any 6-digit OTP (except test cases) is accepted</li>
            <li>• OTP 000000 = OTP mismatch error</li>
            <li>• OTP 111111 = Insufficient balance error</li>
          </ul>
        </div>
      )}

      {/* Cancel Button */}
      {!isProcessing && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full"
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
