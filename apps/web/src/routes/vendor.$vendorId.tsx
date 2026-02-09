import { createFileRoute, notFound } from '@tanstack/react-router';
import { useVendor } from '@/hooks/use-vendors';
import { VendorStorePage } from '@/components/vendor/VendorStorePage';
import Loader from '@/components/loader';
import { z } from 'zod';

const searchParamsSchema = z.object({
  category: z.union([z.string(), z.array(z.string())]).optional(),
  sort: z.string().optional(),
});

export const Route = createFileRoute('/vendor/$vendorId')({
  component: RouteComponent,
  validateSearch: searchParamsSchema,
});

function RouteComponent() {
  const { vendorId } = Route.useParams();
  const search = Route.useSearch();
  const { data: vendor, isLoading } = useVendor(vendorId);

  const categoryIds = typeof search.category === 'string' 
    ? [search.category] 
    : search.category;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!vendor) {
    throw notFound();
  }

  return (
    <VendorStorePage 
      vendor={vendor} 
      initialCategoryIds={categoryIds} 
      initialSort={search.sort as any} 
    />
  );
}
