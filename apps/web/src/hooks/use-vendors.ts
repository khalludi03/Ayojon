import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { Vendor } from '@/types';
import { orpc } from '@/utils/orpc';

export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

export function useVendors(
  options?: Omit<UseQueryOptions<Array<Vendor>>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.listVendors.queryOptions({
      ...options as any,
    })
  ) as any;
}

export function useVendor(
  slug: string,
  options?: Omit<UseQueryOptions<Vendor | undefined>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getVendorBySlug.queryOptions({
      input: { slug },
      enabled: !!slug,
      ...options as any,
    })
  ) as any;
}
