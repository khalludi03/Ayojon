import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardPaymentFormProps {
  totalAmount: number;
  onPaymentSuccess: (
    transactionId: string,
    amount: number,
    paidAt: string,
    cardType: string,
    last4: string,
    cardHolderName: string,
    expiryDate: string,
    saveCard: boolean
  ) => void;
  onCancel: () => void;
}

type CardType = "visa" | "mastercard" | "unknown";

interface ValidationErrors {
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
}

export function CardPaymentForm({
  totalAmount,
  onPaymentSuccess,
  onCancel,
}: CardPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [cardType, setCardType] = useState<CardType>("unknown");
  const [globalError, setGlobalError] = useState("");

  // Luhn algorithm validation
  const validateLuhn = (cardNum: string): boolean => {
    const digits = cardNum.replace(/\D/g, "");
    if (digits.length !== 16) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Detect card type
  const detectCardType = (number: string): CardType => {
    const cleaned = number.replace(/\D/g, "");

    // Visa: starts with 4
    if (cleaned.startsWith("4")) {
      return "visa";
    }

    // Mastercard: starts with 51-55 or 2221-2720
    const firstTwo = cleaned.substring(0, 2);
    const firstFour = cleaned.substring(0, 4);

    if (
      (parseInt(firstTwo) >= 51 && parseInt(firstTwo) <= 55) ||
      (parseInt(firstFour) >= 2221 && parseInt(firstFour) <= 2720)
    ) {
      return "mastercard";
    }

    return "unknown";
  };

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.join(" ").substring(0, 19); // Max 16 digits + 3 spaces
  };

  // Validate expiry date
  const validateExpiryDate = (expiry: string): { valid: boolean; error?: string } => {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      return { valid: false, error: "Invalid expiry date" };
    }

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000; // Convert YY to YYYY

    if (month < 1 || month > 12) {
      return { valid: false, error: "Invalid expiry date" };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { valid: false, error: "Expired card" };
    }

    return { valid: true };
  };

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardType(detectCardType(formatted));

    // Clear error when user types
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  // Handle card holder name change
  const handleCardHolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only letters and spaces
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setCardHolderName(value.toUpperCase());

    if (errors.cardHolderName) {
      setErrors((prev) => ({ ...prev, cardHolderName: undefined }));
    }
  };

  // Handle expiry date change
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    // Auto-format MM/YY
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }

    setExpiryDate(value.substring(0, 5));

    if (errors.expiryDate) {
      setErrors((prev) => ({ ...prev, expiryDate: undefined }));
    }
  };

  // Handle CVV change
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 3);
    setCvv(value);

    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    setGlobalError("");

    // Validate card number
    const cleanedCardNumber = cardNumber.replace(/\D/g, "");
    if (cleanedCardNumber.length !== 16) {
      newErrors.cardNumber = "Invalid card number";
    } else if (!validateLuhn(cardNumber)) {
      newErrors.cardNumber = "Invalid card number";
    }

    // Validate card holder name
    if (!cardHolderName.trim()) {
      newErrors.cardHolderName = "Card holder name is required";
    }

    // Validate expiry date
    const expiryValidation = validateExpiryDate(expiryDate);
    if (!expiryValidation.valid) {
      newErrors.expiryDate = expiryValidation.error;
    }

    // Validate CVV
    if (cvv.length !== 3) {
      newErrors.cvv = "Invalid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle payment
  const handlePay = async () => {
    setGlobalError("");

    // Validate form
    if (!validateForm()) {
      setGlobalError("Invalid details. Please check and try again.");
      return;
    }

    // Check for test case: card declined (ends with 0000)
    const cleanedCardNumber = cardNumber.replace(/\D/g, "");
    if (cleanedCardNumber.endsWith("0000")) {
      setGlobalError("Card declined. Please try another card.");
      return;
    }

    // Show processing state
    setIsProcessing(true);

    try {
      // Simulate payment processing (2-3 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Generate transaction ID
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const transactionId = `CARD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${randomSuffix}`;
      const paidAt = new Date().toISOString();
      const last4 = cleanedCardNumber.slice(-4);

      // Call success handler
      onPaymentSuccess(
        transactionId,
        totalAmount,
        paidAt,
        cardType === "unknown" ? "CARD" : cardType.toUpperCase(),
        last4,
        cardHolderName,
        expiryDate,
        saveCard
      );
    } catch (error) {
      setGlobalError("Payment processing failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const cleanedCardNumber = cardNumber.replace(/\D/g, "");
    return (
      cleanedCardNumber.length === 16 &&
      cardHolderName.trim() !== "" &&
      expiryDate.length === 5 &&
      cvv.length === 3
    );
  };

  // Get card icon
  const getCardIcon = () => {
    if (cardType === "visa") {
      return (
        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
          VISA
        </div>
      );
    }
    if (cardType === "mastercard") {
      return (
        <div className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">
          MASTERCARD
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 rounded-lg border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-br from-[hsl(var(--muted))]/30 to-transparent p-5">
      <div className="flex items-center gap-2 pb-2 border-b border-[hsl(var(--border))]">
        <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h3 className="font-semibold text-[hsl(var(--foreground))]">
          Card Payment
        </h3>
      </div>

      {/* Global Error Message */}
      {globalError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-sm border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-300">{globalError}</p>
        </div>
      )}

      {/* Card Number */}
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-sm font-semibold">
          Card Number <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="cardNumber"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            type="text"
            maxLength={19}
            disabled={isProcessing}
            className={cn(
              "font-mono text-base pr-20",
              errors.cardNumber && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {cardNumber && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getCardIcon()}
            </div>
          )}
        </div>
        {errors.cardNumber && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.cardNumber}</p>
        )}
      </div>

      {/* Card Holder Name */}
      <div className="space-y-2">
        <Label htmlFor="cardHolderName" className="text-sm font-semibold">
          Card Holder Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cardHolderName"
          value={cardHolderName}
          onChange={handleCardHolderNameChange}
          placeholder="JOHN DOE"
          type="text"
          disabled={isProcessing}
          className={cn(
            "uppercase",
            errors.cardHolderName && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {errors.cardHolderName && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.cardHolderName}</p>
        )}
      </div>

      {/* Expiry Date and CVV */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expiryDate" className="text-sm font-semibold">
            Expiry Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="expiryDate"
            value={expiryDate}
            onChange={handleExpiryDateChange}
            placeholder="MM/YY"
            type="text"
            maxLength={5}
            disabled={isProcessing}
            className={cn(
              "font-mono",
              errors.expiryDate && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.expiryDate && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.expiryDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv" className="text-sm font-semibold">
            CVV <span className="text-red-500">*</span>
          </Label>
          <Input
            id="cvv"
            value={cvv}
            onChange={handleCvvChange}
            placeholder="123"
            type="password"
            maxLength={3}
            disabled={isProcessing}
            className={cn(
              "font-mono",
              errors.cvv && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.cvv && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Save Card Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="saveCard"
          checked={saveCard}
          onCheckedChange={(checked) => setSaveCard(checked === true)}
          disabled={isProcessing}
        />
        <Label
          htmlFor="saveCard"
          className="text-sm font-normal cursor-pointer"
        >
          Save card for future purchases
        </Label>
      </div>

      {/* Payment Info */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm border border-blue-200 dark:border-blue-800">
        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-blue-700 dark:text-blue-300 font-semibold">
            Amount to Pay: ৳{totalAmount.toFixed(2)}
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-xs">
            Your card will be charged securely
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
            <li>• Visa test: 4532 1488 0343 6467</li>
            <li>• Mastercard test: 5425 2334 3010 9903</li>
            <li>• Card ending in 0000 = Card declined error</li>
            <li>• Expiry must be future date (e.g., 12/26)</li>
            <li>• Any 3-digit CVV works</li>
          </ul>
        </div>
      )}

      {/* Pay Button */}
      <Button
        type="button"
        onClick={handlePay}
        disabled={isProcessing || !isFormValid()}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing payment...
          </>
        ) : (
          `Pay ৳${totalAmount.toFixed(2)}`
        )}
      </Button>

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
