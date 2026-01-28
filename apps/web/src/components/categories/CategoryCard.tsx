import { Link } from '@tanstack/react-router';
import {
  Baby,
  BookOpen,
  Car,
  Download,
  Dumbbell,
  Home,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import type { Category, CategoryIconName } from '@/types';
import { cn } from '@/lib/utils';

const iconMap: Record<CategoryIconName, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  BookOpen,
  Dumbbell,
  ShoppingBasket,
  Baby,
  Car,
  Download,
};

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = iconMap[category.icon];

  return (
    <Link
      to={`/category/${category.slug}`}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-[hsl(var(--muted))]',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 transition-colors group-hover:bg-[hsl(var(--primary))]/20 md:h-20 md:w-20">
        <Icon className="h-7 w-7 text-[hsl(var(--primary))] md:h-8 md:w-8" />
      </div>
      <span className="text-center text-xs font-medium text-[hsl(var(--foreground))] md:text-sm">
        {category.name}
      </span>
    </Link>
  );
}
