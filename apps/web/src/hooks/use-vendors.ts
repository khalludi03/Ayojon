import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { Vendor } from '@/types';
import { vendorService } from '@/mock/services/product-service';

export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

export function useVendors(
  options?: Omit<UseQueryOptions<Array<Vendor>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: vendorKeys.lists(),
    queryFn: () => vendorService.getVendors(),
    ...options,
  });
}

export function useVendor(
  id: string,
  options?: Omit<UseQueryOptions<Vendor | undefined>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => vendorService.getVendorById(id),
    enabled: !!id,
    ...options,
  });
}
