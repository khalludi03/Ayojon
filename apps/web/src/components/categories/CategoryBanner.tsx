import * as LucideIcons from 'lucide-react';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryBannerProps {
  category: Category;
  className?: string;
}

export function CategoryBanner({ category, className }: CategoryBannerProps) {
  const Icon = category.icon ? LucideIcons[category.icon] : null;
  const hasImage = !!category.imageUrl;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10',
        className
      )}
    >
      {/* Background Image */}
      {hasImage && (
        <div className="absolute inset-0">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-8 text-center md:flex-row md:gap-6 md:text-left lg:px-12 lg:py-12">
        {/* Icon */}
        {Icon && (
          <div className="flex-shrink-0 rounded-full bg-primary/10 p-4 lg:p-6">
            <Icon className="h-12 w-12 text-primary lg:h-16 lg:w-16" strokeWidth={1.5} />
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold text-foreground lg:text-4xl">
            {category.name}
          </h1>

          {category.productCount !== undefined && (
            <p className="text-sm text-muted-foreground lg:text-base">
              {category.productCount.toLocaleString()} {category.productCount === 1 ? 'item' : 'items'} available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
