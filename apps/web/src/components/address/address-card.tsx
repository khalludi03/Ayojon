import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Phone, Edit, Trash2 } from 'lucide-react';
import type { Address } from '@/types/address';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string, isDefault: boolean) => void;
  showUseButton?: boolean;
  onUse?: (address: Address) => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  showUseButton,
  onUse,
}: AddressCardProps) {
  const fullAddress = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card
      className={`relative transition-all ${
        address.isDefault
          ? 'border-2 border-primary shadow-md'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {address.isDefault && (
        <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">
          Default
        </Badge>
      )}
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{address.name}</h3>
              <Badge variant="outline" className="mt-1">
                {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{address.phone}</span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
            <p className="flex-1">{fullAddress}</p>
          </div>

          {/* Actions */}
          {showUseButton ? (
            <Button
              className="w-full"
              onClick={() => onUse?.(address)}
            >
              Use This Address
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`default-${address.id}`}
                  checked={address.isDefault}
                  onCheckedChange={(checked) =>
                    onSetDefault(address.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={`default-${address.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as Default
                </label>
              </div>

              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(address)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(address.id)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
