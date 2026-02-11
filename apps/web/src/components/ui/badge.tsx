import * as React from 'react';
import {  cva } from 'class-variance-authority';
import type {VariantProps} from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
        secondary:
          'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
        destructive:
          'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]',
        outline:
          'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
        // E-commerce specific variants
        discount:
          'bg-red-600 text-white font-bold shadow-md',
        deal:
          'bg-red-500 text-white',
        choice:
          'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
        verified:
          'bg-blue-500 text-white',
        new:
          'bg-green-500 text-white',
        topSeller:
          'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
        freeShipping:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
        lowStock:
          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
        outOfStock:
          'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Discount badge with percentage
interface DiscountBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  percentage: number;
}

function DiscountBadge({ percentage, className, ...props }: DiscountBadgeProps) {
  return (
    <Badge variant="discount" className={cn('text-sm px-3 py-1', className)} {...props}>
      {Math.round(percentage)}% OFF
    </Badge>
  );
}

// Product badge based on badge type
interface ProductBadgeProps extends Omit<BadgeProps, 'variant'> {
  type: 'choice' | 'top_seller' | 'new' | 'verified';
}

const badgeTypeMap: Record<ProductBadgeProps['type'], { variant: BadgeProps['variant']; label: string }> = {
  choice: { variant: 'choice', label: 'Ayojon Choice' },
  top_seller: { variant: 'topSeller', label: 'Top Seller' },
  new: { variant: 'new', label: 'New' },
  verified: { variant: 'verified', label: 'Verified' },
};

function ProductBadge({ type, className, ...props }: ProductBadgeProps) {
  const { variant, label } = badgeTypeMap[type];
  return (
    <Badge variant={variant} className={className} {...props}>
      {label}
    </Badge>
  );
}

// Stock status badge
interface StockBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  quantity?: number;
}

function StockBadge({ status, quantity, className, ...props }: StockBadgeProps) {
  const config: Record<StockBadgeProps['status'], { variant: BadgeProps['variant']; label: string; icon: React.ReactNode }> = {
    in_stock: { variant: 'freeShipping', label: 'In Stock', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    low_stock: { variant: 'lowStock', label: quantity ? `Only ${quantity} left` : 'Low Stock', icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
    out_of_stock: { variant: 'outOfStock', label: 'Out of Stock', icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
  };

  const { variant, label, icon } = config[status];
  return (
    <Badge variant={variant} className={cn('flex items-center', className)} {...props}>
      {icon}
      {label}
    </Badge>
  );
}

export { Badge, badgeVariants, DiscountBadge, ProductBadge, StockBadge };
