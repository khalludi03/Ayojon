import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ShippingStepProps {
  onNext: () => void;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export function ShippingStep({ onNext, formData, onFormChange }: ShippingStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (
      formData.fullName && 
      formData.email && 
      formData.phone && 
      formData.address && 
      formData.city
    ) {
      onNext();
    }
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
        Shipping Information
      </h2>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        Enter your delivery address details
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('fullName', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('phone', e.target.value)}
              placeholder="+880 1234 567890"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('email', e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Street Address *</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onFormChange('address', e.target.value)}
            placeholder="House/Flat No., Road, Area"
            rows={3}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('city', e.target.value)}
              placeholder="Dhaka"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormChange('postalCode', e.target.value)}
              placeholder="1200"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Continue to Delivery
          </Button>
        </div>
      </form>
    </div>
  );
}
