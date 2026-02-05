import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

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
    "09:00 AM - 12:00 PM",
    "12:00 PM - 03:00 PM",
    "03:00 PM - 06:00 PM",
    "06:00 PM - 09:00 PM",
  ];

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <div className="flex items-start gap-3">
        <Calendar className="mt-1 h-6 w-6 text-[hsl(var(--primary))]" />
        <div>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
            Delivery Schedule
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Choose your preferred delivery date and time
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Delivery Date */}
        <div className="space-y-2">
          <Label htmlFor="deliveryDate">Delivery Date *</Label>
          <select
            id="deliveryDate"
            value={formData.deliveryDate}
            onChange={(e) => onFormChange('deliveryDate', e.target.value)}
            className="flex h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm ring-offset-background placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select a date</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Time */}
        <div className="space-y-2">
          <Label>Delivery Time Slot *</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {timeSlots.map((slot) => (
              <label
                key={slot}
                className={`flex cursor-pointer items-center justify-center rounded-md border-2 p-3 text-sm font-medium transition-colors ${
                  formData.deliveryTime === slot
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                    : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryTime"
                  value={slot}
                  checked={formData.deliveryTime === slot}
                  onChange={(e) => onFormChange('deliveryTime', e.target.value)}
                  className="sr-only"
                  required
                />
                {slot}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" size="lg">
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
