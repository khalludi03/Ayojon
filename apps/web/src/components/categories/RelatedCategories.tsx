import { useState, useEffect } from 'react';
import { orpc } from '@/utils/orpc';
import { CategoryCard } from './CategoryCard';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface RelatedCategoriesProps {
  currentCategoryId: string;
  limit?: number;
  className?: string;
}

export function RelatedCategories({
  currentCategoryId,
  limit = 6,
  className,
}: RelatedCategoriesProps) {
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);

  useEffect(() => {
    (orpc.categories.list.call() as Promise<Category[]>).then((categories) => {
      setRelatedCategories(
        categories.filter((c) => c.id !== currentCategoryId).slice(0, limit)
      );
    });
  }, [currentCategoryId, limit]);

  if (relatedCategories.length === 0) return null;

  return (
    <section className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Related Categories</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {relatedCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
