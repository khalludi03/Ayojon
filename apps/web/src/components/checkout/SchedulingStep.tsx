import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulingStepProps {
  onNext: () => void;
  onBack: () => void;
  formData: {
    deliveryDate: string;
    deliveryTime: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export function SchedulingStep({ 
  onNext, 
  onBack, 
  formData, 
  onFormChange 
}: SchedulingStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.deliveryDate && formData.deliveryTime) {
      onNext();
    }
  };

  // Generate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1); // Start from tomorrow
    return date.toISOString().split('T')[0];
  });

  const timeSlots = [
    { value: "09:00 AM - 12:00 PM", icon: "🌅", label: "Morning" },
    { value: "12:00 PM - 03:00 PM", icon: "☀️", label: "Afternoon" },
    { value: "03:00 PM - 06:00 PM", icon: "🌤️", label: "Evening"},
    { value: "06:00 PM - 09:00 PM", icon: "🌙", label: "Night" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))]/20 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[hsl(var(--primary))]/10 p-3">
            <Calendar className="h-6 w-6 text-[hsl(var(--primary))]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Delivery Schedule
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Choose your preferred delivery date and time
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Date */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
              <Label htmlFor="deliveryDate" className="text-base font-semibold">
                Select Delivery Date <span className="text-red-500">*</span>
              </Label>
            </div>
            <select
              id="deliveryDate"
              value={formData.deliveryDate}
              onChange={(e) => onFormChange('deliveryDate', e.target.value)}
              className="flex h-12 w-full rounded-lg border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] ring-offset-background placeholder:text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&:-webkit-autofill]:!bg-[hsl(var(--background))] [&:-webkit-autofill]:shadow-[0_0_0_100px_hsl(var(--background))_inset]"
              required
            >
              <option value="">📅 Choose your delivery date</option>
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const isToday = dateObj.toDateString() === new Date().toDateString();
                const isTomorrow = dateObj.toDateString() === new Date(Date.now() + 86400000).toDateString();
                
                let prefix = '';
                if (isToday) prefix = '🚀 Today - ';
                else if (isTomorrow) prefix = '⚡ Tomorrow - ';
                
                return (
                  <option key={date} value={date}>
                    {prefix}{dateObj.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Free delivery available for orders above ৳999
            </p>
          </div>

          {/* Delivery Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[hsl(var(--primary))]" />
              <Label className="text-base font-semibold">
                Select Time Slot <span className="text-red-500">*</span>
              </Label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {timeSlots.map((slot) => (
                <label
                  key={slot.value}
                  className={cn(
                    "group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200",
                    formData.deliveryTime === slot.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-md scale-[1.02]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/50'
                  )}
                >
                  <input
                    type="radio"
                    name="deliveryTime"
                    value={slot.value}
                    checked={formData.deliveryTime === slot.value}
                    onChange={(e) => onFormChange('deliveryTime', e.target.value)}
                    className="sr-only"
                    required
                  />
                  <span className="text-3xl">{slot.icon}</span>
                  <div className="text-center">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      {slot.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">
                      {slot.value}
                    </p>
                  </div>
                  
                  {/* Selected indicator */}
                  {formData.deliveryTime === slot.value && (
                    <div className="absolute right-2 top-2 rounded-full bg-[hsl(var(--primary))] p-1">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              💡 Our delivery team will contact you 30 minutes before arrival
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" size="lg" onClick={onBack}>
              ← Back
            </Button>
            <Button 
              type="submit" 
              size="lg"
              disabled={!formData.deliveryDate || !formData.deliveryTime}
            >
              Continue to Payment →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
